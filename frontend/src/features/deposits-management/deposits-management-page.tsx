import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Check, ThumbsUp, X } from 'lucide-react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess, hasLimitedAccess } from '@/lib/rbac'
import { apiClient } from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileDepositsList } from '@/features/deposits-management/components/mobile-deposits-list'
import { MobileDepositsForm } from '@/features/deposits-management/components/mobile-deposits-form'

// Types
interface Deposit {
  id: number
  spbu_id: number
  operator_id: number | null
  amount: string
  payment_method: 'cash' | 'transfer' | 'check'
  status: 'pending' | 'approved' | 'rejected'
  deposit_date: string
  created_at: string
  updated_at: string
  SPBU?: {
    name: string
    code: string
  }
  operator?: {
    name: string
  }
  depositor_approver?: {
    name: string
  }
  depositor_rejector?: {
    name: string
  }
}

// API functions
const fetchDeposits = async (): Promise<Deposit[]> => {
  try {
    const response = await apiClient.get('/api/deposits')
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching deposits:', error)
    throw error
  }
}

const createDeposit = async (depositData: any): Promise<Deposit> => {
  try {
    const response = await apiClient.post('/api/deposits', depositData)
    return response.data.data
  } catch (error: any) {
    console.error('Error creating deposit:', error)
    throw error
  }
}

const approveDeposit = async (id: number): Promise<Deposit> => {
  try {
    const response = await apiClient.put(`/api/deposits/${id}/approve`)
    return response.data.data
  } catch (error: any) {
    console.error('Error approving deposit:', error)
    throw error
  }
}

const rejectDeposit = async (id: number): Promise<Deposit> => {
  try {
    const response = await apiClient.put(`/api/deposits/${id}/reject`)
    return response.data.data
  } catch (error: any) {
    console.error('Error rejecting deposit:', error)
    throw error
  }
}

const DepositsManagementPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore().auth
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const isMobile = useIsMobile()

  // Check if user has access to deposits management
  const userHasAccess = user ? hasAccess(user, 'deposits') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'deposits') : false
  const userHasLimitedAccess = user ? hasLimitedAccess(user, 'deposits') && !userHasFullAccess : false
  const canCreateDeposits = userHasFullAccess || userHasLimitedAccess
  const canApproveDeposits = userHasFullAccess
  const isReadOnly = !userHasFullAccess && !userHasLimitedAccess

  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])

  // Fetch data
  const { data: deposits = [], isLoading: depositsLoading, isError: depositsError } = useQuery({
    queryKey: ['deposits'],
    queryFn: fetchDeposits,
    enabled: userHasAccess
  })

  // Filter deposits based on search term
  const filteredDeposits = deposits.filter(deposit => 
    deposit.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (deposit.SPBU?.name && deposit.SPBU.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (deposit.SPBU?.code && deposit.SPBU.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (deposit.operator?.name && deposit.operator.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Mutations
  const createDepositMutation = useMutation({
    mutationFn: createDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
      toast.success('Deposit created successfully')
      setIsCreateDialogOpen(false)
      // Reset form
      setCreateFormData({
        amount: 0,
        paymentMethod: 'cash',
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create deposit')
    }
  })

  const approveDepositMutation = useMutation({
    mutationFn: approveDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
      toast.success('Deposit approved successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve deposit')
    }
  })

  const rejectDepositMutation = useMutation({
    mutationFn: rejectDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
      toast.success('Deposit rejected successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject deposit')
    }
  })

  // Form states
  const [createFormData, setCreateFormData] = useState({
    amount: 0,
    paymentMethod: 'cash',
  })

  // Handle create form changes
  const handleCreateFormChange = (field: string, value: string | number) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle create deposit
  const handleCreateDeposit = () => {
    // Validate required fields
    if (parseFloat(createFormData.amount.toString()) <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }
    
    createDepositMutation.mutate(createFormData)
  }

  // Handle approve deposit
  const handleApproveDeposit = (id: number, reason?: string) => {
    // In a real implementation, you would pass the reason to the API
    console.log('Approve reason:', reason);
    if (window.confirm('Are you sure you want to approve this deposit?')) {
      approveDepositMutation.mutate(id)
    }
  }

  // Handle reject deposit
  const handleRejectDeposit = (id: number, reason?: string) => {
    // In a real implementation, you would pass the reason to the API
    console.log('Reject reason:', reason);
    if (window.confirm('Are you sure you want to reject this deposit?')) {
      rejectDepositMutation.mutate(id)
    }
  }

  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }

  // Mobile view
  if (isMobile) {
    // If we're creating a deposit, show the mobile form
    if (isCreateDialogOpen && canCreateDeposits) {
      return (
        <div className="space-y-6">
          <MobileDepositsForm
            formData={createFormData}
            isLoading={createDepositMutation.isPending}
            onChange={handleCreateFormChange}
            onSubmit={handleCreateDeposit}
            onCancel={() => setIsCreateDialogOpen(false)}
            canCreateDeposits={canCreateDeposits}
          />
        </div>
      )
    }
    
    // Otherwise, show the mobile deposits list
    return (
      <div className="flex flex-col gap-6 w-full">
        <MobileDepositsList
          deposits={filteredDeposits}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddDeposit={() => setIsCreateDialogOpen(true)}
          onApproveDeposit={handleApproveDeposit}
          onRejectDeposit={handleRejectDeposit}
          isLoading={depositsLoading}
          isError={depositsError}
          canCreateDeposits={canCreateDeposits}
          canApproveDeposits={canApproveDeposits}
          isReadOnly={isReadOnly}
        />
      </div>
    )
  }

  if (depositsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading deposits...</span>
      </div>
    )
  }

  if (depositsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Deposits</div>
          <div className="text-gray-600 mb-4">Failed to load deposits data. Please try again later.</div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['deposits'] })}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deposits Management</h1>
          <p className="text-muted-foreground">
            {isReadOnly 
              ? 'View deposits in the system' 
              : canCreateDeposits && !canApproveDeposits
                ? 'Manage deposits - You can create deposits only'
                : canApproveDeposits
                  ? 'Manage deposits - You can create and approve/reject deposits'
                  : 'Manage deposits'}
          </p>
        </div>
        {canCreateDeposits && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Deposit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Deposit</DialogTitle>
                <DialogDescription>
                  Add a new deposit. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={createFormData.amount}
                    onChange={(e) => handleCreateFormChange('amount', parseFloat(e.target.value) || 0)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payment_method" className="text-right">
                    Payment Method
                  </Label>
                  <Select
                    value={createFormData.paymentMethod}
                    onValueChange={(value) => handleCreateFormChange('paymentMethod', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDeposit}
                  disabled={createDepositMutation.isPending}
                >
                  {createDepositMutation.isPending ? 'Creating...' : 'Create Deposit'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposits</CardTitle>
          <CardDescription>
            {isReadOnly 
              ? 'View all deposits in the system' 
              : canCreateDeposits && !canApproveDeposits
                ? 'Manage all deposits in the system - You can create deposits only'
                : canApproveDeposits
                  ? 'Manage all deposits in the system - You can create and approve/reject deposits'
                  : 'Manage all deposits in the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search deposits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>SPBU</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Rejected By</TableHead>
                {canApproveDeposits && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canApproveDeposits ? 9 : 8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">No deposits found</div>
                      {searchTerm && (
                        <div className="text-sm text-gray-500">
                          No deposits match your search for "{searchTerm}"
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell className="font-medium">
                      {new Date(deposit.deposit_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {deposit.SPBU ? `${deposit.SPBU.name} (${deposit.SPBU.code})` : '-'}
                    </TableCell>
                    <TableCell>{deposit.operator ? deposit.operator.name : '-'}</TableCell>
                    <TableCell>{parseFloat(deposit.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      {deposit.payment_method.charAt(0).toUpperCase() + deposit.payment_method.slice(1)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        deposit.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : deposit.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{deposit.depositor_approver ? deposit.depositor_approver.name : '-'}</TableCell>
                    <TableCell>{deposit.depositor_rejector ? deposit.depositor_rejector.name : '-'}</TableCell>
                    {canApproveDeposits && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {deposit.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveDeposit(deposit.id)}
                                disabled={approveDepositMutation.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectDeposit(deposit.id)}
                                disabled={rejectDepositMutation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default DepositsManagementPage