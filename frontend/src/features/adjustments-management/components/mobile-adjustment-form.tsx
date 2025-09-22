import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ChevronLeft, Save } from 'lucide-react'

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

interface MobileAdjustmentFormProps {
  formData: any
  tanks: Tank[]
  isLoading: boolean
  isError: boolean
  onChange: (field: string, value: any) => void
  onSubmit: () => void
  onCancel: () => void
  tanksLoading: boolean
  tanksError: boolean
}

export const MobileAdjustmentForm: React.FC<MobileAdjustmentFormProps> = ({
  formData,
  tanks,
  isLoading,
  isError,
  onChange,
  onSubmit,
  onCancel,
  tanksLoading,
  tanksError
}) => {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Enhanced header with better visual balance */}
      <div className="flex items-center justify-between pt-4 pb-2 px-4 bg-white sticky top-0 z-10 border-b">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-12 w-12 rounded-full">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl font-bold">Request Adjustment</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Submit a new adjustment request
          </p>
        </div>
        <div className="w-12"></div> {/* Spacer for symmetry */}
      </div>

      <div className="px-4">
        <Card className="shadow-md rounded-xl">
          <CardHeader className="pb-4 bg-gray-50 rounded-t-xl">
            <CardTitle className="text-xl font-bold">Adjustment Details</CardTitle>
            <CardDescription>
              Fill in the adjustment request details
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="type" className="text-base font-medium">Adjustment Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => onChange('type', value)}
                  >
                    <SelectTrigger className="py-6 text-base rounded-xl">
                      <SelectValue placeholder="Select adjustment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fuel" className="text-base py-3">Fuel Adjustment</SelectItem>
                      <SelectItem value="equipment" className="text-base py-3">Equipment Adjustment</SelectItem>
                      <SelectItem value="other" className="text-base py-3">Other Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.type === 'fuel' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="adjustmentType" className="text-base font-medium">Adjustment</Label>
                      <Select
                        value={formData.adjustmentType || ''}
                        onValueChange={(value) => onChange('adjustmentType', value)}
                      >
                        <SelectTrigger className="py-6 text-base rounded-xl">
                          <SelectValue placeholder="Select adjustment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gain" className="text-base py-3">Gain (Add to stock)</SelectItem>
                          <SelectItem value="loss" className="text-base py-3">Loss (Remove from stock)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="tankId" className="text-base font-medium">Tank</Label>
                      <Select
                        value={formData.tankId?.toString() || ''}
                        onValueChange={(value) => onChange('tankId', parseInt(value))}
                        disabled={tanksLoading}
                      >
                        <SelectTrigger className="py-6 text-base rounded-xl">
                          <SelectValue placeholder="Select tank" />
                        </SelectTrigger>
                        <SelectContent>
                          {tanksLoading ? (
                            <SelectItem value="" disabled className="text-base py-3">Loading tanks...</SelectItem>
                          ) : tanksError ? (
                            <SelectItem value="" disabled className="text-base py-3">Error loading tanks</SelectItem>
                          ) : tanks.length === 0 ? (
                            <SelectItem value="" disabled className="text-base py-3">No tanks available</SelectItem>
                          ) : (
                            tanks.map((tank) => (
                              <SelectItem key={tank.id} value={tank.id.toString()} className="text-base py-3">
                                {tank.name} - {tank.fuel_type} ({parseFloat(tank.current_stock).toFixed(2)}/{parseFloat(tank.capacity).toFixed(2)} L)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="quantity" className="text-base font-medium">Quantity (L)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => onChange('quantity', parseFloat(e.target.value) || 0)}
                        className="py-6 text-base rounded-xl"
                        placeholder="Enter quantity in liters"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description" className="text-base font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    className="py-4 text-base rounded-xl min-h-[120px]"
                    placeholder="Enter detailed description of the adjustment..."
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-2">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="flex-1 py-6 text-base rounded-full"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="flex-1 py-6 text-base rounded-full shadow-md"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-5 w-5 mr-2" />
                      Create Request
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}