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
import { Switch } from '@/components/ui/switch'
import { ChevronLeft, Save, Building } from 'lucide-react'

interface SPBUFormData {
  name: string
  location: string
  code: string
  is_active?: boolean
}

interface MobileSPBUFormProps {
  formData: SPBUFormData
  isEditing: boolean
  isLoading: boolean
  onChange: (field: string, value: string | boolean) => void
  onSubmit: () => void
  onCancel: () => void
  isReadOnly: boolean
}

export const MobileSPBUForm: React.FC<MobileSPBUFormProps> = ({
  formData,
  isEditing,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
  isReadOnly
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
            {isEditing ? 'Edit SPBU' : 'Create SPBU'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEditing 
              ? 'Update SPBU information' 
              : 'Add a new SPBU to the system'}
          </p>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isEditing ? 'Edit SPBU Details' : 'Create New SPBU'}
              </CardTitle>
              <CardDescription className="text-sm">
                {isEditing 
                  ? 'Update SPBU information' 
                  : 'Add a new SPBU to the system'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  placeholder="Enter SPBU name"
                  disabled={isReadOnly}
                  className="py-5"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => onChange('code', e.target.value)}
                  placeholder="Enter SPBU code"
                  disabled={isReadOnly}
                  className="py-5"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => onChange('location', e.target.value)}
                  placeholder="Enter SPBU location"
                  disabled={isReadOnly}
                  className="py-5"
                />
              </div>

              {isEditing && (
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="is_active">Active Status</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => onChange('is_active', checked)}
                    disabled={isReadOnly}
                  />
                </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}