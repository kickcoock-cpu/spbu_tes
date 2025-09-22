import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Check, X } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess, hasLimitedAccess } from '@/lib/rbac'
import { apiClient, tankApi } from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileAdjustmentsList } from './components/mobile-adjustments-list'
import { MobileAdjustmentForm } from './components/mobile-adjustment-form'

// Types
interface Tank {
  id: number
  spbu_id: number
  name: string
  fuel_type: string
  capacity: string
  current_stock: string
  created_at: string
  updated_at: string
  SPBU?: {
    name: string
    code: string
  }
}

interface Adjustment {
  id: number
  spbu_id: number
  operator_id: number | null
  type: 'fuel' | 'equipment' | 'other'
  description: string
  tank_id?: number | null
  adjustment_type?: 'gain' | 'loss' | null
  quantity?: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_by: number | null
  rejected_by: number | null
  created_at: string
  updated_at: string
  SPBU?: {
    name: string
    code: string
  }
  operator?: {
    name: string
  }
  adjustment_approver?: {
    name: string
  }
  adjustment_rejector?: {
    name: string
  }
  Tank?: {
    name: string
    fuel_type: string
  }
}

// API functions
const fetchAdjustments = async (): Promise<Adjustment[]> => {
  try {
    const response = await apiClient.get('/api/adjustments')
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching adjustments:', error)
    throw error
  }
}

const createAdjustment = async (adjustmentData: any): Promise<Adjustment> => {
  try {
    const response = await apiClient.post('/api/adjustments', adjustmentData)
    return response.data.data
  } catch (error: any) {
    console.error('Error creating adjustment:', error)
    throw error
  }
}

const approveAdjustment = async (id: number): Promise<Adjustment> => {
  try {
    const response = await apiClient.put(`/api/adjustments/${id}/approve`)
    return response.data.data
  } catch (error: any) {
    console.error('Error approving adjustment:', error)
    throw error
  }
}

const rejectAdjustment = async (id: number): Promise<Adjustment> => {
  try {
    const response = await apiClient.put(`/api/adjustments/${id}/reject`)
    return response.data.data
  } catch (error: any) {
    console.error('Error rejecting adjustment:', error)
    throw error
  }
}

const AdjustmentsManagementPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore().auth
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const isMobile = useIsMobile()

  // Check if user has access to adjustments management
  const userHasAccess = user ? hasAccess(user, 'adjustments') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'adjustments') : false
  const userHasLimitedAccess = user ? hasLimitedAccess(user, 'adjustments') && !userHasFullAccess : false
  
  // Custom RBAC logic for adjustments:
  // - Operators (limited access): Can create adjustment requests
  // - Super Admins/Admins (full access): Can only approve/reject (not create)
  const isOperator = userHasLimitedAccess && !userHasFullAccess
  const isApprover = userHasFullAccess
  const canCreateAdjustments = isOperator
  const canApproveAdjustments = isApprover
  const isReadOnly = !isOperator && !isApprover

  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])

  // Fetch data
  const { data: adjustments = [], isLoading: adjustmentsLoading, isError: adjustmentsError } = useQuery({
    queryKey: ['adjustments'],
    queryFn: fetchAdjustments,
    enabled: userHasAccess
  })

  // Fetch tanks for Operators
  const { data: tanks = [], isLoading: tanksLoading, isError: tanksError } = useQuery({
    queryKey: ['tanks'],
    queryFn: () => tankApi.getAll().then(response => response.data.data),
    enabled: userHasAccess && isOperator
  })

  // Filter adjustments based on search term
  const filteredAdjustments = adjustments.filter(adjustment => 
    adjustment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adjustment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (adjustment.SPBU?.name && adjustment.SPBU.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (adjustment.SPBU?.code && adjustment.SPBU.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (adjustment.operator?.name && adjustment.operator.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Mutations
  const createAdjustmentMutation = useMutation({
    mutationFn: createAdjustment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustments'] })
      toast.success('Adjustment request created successfully')
      setIsCreateDialogOpen(false)
      // Reset form
      setCreateFormData({
        type: 'fuel',
        description: '',
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create adjustment request')
    }
  })

  const approveAdjustmentMutation = useMutation({
    mutationFn: approveAdjustment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustments'] })
      toast.success('Adjustment approved successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve adjustment')
    }
  })

  const rejectAdjustmentMutation = useMutation({
    mutationFn: rejectAdjustment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustments'] })
      toast.success('Adjustment rejected successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject adjustment')
    }
  })

  // Form states
  const [createFormData, setCreateFormData] = useState({
    type: 'fuel',
    description: '',
    tankId: null as number | null,
    adjustmentType: 'gain' as 'gain' | 'loss' | null,
    quantity: 0,
  })

  // Handle create form changes
  const handleCreateFormChange = (field: string, value: string | number | null) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle create adjustment
  const handleCreateAdjustment = () => {
    // Validate required fields
    if (!createFormData.description.trim()) {
      toast.error('Description is required')
      return
    }
    
    // For fuel adjustments, validate tank-related fields
    if (createFormData.type === 'fuel') {
      if (!createFormData.tankId || !createFormData.adjustmentType || createFormData.quantity <= 0) {
        toast.error('For fuel adjustments, please select a tank, adjustment type, and enter a valid quantity')
        return
      }
    }
    
    const adjustmentData: any = {
      type: createFormData.type,
      description: createFormData.description,
    }
    
    // Include tank-related fields for fuel adjustments
    if (createFormData.type === 'fuel') {
      adjustmentData.tankId = createFormData.tankId
      adjustmentData.adjustmentType = createFormData.adjustmentType
      adjustmentData.quantity = createFormData.quantity
    }
    
    createAdjustmentMutation.mutate(adjustmentData)
  }

  // Handle approve adjustment
  const handleApproveAdjustment = (id: number) => {
    if (window.confirm('Are you sure you want to approve this adjustment request?')) {
      approveAdjustmentMutation.mutate(id)
    }
  }

  // Handle reject adjustment
  const handleRejectAdjustment = (id: number) => {
    if (window.confirm('Are you sure you want to reject this adjustment request?')) {
      rejectAdjustmentMutation.mutate(id)
    }
  }

  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileAdjustmentsList
          adjustments={adjustments}
          tanks={tanks}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateAdjustment={handleCreateAdjustment}
          onApproveAdjustment={handleApproveAdjustment}
          onRejectAdjustment={handleRejectAdjustment}
          isLoading={adjustmentsLoading || tanksLoading}
          isError={adjustmentsError || tanksError}
          isCreateDialogOpen={isCreateDialogOpen}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
          createFormData={createFormData}
          onCreateFormChange={handleCreateFormChange}
          handleCreateAdjustment={handleCreateAdjustment}
          approveAdjustmentMutation={approveAdjustmentMutation}
          rejectAdjustmentMutation={rejectAdjustmentMutation}
          createAdjustmentMutation={createAdjustmentMutation}
        />
        
        {/* Mobile Adjustment Form Dialog */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0">
            <div className="bg-white w-full h-full overflow-y-auto">
              <MobileAdjustmentForm
                formData={createFormData}
                tanks={tanks}
                isLoading={createAdjustmentMutation.isPending}
                isError={tanksError}
                onChange={handleCreateFormChange}
                onSubmit={handleCreateAdjustment}
                onCancel={() => setIsCreateDialogOpen(false)}
                tanksLoading={tanksLoading}
                tanksError={tanksError}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (adjustmentsLoading || tanksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">{adjustmentsLoading ? 'Loading adjustments...' : 'Loading tanks...'}</span>
      </div>
    )
  }

  if (adjustmentsError || tanksError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Data</div>
          <div className="text-gray-600 mb-4">
            {adjustmentsError 
              ? 'Failed to load adjustments data. Please try again later.' 
              : 'Failed to load tanks data. Please try again later.'}
          </div>
          <Button onClick={() => {
            if (adjustmentsError) queryClient.invalidateQueries({ queryKey: ['adjustments'] })
            if (tanksError) queryClient.invalidateQueries({ queryKey: ['tanks'] })
          }}>
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
          <h1 className="text-3xl font-bold">Adjustments Management</h1>
          <p className="text-muted-foreground">
            {isReadOnly 
              ? 'View adjustment requests' 
              : isOperator
                ? 'Request adjustments'
                : isApprover
                  ? 'Approve/Reject adjustment requests'
                  : 'Manage adjustments'}
          </p>
        </div>
        {canCreateAdjustments && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Request Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Request New Adjustment</DialogTitle>
                <DialogDescription>
                  Submit a new adjustment request. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={createFormData.type}
                    onValueChange={(value) => handleCreateFormChange('type', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select adjustment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fuel">Fuel Adjustment</SelectItem>
                      <SelectItem value="equipment">Equipment Adjustment</SelectItem>
                      <SelectItem value="other">Other Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {createFormData.type === 'fuel' && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="adjustmentType" className="text-right">
                        Adjustment
                      </Label>
                      <Select
                        value={createFormData.adjustmentType || ''}
                        onValueChange={(value) => handleCreateFormChange('adjustmentType', value as 'gain' | 'loss')}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select adjustment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gain">Gain (Add to stock)</SelectItem>
                          <SelectItem value="loss">Loss (Remove from stock)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tankId" className="text-right">
                        Tank
                      </Label>
                      <Select
                        value={createFormData.tankId?.toString() || ''}
                        onValueChange={(value) => handleCreateFormChange('tankId', parseInt(value))}
                        disabled={tanksLoading}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select tank" />
                        </SelectTrigger>
                        <SelectContent>
                          {tanksLoading ? (
                            <SelectItem value="" disabled>Loading tanks...</SelectItem>
                          ) : tanksError ? (
                            <SelectItem value="" disabled>Error loading tanks</SelectItem>
                          ) : tanks.length === 0 ? (
                            <SelectItem value="" disabled>No tanks available</SelectItem>
                          ) : (
                            tanks.map((tank) => (
                              <SelectItem key={tank.id} value={tank.id.toString()}>
                                {tank.name} - {tank.fuel_type} ({tank.current_stock}/{tank.capacity} L)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">
                        Quantity (L)
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        value={createFormData.quantity}
                        onChange={(e) => handleCreateFormChange('quantity', parseFloat(e.target.value) || 0)}
                        className="col-span-3"
                      />
                    </div>
                  </>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={createFormData.description}
                    onChange={(e) => handleCreateFormChange('description', e.target.value)}
                    className="col-span-3"
                    rows={4}
                  />
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
                  onClick={handleCreateAdjustment}
                  disabled={createAdjustmentMutation.isPending}
                >
                  {createAdjustmentMutation.isPending ? 'Creating...' : 'Create Request'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment Requests</CardTitle>
          <CardDescription>
            {isReadOnly 
              ? 'View all adjustment requests' 
              : isOperator
                ? 'Your adjustment requests'
                : isApprover
                  ? 'All adjustment requests for your SPBU'
                  : 'Manage adjustment requests'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search adjustments..."
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
                <TableHead>Type</TableHead>
                <TableHead>Tank</TableHead>
                <TableHead>Adjustment</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Rejected By</TableHead>
                {canApproveAdjustments && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canApproveAdjustments ? 12 : 11} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">No adjustment requests found</div>
                      {searchTerm && (
                        <div className="text-sm text-gray-500">
                          No adjustment requests match your search for "{searchTerm}"
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell className="font-medium">
                      {new Date(adjustment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {adjustment.SPBU ? `${adjustment.SPBU.name} (${adjustment.SPBU.code})` : '-'}
                    </TableCell>
                    <TableCell>{adjustment.operator ? adjustment.operator.name : '-'}</TableCell>
                    <TableCell>
                      {adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1)}
                    </TableCell>
                    <TableCell>
                      {adjustment.Tank ? `${adjustment.Tank.name} - ${adjustment.Tank.fuel_type}` : '-'}
                    </TableCell>
                    <TableCell>
                      {adjustment.adjustment_type 
                        ? adjustment.adjustment_type.charAt(0).toUpperCase() + adjustment.adjustment_type.slice(1)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {adjustment.quantity ? `${parseFloat(adjustment.quantity).toFixed(2)} L` : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {adjustment.description}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        adjustment.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : adjustment.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {adjustment.status.charAt(0).toUpperCase() + adjustment.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{adjustment.adjustment_approver ? adjustment.adjustment_approver.name : '-'}</TableCell>
                    <TableCell>{adjustment.adjustment_rejector ? adjustment.adjustment_rejector.name : '-'}</TableCell>
                    {canApproveAdjustments && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {adjustment.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveAdjustment(adjustment.id)}
                                disabled={approveAdjustmentMutation.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectAdjustment(adjustment.id)}
                                disabled={rejectAdjustmentMutation.isPending}
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

export default AdjustmentsManagementPage