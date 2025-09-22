import React, { useEffect, useState } from 'react'
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
import { ChevronLeft, Save, Fuel, CreditCard } from 'lucide-react'

interface SaleFormData {
  fuel_type: string
  liters: number
  amount: number
}

interface MobileSalesFormProps {
  formData: SaleFormData
  availableFuelTypes: string[]
  getCurrentPrice: (fuelType: string) => number
  isLoading: boolean
  onChange: (field: string, value: string | number) => void
  onSubmit: () => void
  onCancel: () => void
  isReadOnly: boolean
}

export const MobileSalesForm: React.FC<MobileSalesFormProps> = ({
  formData,
  availableFuelTypes,
  getCurrentPrice,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
  isReadOnly
}) => {
  const [displayLiters, setDisplayLiters] = useState('')

  // Calculate amount when fuel type or liters change
  useEffect(() => {
    if (formData.fuel_type) {
      const price = getCurrentPrice(formData.fuel_type)
      const amount = price * formData.liters
      onChange('amount', parseFloat(amount.toFixed(2)))
    }
  }, [formData.fuel_type, formData.liters, getCurrentPrice])

  // Handle liters input change with comma support
  const handleLitersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDisplayLiters(value)
    
    // Replace comma with dot for processing
    const processedValue = value.replace(',', '.')
    
    // Check if it's a valid number
    if (processedValue === '' || /^\d*\.?\d*$/.test(processedValue)) {
      const numericValue = processedValue === '' ? 0 : parseFloat(processedValue)
      onChange('liters', isNaN(numericValue) ? 0 : numericValue)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Enhanced header with better visual balance */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-10 w-10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl font-bold">Create Sale</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add a new sale transaction
          </p>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Fuel className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">New Sale Transaction</CardTitle>
              <CardDescription className="text-sm">
                Enter sale details to create a new transaction
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => onChange('fuel_type', value)}
                  disabled={isReadOnly || availableFuelTypes.length === 0}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFuelTypes.length > 0 ? (
                      availableFuelTypes.map(fuelType => (
                        <SelectItem key={fuelType} value={fuelType}>
                          {fuelType} (Rp {getCurrentPrice(fuelType).toFixed(2)}/L)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No fuel types available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Fuel types are based on available tanks
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="liters">Liters</Label>
                <input
                  id="liters"
                  type="text"
                  inputMode="decimal"
                  value={displayLiters}
                  onChange={handleLitersChange}
                  placeholder="Enter liters (e.g. 10,5)"
                  disabled={isReadOnly}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 py-5"
                />
                <p className="text-sm text-gray-500">
                  Enter the amount of fuel in liters (use comma or dot for decimals)
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Amount (IDR)</Label>
                <input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  value={formatCurrency(formData.amount)}
                  className="flex h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 py-5 cursor-not-allowed"
                  readOnly
                />
                <div className="text-sm text-gray-500">
                  Calculated: {formData.liters}L × Rp {getCurrentPrice(formData.fuel_type).toFixed(2)}/L
                </div>
                <p className="text-sm text-gray-500">
                  Amount is automatically calculated and locked
                </p>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="flex-1 py-5"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="flex-1 py-5"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Create Sale
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}