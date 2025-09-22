import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, Save, Fuel } from 'lucide-react'

interface SPBU {
  id: number
  name: string
  code: string
  location: string
  is_active: boolean
}

interface Tank {
  id: number
  spbu_id: number
  name: string
  fuel_type: 'Premium' | 'Pertamax' | 'Pertalite' | 'Solar' | 'Dexlite'
  capacity: string
  current_stock: string
}

interface PriceFormData {
  fuelType: 'Premium' | 'Pertamax' | 'Pertalite' | 'Solar' | 'Dexlite'
  price: number
  spbuId: number | null
  tankId: number | null
}

interface EditPriceFormData {
  price: number
  tankId: number | null
}

interface MobilePricesFormProps {
  formData: PriceFormData | EditPriceFormData
  spbus: SPBU[]
  tanks: Tank[]
  isCreating: boolean
  isEditing: boolean
  isLoading: boolean
  userRole: string | undefined
  userSpbuId: number | undefined
  onChange: (field: string, value: string | number | null) => void
  onSubmit: () => void
  onCancel: () => void
  isReadOnly: boolean
  editingPrice?: any
}

export const MobilePricesForm: React.FC<MobilePricesFormProps> = ({
  formData,
  spbus,
  tanks,
  isCreating,
  isEditing,
  isLoading,
  userRole,
  userSpbuId,
  onChange,
  onSubmit,
  onCancel,
  isReadOnly,
  editingPrice
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Enhanced header with better visual balance */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-10 w-10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl font-bold">
            {isCreating ? 'Create Price' : isEditing ? 'Edit Price' : 'Price Details'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isCreating 
              ? 'Add a new fuel price' 
              : isEditing 
                ? 'Update the fuel price' 
                : 'View price information'}
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
              <CardTitle className="text-lg">
                {isCreating ? 'New Price' : isEditing ? 'Edit Price' : 'Price Details'}
              </CardTitle>
              <CardDescription className="text-sm">
                {isCreating 
                  ? 'Enter price information' 
                  : isEditing 
                    ? 'Update price information' 
                    : 'View price details'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              {isCreating && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="fuel_type">Fuel Type</Label>
                    <Select
                      value={(formData as PriceFormData).fuelType}
                      onValueChange={(value) => onChange('fuelType', value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className="py-5">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Pertamax">Pertamax</SelectItem>
                        <SelectItem value="Pertalite">Pertalite</SelectItem>
                        <SelectItem value="Solar">Solar</SelectItem>
                        <SelectItem value="Dexlite">Dexlite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="price">Price (IDR)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={(formData as PriceFormData).price}
                      onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="Enter price"
                      disabled={isReadOnly}
                      className="py-5"
                    />
                  </div>

                  {userRole === 'Super Admin' && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="spbu">SPBU</Label>
                      <Select
                        value={(formData as PriceFormData).spbuId === null ? 'global' : (formData as PriceFormData).spbuId?.toString() || 'global'}
                        onValueChange={(value) => onChange('spbuId', value === 'global' ? null : parseInt(value))}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className="py-5">
                          <SelectValue placeholder="Select SPBU or Global" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">Global (All SPBUs)</SelectItem>
                          {spbus.map((spbu) => (
                            <SelectItem key={spbu.id} value={spbu.id.toString()}>
                              {spbu.name} ({spbu.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="tank">Tank</Label>
                    <Select
                      value={(formData as PriceFormData).tankId ? (formData as PriceFormData).tankId.toString() : 'none'}
                      onValueChange={(value) => onChange('tankId', value === 'none' ? null : parseInt(value))}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className="py-5">
                        <SelectValue placeholder="Select tank (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {tanks
                          .filter(tank => 
                            userRole === 'Super Admin' || 
                            tank.spbu_id === userSpbuId
                          )
                          .map((tank) => (
                            <SelectItem key={tank.id} value={tank.id.toString()}>
                              {tank.name} - {tank.fuel_type} ({tank.current_stock}L / {tank.capacity}L)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {isEditing && editingPrice && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit_fuel_type">Fuel Type</Label>
                    <Input
                      id="edit_fuel_type"
                      value={editingPrice.fuel_type}
                      disabled
                      className="py-5 bg-gray-100"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit_price">Price (IDR)</Label>
                    <Input
                      id="edit_price"
                      type="number"
                      step="0.01"
                      value={(formData as EditPriceFormData).price}
                      onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="Enter price"
                      disabled={isReadOnly}
                      className="py-5"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit_spbu">SPBU</Label>
                    <Input
                      id="edit_spbu"
                      value={editingPrice.spbu_id 
                        ? (editingPrice.SPBU ? `${editingPrice.SPBU.name} (${editingPrice.SPBU.code})` : `SPBU ${editingPrice.spbu_id}`) 
                        : 'Global'}
                      disabled
                      className="py-5 bg-gray-100"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit_tank">Tank</Label>
                    <Select
                      value={(formData as EditPriceFormData).tankId ? (formData as EditPriceFormData).tankId.toString() : 'none'}
                      onValueChange={(value) => onChange('tankId', value === 'none' ? null : parseInt(value))}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className="py-5">
                        <SelectValue placeholder="Select tank (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {tanks
                          .filter(tank => 
                            userRole === 'Super Admin' || 
                            tank.spbu_id === userSpbuId
                          )
                          .map((tank) => (
                            <SelectItem key={tank.id} value={tank.id.toString()}>
                              {tank.name} - {tank.fuel_type} ({tank.current_stock}L / {tank.capacity}L)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
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
                      {isCreating ? 'Creating...' : isEditing ? 'Updating...' : 'Saving...'}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      {isCreating ? 'Create Price' : isEditing ? 'Update Price' : 'Save Changes'}
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