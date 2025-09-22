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
import { ChevronLeft, Save, Droplets } from 'lucide-react'

interface TankFormData {
  id?: number
  name: string
  fuelType: string
  capacity: string
  currentStock?: string
  spbuId: string
}

interface SPBU {
  id: number
  name: string
  code: string
}

interface MobileTankFormProps {
  formData: TankFormData
  spbues: SPBU[]
  isEditing: boolean
  isLoading: boolean
  onChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  canEdit: boolean
}

export const MobileTankForm: React.FC<MobileTankFormProps> = ({
  formData,
  spbues,
  isEditing,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
  canEdit
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
            {isEditing ? 'Edit Tank' : 'Create Tank'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEditing 
              ? 'Update tank information' 
              : 'Add a new tank to the system'}
          </p>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Droplets className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isEditing ? 'Edit Tank Details' : 'Create New Tank'}
              </CardTitle>
              <CardDescription className="text-sm">
                {isEditing 
                  ? 'Update tank information' 
                  : 'Add a new tank to the system'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Tank Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  placeholder="Enter tank name"
                  disabled={!canEdit}
                  className="py-5"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(value) => onChange('fuelType', value)}
                  disabled={!canEdit}
                  required
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
                <Label htmlFor="capacity">Capacity (Liters)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => onChange('capacity', e.target.value)}
                  placeholder="Enter capacity"
                  disabled={!canEdit}
                  className="py-5"
                  required
                />
              </div>

              {isEditing && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="currentStock">Current Stock (Liters)</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => onChange('currentStock', e.target.value)}
                    placeholder="Enter current stock"
                    disabled={!canEdit}
                    className="py-5"
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="spbuId">SPBU</Label>
                <Select
                  value={formData.spbuId}
                  onValueChange={(value) => onChange('spbuId', value)}
                  disabled={!canEdit}
                  required
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Select SPBU" />
                  </SelectTrigger>
                  <SelectContent>
                    {spbues.map((spbu) => (
                      <SelectItem key={spbu.id} value={spbu.id.toString()}>
                        {spbu.name} ({spbu.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {canEdit && (
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="flex-1 py-5"
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-5"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Update' : 'Create'}
                    </div>
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}