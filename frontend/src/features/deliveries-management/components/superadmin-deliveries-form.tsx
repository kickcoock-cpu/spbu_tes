import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Fuel, 
  Droplets, 
  Hash,
  Building,
  Database,
  AlertTriangle
} from 'lucide-react'
import { apiClient } from '@/lib/api'

// Types
interface SPBU {
  id: number
  name: string
  code: string
  location?: string
}

interface Tank {
  id: number
  name: string
  fuel_type: string
  capacity: number
  current_stock: number
  spbu_id: number
}

interface DeliveryFormData {
  spbuId: number | null
  deliveryOrderNumber: string
  supplier: string
  fuelType: string
  plannedLiters: number
  hargaBeli: number | null
}

interface SuperAdminDeliveryFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading: boolean
}

export function SuperAdminDeliveryForm({ onSubmit, onCancel, isLoading }: SuperAdminDeliveryFormProps) {
  // Form state
  const [formData, setFormData] = useState<DeliveryFormData>({
    spbuId: null,
    deliveryOrderNumber: '',
    supplier: 'PT PERTAMINA PATRA NIAGA MADIUN',
    fuelType: 'Pertamax',
    plannedLiters: 1, // Change default from 0 to 1 to avoid validation error
    hargaBeli: null
  })

  // Selected SPBU and Tanks
  const [selectedSPBU, setSelectedSPBU] = useState<SPBU | null>(null)
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isFormValid, setIsFormValid] = useState(false)
  
  // Additional state for enhanced features
  const [deliveryDate, setDeliveryDate] = useState<string>(new Date().toISOString().split('T')[0])

  // Fetch SPBUs
  const { data: spbus = [], isLoading: spbusLoading, isError: spbusError } = useQuery({
    queryKey: ['spbus'],
    queryFn: async () => {
      const response = await apiClient.get('/api/spbu')
      return response.data.data
    }
  })

  // Fetch Tanks based on selected SPBU
  const { data: tanks = [], isLoading: tanksLoading, isError: tanksError } = useQuery({
    queryKey: ['tanks', selectedSPBU?.id],
    queryFn: async () => {
      if (!selectedSPBU?.id) return []
      const response = await apiClient.get('/api/tanks')
      // Filter tanks by SPBU ID
      return response.data.data.filter((tank: Tank) => tank.spbu_id === selectedSPBU.id)
    },
    enabled: !!selectedSPBU?.id
  })

  // Validate form
  useEffect(() => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.spbuId) {
      newErrors.spbuId = 'SPBU is required'
    }
    
    if (!formData.deliveryOrderNumber.trim()) {
      newErrors.deliveryOrderNumber = 'Delivery Order Number is required'
    }
    
    if (formData.plannedLiters <= 0) {
      newErrors.plannedLiters = 'Planned liters must be greater than 0'
    }
    
    // Additional validation for SPBU ID
    if (formData.spbuId && (formData.spbuId <= 0 || !Number.isInteger(formData.spbuId))) {
      newErrors.spbuId = 'Invalid SPBU selection. Please select a valid SPBU.'
    }
    
    setErrors(newErrors)
    setIsFormValid(Object.keys(newErrors).length === 0)
    
    console.log('Form validation updated. Errors:', newErrors);
    console.log('formData.spbuId:', formData.spbuId, 'Type:', typeof formData.spbuId);
    console.log('formData.spbuId > 0:', formData.spbuId > 0);
    console.log('formData.spbuId is integer:', Number.isInteger(formData.spbuId));
  }, [formData])

  // Handle SPBU selection
  const handleSPBUChange = (spbuId: string) => {
    console.log('Handle SPBU change called with spbuId:', spbuId, 'Type:', typeof spbuId);
    
    // Parse the SPBU ID to ensure it's a number
    const parsedSpbuId = parseInt(spbuId, 10);
    console.log('Parsed SPBU ID:', parsedSpbuId, 'Type:', typeof parsedSpbuId);
    
    if (isNaN(parsedSpbuId) || parsedSpbuId <= 0) {
      console.error('Invalid SPBU ID received:', spbuId);
      toast.error('Invalid SPBU selection. Please select a valid SPBU.');
      return;
    }
    
    const spbu = spbus.find((s: SPBU) => s.id === parsedSpbuId);
    console.log('Found SPBU:', spbu);
    
    setSelectedSPBU(spbu || null);
    
    setFormData(prev => ({
      ...prev,
      spbuId: parsedSpbuId  // Ensure it's a number
    }));
    
    console.log('Updated formData.spbuId:', parsedSpbuId);
  }

  // Handle form field changes
  const handleFieldChange = (field: keyof DeliveryFormData, value: string | number | null) => {
    // Special handling for plannedLiters to ensure it's always a number
    if (field === 'plannedLiters') {
      const numericValue = value === null || value === '' ? 0 : Number(value);
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }));
      return;
    }
    
    // Special validation for hargaBeli to allow null values
    if (field === 'hargaBeli') {
      setFormData(prev => ({
        ...prev,
        [field]: value === null || value === '' ? null : Number(value)
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Re-validate before submitting
    const newErrors: Record<string, string> = {}
    
    if (!formData.spbuId) {
      newErrors.spbuId = 'SPBU is required'
    }
    
    if (!formData.deliveryOrderNumber.trim()) {
      newErrors.deliveryOrderNumber = 'Delivery Order Number is required'
    }
    
    if (formData.plannedLiters <= 0) {
      newErrors.plannedLiters = 'Planned liters must be greater than 0'
    }
    
    setErrors(newErrors)
    
    // Check for validation errors
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix validation errors before submitting')
      return
    }
    
    // Validate SPBU ID
    if (!formData.spbuId || formData.spbuId <= 0) {
      console.error('Invalid SPBU ID:', formData.spbuId);
      toast.error('Invalid SPBU selection. Please select a valid SPBU.');
      return;
    }
    
    // Prepare data for submission with all required fields
    const submissionData = {
      spbuId: formData.spbuId,  // Keep original field name
      deliveryOrderNumber: formData.deliveryOrderNumber,
      supplier: formData.supplier,
      fuelType: formData.fuelType,
      plannedLiters: formData.plannedLiters,
      hargaBeli: formData.hargaBeli
    }
    
    console.log('Final submission data being sent from superadmin form:', submissionData);
    console.log('spbuId:', submissionData.spbuId, 'Type:', typeof submissionData.spbuId);
    console.log('spbuId truthy:', !!submissionData.spbuId);
    console.log('spbuId > 0:', submissionData.spbuId > 0);
    console.log('spbuId is integer:', Number.isInteger(submissionData.spbuId));
    
    onSubmit(submissionData)
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
            <Fuel className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Delivery</h1>
            <p className="text-muted-foreground text-sm">
              Create a new fuel delivery
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="px-4 py-2 h-auto"
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Information Section */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-3 mb-4">
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="spbu" className="flex items-center gap-2 text-sm font-medium">
                  <Building className="h-4 w-4" />
                  Select SPBU <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.spbuId?.toString() || ''}
                  onValueChange={(value) => {
                    console.log('SPBU Select onValueChange called with value:', value, 'Type:', typeof value);
                    handleSPBUChange(value);
                  }}
                  disabled={spbusLoading}
                >
                  <SelectTrigger 
                    className={`h-11 ${errors.spbuId ? 'border-destructive' : ''}`}
                  >
                    <SelectValue placeholder="Select SPBU">
                      {selectedSPBU ? `${selectedSPBU.name} (${selectedSPBU.code})` : 'Select SPBU'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {spbusLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          Loading SPBUs...
                        </div>
                      </SelectItem>
                    ) : spbusError ? (
                      <SelectItem value="error" disabled>
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          Failed to load SPBUs
                        </div>
                      </SelectItem>
                    ) : (
                      spbus.map((spbu: SPBU) => (
                        <SelectItem key={spbu.id} value={spbu.id.toString()}>
                          <div className="flex items-center gap-3 py-1">
                            <div className="p-1 rounded bg-blue-50 text-blue-600">
                              <Building className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{spbu.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {spbu.code}
                                {spbu.location && ` • ${spbu.location}`}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.spbuId && (
                  <p className="text-destructive text-sm flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.spbuId}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="deliveryOrderNumber" className="flex items-center gap-2 text-sm font-medium">
                  <Hash className="h-4 w-4" />
                  Delivery Order Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deliveryOrderNumber"
                  value={formData.deliveryOrderNumber}
                  onChange={(e) => handleFieldChange('deliveryOrderNumber', e.target.value)}
                  placeholder="Enter delivery order number"
                  className={`h-11 ${errors.deliveryOrderNumber ? 'border-destructive' : ''}`}
                />
                {errors.deliveryOrderNumber && (
                  <p className="text-destructive text-sm flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.deliveryOrderNumber}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hargaBeli" className="flex items-center gap-2 text-sm font-medium">
                  Harga Beli (IDR/L)
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">Rp</span>
                  <Input
                    id="hargaBeli"
                    type="number"
                    step="0.01"
                    value={formData.hargaBeli || ''}
                    onChange={(e) => handleFieldChange('hargaBeli', parseFloat(e.target.value) || null)}
                    placeholder="Enter purchase price per liter"
                    className="h-11 pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-sm font-medium">
                Supplier
              </Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleFieldChange('supplier', e.target.value)}
                placeholder="Enter supplier name"
                readOnly
                className="h-11 bg-muted"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="fuelType" className="text-sm font-medium">
                  Fuel Type
                </Label>
                <Input
                  id="fuelType"
                  value={formData.fuelType}
                  onChange={(e) => handleFieldChange('fuelType', e.target.value)}
                  placeholder="Enter fuel type"
                  readOnly
                  className="h-11 bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedLiters" className="flex items-center gap-2 text-sm font-medium">
                  <Droplets className="h-4 w-4" />
                  Planned Liters <span className="text-destructive">*</span>
                </Label>
                <Input
  id="plannedLiters"
  type="number"
  step="0.01"
  value={formData.plannedLiters}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    // Ensure value is at least 1 to avoid validation error
    const validatedValue = isNaN(value) || value <= 0 ? 1 : value;
    handleFieldChange('plannedLiters', validatedValue);
  }}
  placeholder="Enter planned liters"
  className={`h-11 ${errors.plannedLiters ? 'border-destructive' : ''}`}
/>
                {errors.plannedLiters && (
                  <p className="text-destructive text-sm flex items-start gap-1.5 mt-1.5">
                    <AlertCircle className="h-1 w-1 flex-shrink-0 mt-0.5" />
                    <span>{errors.plannedLiters}</span>
                  </p>
                )}
              </div>
            </div>

            
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="h-11 px-6 py-2.5"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !isFormValid}
            className="h-11 px-6 py-2.5 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Create Delivery</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}