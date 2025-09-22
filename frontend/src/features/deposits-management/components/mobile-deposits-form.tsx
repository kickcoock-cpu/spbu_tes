import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, Save, Wallet } from 'lucide-react'

interface DepositFormData {
  amount: number
  paymentMethod: 'cash' | 'transfer' | 'check'
}

interface MobileDepositsFormProps {
  formData: DepositFormData
  isLoading: boolean
  onChange: (field: string, value: string | number) => void
  onSubmit: () => void
  onCancel: () => void
  canCreateDeposits: boolean
}

export const MobileDepositsForm: React.FC<MobileDepositsFormProps> = ({
  formData,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
  canCreateDeposits
}) => {
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canCreateDeposits && formData.amount > 0) {
      onSubmit()
    }
  }

  // Handle amount input change with validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numeric characters
    if (/^\d*$/.test(value) || value === '') {
      onChange('amount', value === '' ? 0 : parseInt(value, 10))
    }
  }

  // Format number to IDR currency
  const formatIDR = (value: number): string => {
    if (!value) return '0'
    return new Intl.NumberFormat('id-ID').format(value)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto px-4 py-6">
      {/* Header section with improved mobile spacing */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel} 
          className="h-10 w-10 rounded-full"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl font-bold">Create Deposit</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add a new deposit to the system
          </p>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      {/* Form card with mobile-optimized padding */}
      <Card className="shadow-sm w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">New Deposit</CardTitle>
              <CardDescription className="text-sm">
                Enter deposit information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              {/* Amount input with mobile-friendly styling */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount" className="text-base">Amount (IDR)</Label>
                <input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.amount || ''}
                  onChange={handleAmountChange}
                  placeholder="Enter deposit amount"
                  disabled={!canCreateDeposits}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 py-6 text-base"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Formatted: Rp {formatIDR(formData.amount || 0)}
                </p>
              </div>

              {/* Payment method select with mobile-friendly styling */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="payment_method" className="text-base">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => onChange('paymentMethod', value as 'cash' | 'transfer' | 'check')}
                  disabled={!canCreateDeposits}
                >
                  <SelectTrigger className="py-6 text-base">
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

            {/* Action buttons with improved mobile layout */}
            {canCreateDeposits && (
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  type="submit"
                  disabled={isLoading || formData.amount <= 0}
                  className="w-full py-6 text-base font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Create Deposit
                    </div>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="w-full py-6 text-base font-medium"
                  type="button"
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}