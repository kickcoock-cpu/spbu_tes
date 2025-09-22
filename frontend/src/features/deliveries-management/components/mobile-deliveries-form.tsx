import React, { useState } from 'react'
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
import { ChevronLeft, Save, Package, Image, CheckCircle } from 'lucide-react'
import { PendingDeliveryAnimation } from '@/components/PendingDeliveryAnimation'

interface DeliveryFormData {
  deliveryOrderNumber: string
  supplier: string
  fuelType: string
  planned_liters: number
  harga_beli: number | null
}

interface ConfirmFormData {
  actualLiters: number
  harga_beli: number | null
  deliveryOrderPhoto: File | null
  photoPreview: string
}

interface MobileDeliveriesFormProps {
  formData: DeliveryFormData | ConfirmFormData
  isCreating: boolean
  isConfirming: boolean
  isLoading: boolean
  onChange: (field: string, value: string | number | File) => void
  onSubmit: () => void
  onCancel: () => void
  isReadOnly: boolean
  selectedDelivery?: any
}

export const MobileDeliveriesForm: React.FC<MobileDeliveriesFormProps> = ({
  formData,
  isCreating,
  isConfirming,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
  isReadOnly,
  selectedDelivery
}) => {
  const [photoPreview, setPhotoPreview] = useState('')

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      onChange('deliveryOrderPhoto', file)
      const previewUrl = URL.createObjectURL(file)
      setPhotoPreview(previewUrl)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Enhanced header with better visual balance */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-10 w-10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl font-bold">
            {isCreating ? 'Create Delivery' : isConfirming ? 'Confirm Delivery' : 'Delivery Details'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isCreating 
              ? 'Add a new fuel delivery' 
              : isConfirming 
                ? 'Confirm delivery with actual details' 
                : 'View delivery information'}
          </p>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      <Card className="shadow-sm">
        <CardContent className="pb-6">
          <div className="flex flex-col gap-5">
            {isCreating && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="delivery_order_number">DO Number</Label>
                  <Input
                    id="delivery_order_number"
                    value={(formData as DeliveryFormData).deliveryOrderNumber}
                    onChange={(e) => onChange('deliveryOrderNumber', e.target.value)}
                    placeholder="Enter delivery order number"
                    disabled={isReadOnly}
                    className="py-5"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={(formData as DeliveryFormData).supplier}
                    readOnly
                    className="py-5 bg-gray-100"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="fuel_type">Fuel Type</Label>
                  <Select
                    value={(formData as DeliveryFormData).fuelType}
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
                  <Label htmlFor="liters">Planned Liters</Label>
                  <Input
                    id="liters"
                    type="number"
                    step="0.01"
                    value={(formData as DeliveryFormData).planned_liters}
                    onChange={(e) => onChange('planned_liters', parseFloat(e.target.value) || 0)}
                    placeholder="Enter planned liters"
                    disabled={isReadOnly}
                    className="py-5"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="harga_beli">Harga Beli (Opsional)</Label>
                  <Input
                    id="harga_beli"
                    type="number"
                    step="0.01"
                    value={(formData as DeliveryFormData).harga_beli || ''}
                    onChange={(e) => onChange('harga_beli', parseFloat(e.target.value) || null)}
                    placeholder="Enter purchase price per liter"
                    disabled={isReadOnly}
                    className="py-5"
                  />
                </div>
              </div>
            )}

            {isConfirming && selectedDelivery && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fuel_type">Fuel Type</Label>
                  <Input
                    id="fuel_type"
                    value={selectedDelivery.fuel_type}
                    readOnly
                    className="py-5 bg-gray-100"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="planned_liters">Planned Liters</Label>
                  <Input
                    id="planned_liters"
                    value={parseFloat(selectedDelivery.planned_liters).toFixed(2)}
                    readOnly
                    className="py-5 bg-gray-100"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="actual_liters">Actual Liters</Label>
                  <Input
                    id="actual_liters"
                    type="number"
                    step="0.01"
                    value={(formData as ConfirmFormData).actualLiters}
                    onChange={(e) => onChange('actualLiters', parseFloat(e.target.value) || 0)}
                    placeholder="Enter actual liters"
                    className="py-5"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="harga_beli_confirm">Harga Beli (Opsional)</Label>
                  <Input
                    id="harga_beli_confirm"
                    type="number"
                    step="0.01"
                    value={(formData as ConfirmFormData).harga_beli || ''}
                    onChange={(e) => onChange('harga_beli', parseFloat(e.target.value) || null)}
                    placeholder="Enter purchase price per liter"
                    className="py-5"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="delivery_order_photo">DO Photo</Label>
                  <Input
                    id="delivery_order_photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="py-5"
                  />
                  {photoPreview && (
                    <div className="mt-2">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="max-w-full h-40 object-contain border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isCreating && !isConfirming && selectedDelivery && (
              <div className="flex flex-col gap-4">
                {/* Animation for pending deliveries */}
                {selectedDelivery.status === 'pending' && (
                  <div className="flex justify-center py-2">
                    <PendingDeliveryAnimation size="sm" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-muted-foreground text-xs">Created At</span>
                    <span className="text-sm">
                      {new Date(selectedDelivery.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-muted-foreground text-xs">Delivery Date</span>
                    <span className="text-sm">
                      {new Date(selectedDelivery.delivery_date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-muted-foreground text-xs">SPBU</span>
                    <span className="text-sm">
                      {selectedDelivery.SPBU ? `${selectedDelivery.SPBU.name} (${selectedDelivery.SPBU.code})` : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-muted-foreground text-xs">DO Number</span>
                    <span className="text-sm">
                      {selectedDelivery.delivery_order_number || '-'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-muted-foreground text-xs">Supplier</span>
                    <span className="text-sm truncate">
                      {selectedDelivery.supplier}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-muted-foreground text-xs">Fuel Type</span>
                    <span className="text-sm">
                      {selectedDelivery.fuel_type}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-muted-foreground text-xs">Planned Liters</span>
                    <span className="text-sm">
                      {parseFloat(selectedDelivery.planned_liters).toFixed(2)}
                    </span>
                  </div>
                  {selectedDelivery.actual_liters && (
                    <div className="flex flex-col">
                      <span className="font-medium text-muted-foreground text-xs">Actual Liters</span>
                      <span className="text-sm">
                        {parseFloat(selectedDelivery.actual_liters).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedDelivery.harga_beli && (
                    <div className="flex flex-col">
                      <span className="font-medium text-muted-foreground text-xs">Harga Beli</span>
                      <span className="text-sm">
                        {parseFloat(selectedDelivery.harga_beli).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedDelivery.harga_beli && (
                    <div className="flex flex-col">
                      <span className="font-medium text-muted-foreground text-xs">Harga Beli</span>
                      <span className="text-sm">
                        {parseFloat(selectedDelivery.harga_beli).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-muted-foreground text-xs">Status</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      selectedDelivery.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : selectedDelivery.status === 'confirmed' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedDelivery.status.charAt(0).toUpperCase() + selectedDelivery.status.slice(1)}
                    </span>
                  </div>
                  {selectedDelivery.confirmer && (
                    <div className="flex flex-col">
                      <span className="font-medium text-muted-foreground text-xs">Confirmed By</span>
                      <span className="text-sm">
                        {selectedDelivery.confirmer.name}
                      </span>
                    </div>
                  )}
                  {selectedDelivery.approver && (
                    <div className="flex flex-col">
                      <span className="font-medium text-muted-foreground text-xs">Approved By</span>
                      <span className="text-sm">
                        {selectedDelivery.approver.name}
                      </span>
                    </div>
                  )}
                </div>

                {selectedDelivery.delivery_order_photo && (
                  <div className="flex flex-col gap-2">
                    <Label>DO Photo</Label>
                    <img 
                      src={selectedDelivery.delivery_order_photo} 
                      alt="Delivery Order" 
                      className="max-w-full h-48 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
            )}

            {(!isReadOnly || isConfirming) && (
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
                      {isCreating ? 'Creating...' : isConfirming ? 'Confirming...' : 'Saving...'}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      {isCreating ? 'Create Delivery' : isConfirming ? 'Confirm Delivery' : 'Save Changes'}
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