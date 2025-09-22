import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Plus, Wallet, CheckCircle, XCircle, Clock, User } from 'lucide-react'

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

interface MobileDepositsListProps {
  deposits: Deposit[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddDeposit: () => void
  onApproveDeposit: (id: number, reason?: string) => void
  onRejectDeposit: (id: number, reason?: string) => void
  isLoading: boolean
  isError: boolean
  canCreateDeposits: boolean
  canApproveDeposits: boolean
  isReadOnly: boolean
}

export const MobileDepositsList: React.FC<MobileDepositsListProps> = ({
  deposits,
  searchTerm,
  onSearchChange,
  onAddDeposit,
  onApproveDeposit,
  onRejectDeposit,
  isLoading,
  isError,
  canCreateDeposits,
  canApproveDeposits,
  isReadOnly
}) => {
  // State for reason dialog
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [currentDepositId, setCurrentDepositId] = useState<number | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Handle approve with reason
  const handleApproveWithReason = (depositId: number) => {
    setCurrentDepositId(depositId)
    setActionType('approve')
    setReason('')
    setIsReasonDialogOpen(true)
  }

  // Handle reject with reason
  const handleRejectWithReason = (depositId: number) => {
    setCurrentDepositId(depositId)
    setActionType('reject')
    setReason('')
    setIsReasonDialogOpen(true)
  }

  // Handle confirm action
  const handleConfirmAction = () => {
    if (currentDepositId === null || actionType === null) return

    if (actionType === 'approve') {
      onApproveDeposit(currentDepositId, reason)
    } else {
      onRejectDeposit(currentDepositId, reason)
    }

    // Close dialog and reset state
    setIsReasonDialogOpen(false)
    setCurrentDepositId(null)
    setActionType(null)
    setReason('')
  }

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return '💵'
      case 'transfer': return '🏦'
      case 'check': return '📝'
      default: return '💳'
    }
  }

  // Format currency
  const formatCurrency = (amount: string) => {
    try {
      // Remove any existing formatting (commas, dots, currency symbols)
      let cleanAmount = amount.toString().replace(/[^\d.-]/g, '');
      
      // Handle empty or invalid strings
      if (!cleanAmount || cleanAmount === '') {
        return 'Rp 0';
      }
      
      // Parse to float
      const numericAmount = parseFloat(cleanAmount);
      
      // Check if it's a valid number
      if (isNaN(numericAmount)) {
        return 'Rp 0';
      }
      
      // Format with Indonesian locale
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numericAmount);
    } catch (error) {
      // Fallback to basic formatting
      return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-base">Loading deposits...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-bold mb-2">Error Loading Data</div>
          <div className="text-gray-600 mb-4 text-sm">
            Failed to load deposits data. Please try again later.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Section title with improved spacing */}
      <div className="pt-2 px-2">
        <h1 className="text-2xl font-bold px-4">Deposits Management</h1>
        <p className="text-muted-foreground text-sm mt-1 px-4">
          {isReadOnly 
            ? 'View deposits in the system' 
            : canCreateDeposits && !canApproveDeposits
              ? 'Manage deposits - You can create deposits only'
              : canApproveDeposits
                ? 'Manage deposits - You can create and approve/reject deposits'
                : 'Manage deposits'}
        </p>
      </div>

      {/* Search bar with enhanced styling and spacing */}
      <div className="px-2">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search deposits..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full shadow-sm py-5"
          />
        </div>
        
        {canCreateDeposits && (
          <div className="px-2">
            <Button onClick={onAddDeposit} className="w-full mt-4 py-5">
              <Plus className="mr-2 h-4 w-4" />
              Add Deposit
            </Button>
          </div>
        )}
      </div>

      {/* Deposits list with improved spacing and visual hierarchy */}
      <div className="space-y-4 px-2">
        {deposits.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Wallet className="h-12 w-12 text-gray-400 mb-6" />
              <p className="text-gray-500 text-center">
                {searchTerm ? 'No deposits found matching your search' : 'No deposits available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          deposits.map((deposit) => (
            <Card key={deposit.id} className="w-full overflow-hidden shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <CardTitle className="text-lg">
                        {new Date(deposit.deposit_date).toLocaleDateString('id-ID')}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {deposit.SPBU ? `${deposit.SPBU.name} (${deposit.SPBU.code})` : '-'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    className={`text-xs whitespace-nowrap flex-shrink-0 ${getStatusColor(deposit.status)}`}
                  >
                    {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="flex flex-col text-sm flex-1">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        Amount
                      </span>
                      <span className="truncate font-medium">
                        {formatCurrency(deposit.amount)}
                      </span>
                    </div>
                    <div className="flex flex-col text-sm flex-1">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        {getPaymentMethodIcon(deposit.payment_method)}
                        Method
                      </span>
                      <span className="truncate">
                        {deposit.payment_method.charAt(0).toUpperCase() + deposit.payment_method.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col text-sm flex-1">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Operator
                      </span>
                      <span className="truncate">
                        {deposit.operator ? deposit.operator.name : '-'}
                      </span>
                    </div>
                    <div className="flex flex-col text-sm flex-1">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ID
                      </span>
                      <span className="truncate">#{deposit.id}</span>
                    </div>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs">Approved By</span>
                    <span className="truncate">
                      {deposit.depositor_approver ? deposit.depositor_approver.name : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs">Rejected By</span>
                    <span className="truncate">
                      {deposit.depositor_rejector ? deposit.depositor_rejector.name : '-'}
                    </span>
                  </div>
                </div>
                
                {canApproveDeposits && deposit.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 py-5 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveWithReason(deposit.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 py-5 bg-red-600 hover:bg-red-700"
                      onClick={() => handleRejectWithReason(deposit.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Reason Dialog */}
      <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Please provide a reason for approving this deposit.' 
                : 'Please provide a reason for rejecting this deposit.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReasonDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={!reason.trim()}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}