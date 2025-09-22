import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { Plus, Check, ThumbsUp, Eye } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { apiClient, getCookie } from '@/lib/api'
import { Link } from '@tanstack/react-router'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileDeliveriesList } from './components/mobile-deliveries-list'
import { MobileDeliveriesForm } from './components/mobile-deliveries-form'
import { PendingDeliveryAnimation } from '@/components/PendingDeliveryAnimation'
import { SuperAdminDeliveryForm } from './components/superadmin-deliveries-form'

// Types
interface Delivery {
  id: number
  spbu_id: number
  supplier: string
  delivery_order_number: string
  delivery_order_photo?: string
  fuel_type: string
  planned_liters: string
  actual_liters?: string
  delivery_date: string
  status: 'pending' | 'confirmed' | 'approved'
  created_at: string
  updated_at: string
  SPBU?: {
    name: string
    code: string
  }
  confirmer?: {
    name: string
  }
  approver?: {
    name: string
  }
}

// API functions
const fetchDeliveries = async (): Promise<Delivery[]> => {
  const response = await apiClient.get('/api/deliveries')
  return response.data.data
}

const fetchAllDeliveriesForOperator = async (): Promise<Delivery[]> => {
  const response = await apiClient.get('/api/deliveries/operator')
  return response.data.data
}

const fetchDeliveriesReadyForConfirmation = async (): Promise<Delivery[]> => {
  const response = await apiClient.get('/api/deliveries/ready-for-confirmation')
  return response.data.data
}

const createDelivery = async (deliveryData: any): Promise<Delivery> => {
  // For superadmin data with SPBU and Tank relations, we still use the regular endpoint
  // but with additional fields
  try {
    console.log('=== CREATE DELIVERY DEBUG ===');
    console.log('Original deliveryData received:', deliveryData);
    
    // Check if this is superadmin data (has spbu_id field)
    if (deliveryData.spbu_id !== undefined && deliveryData.spbu_id !== null) {
      console.log('Processing superadmin delivery data');
      
      // Prepare data for submission with SPBU relation
      const superAdminDeliveryData = {
        spbu_id: Number(deliveryData.spbu_id),  // Ensure it's a number
        deliveryOrderNumber: String(deliveryData.deliveryOrderNumber || ''),  // Backend expects deliveryOrderNumber
        supplier: String(deliveryData.supplier || 'PT PERTAMINA PATRA NIAGA MADIUN'),  // Backend expects supplier
        fuelType: String(deliveryData.fuelType || 'Pertamax'),  // Backend expects fuelType (not fuel_type)
        liters: Number(deliveryData.liters),  // Backend expects liters
        hargaBeli: deliveryData.hargaBeli !== undefined && deliveryData.hargaBeli !== null ? Number(deliveryData.hargaBeli) : null  // Backend expects hargaBeli (not harga_beli)
      }
      
      console.log('Sending superAdminDeliveryData (final for backend):', superAdminDeliveryData);
      console.log('spbu_id value:', superAdminDeliveryData.spbu_id);
      console.log('spbu_id type:', typeof superAdminDeliveryData.spbu_id);
      console.log('spbu_id truthy:', !!superAdminDeliveryData.spbu_id);
      console.log('spbu_id > 0:', superAdminDeliveryData.spbu_id > 0);
      console.log('spbu_id is integer:', Number.isInteger(superAdminDeliveryData.spbu_id));
      
      // Validate required fields before sending
      if (!superAdminDeliveryData.spbu_id || superAdminDeliveryData.spbu_id <= 0 || !Number.isInteger(superAdminDeliveryData.spbu_id)) {
        console.error('Invalid spbu_id detected:', superAdminDeliveryData.spbu_id);
        throw new Error('Invalid SPBU selection. Please select a valid SPBU.');
      }
      
      // Validate that required fields are present
      if (!superAdminDeliveryData.fuelType || superAdminDeliveryData.liters <= 0) {
        console.error('Missing required fields:', { 
          fuelType: superAdminDeliveryData.fuelType, 
          liters: superAdminDeliveryData.liters 
        });
        throw new Error('Please provide all required fields');
      }
      
      console.log('About to send POST request to /api/deliveries with data:', superAdminDeliveryData);
      
      const response = await apiClient.post('/api/deliveries', superAdminDeliveryData);
      console.log('Received successful response from /api/deliveries:', response.data);
      return response.data.data;
    } else {
      console.log('Processing regular delivery data');
      
      // Regular delivery data (backward compatibility)
      const regularDeliveryData = {
        deliveryOrderNumber: String(deliveryData.deliveryOrderNumber || ''),
        supplier: String(deliveryData.supplier || 'PT PERTAMINA PATRA NIAGA MADIUN'),
        fuelType: String(deliveryData.fuelType || 'Pertamax'),
        liters: Number(deliveryData.liters || 0),
        hargaBeli: deliveryData.hargaBeli !== undefined && deliveryData.hargaBeli !== null ? Number(deliveryData.hargaBeli) : null
      };
      
      console.log('Sending regularDeliveryData:', regularDeliveryData);
      
      // Validate that required fields are present
      if (!regularDeliveryData.fuelType || regularDeliveryData.liters <= 0) {
        console.error('Missing required fields:', { 
          fuelType: regularDeliveryData.fuelType, 
          liters: regularDeliveryData.liters 
        });
        throw new Error('Please provide all required fields');
      }
      
      const response = await apiClient.post('/api/deliveries', regularDeliveryData);
      console.log('Received successful response from /api/deliveries:', response.data);
      return response.data.data;
    }
  } catch (error: any) {
    console.error('=== CREATE DELIVERY ERROR ===');
    console.error('Error from /api/deliveries:', error.response?.data || error.message);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    console.error('Full error object:', error);
    throw error;
  }
}

const confirmDelivery = async (id: number): Promise<Delivery> => {
  const response = await apiClient.put(`/api/deliveries/${id}/confirm`)
  return response.data.data
}

const approveDelivery = async (id: number): Promise<Delivery> => {
  const response = await apiClient.put(`/api/deliveries/${id}/approve`)
  return response.data.data
}

const DeliveriesManagementPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { user } = useAuthStore().auth
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const isMobile = useIsMobile()

  // Log user context for debugging
  console.log('=== USER CONTEXT DEBUG ===');
  console.log('User:', user);
  console.log('User roles array:', user?.role);
  console.log('First role:', user?.role?.[0]);
  console.log('User SPBU ID:', user?.spbu_id);
  console.log('Is Super Admin:', user?.role?.includes('Super Admin'));
  console.log('=== END USER CONTEXT DEBUG ===');

  // Confirmation form state
  const [confirmFormData, setConfirmFormData] = useState({
    actualLiters: 0,
    harga_beli: null as number | null,
    deliveryOrderPhoto: null as File | null,
    photoPreview: ''
  })
  const userHasAccess = user ? hasAccess(user, 'deliveries') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'deliveries') : false
  const isReadOnly = !userHasFullAccess
  const isOperator = user?.role.includes('Operator')

  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])

  // Check for tank information from navigation state
  useEffect(() => {
    // @ts-ignore
    if (location?.state?.fromTank) {
      // @ts-ignore
      const { fuelType, currentStock } = location.state.fromTank;
      // Pre-populate form with tank information
      setCreateFormData(prev => ({
        ...prev,
        fuelType: fuelType || prev.fuelType,
      }));
      
      // Open the create dialog automatically when coming from tank low stock alert
      setIsCreateDialogOpen(true);
      
      // Show a toast notification
      toast.info(`Creating delivery for low stock tank`, {
        description: `Fuel type: ${fuelType}, Current stock: ${currentStock}L`
      });
    }
  }, [location]);

  // Fetch data
  const { data: deliveries = [], isLoading: deliveriesLoading, isError: deliveriesError } = useQuery({
    queryKey: ['deliveries'],
    queryFn: isOperator ? fetchAllDeliveriesForOperator : fetchDeliveries,
    enabled: userHasAccess
  })

  // Filter deliveries based on search term
  const filteredDeliveries = deliveries.filter(delivery => 
    delivery.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.fuel_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (delivery.SPBU?.name && delivery.SPBU.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (delivery.SPBU?.code && delivery.SPBU.code.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Check if delivery is eligible for confirmation (H+1 rule)
  const isDeliveryEligibleForConfirmation = (delivery: Delivery): boolean => {
    if (delivery.status !== 'pending') return false;
    
    const createdDate = new Date(delivery.created_at);
    const today = new Date();
    
    // Set time to beginning of day for both dates
    const createdDay = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Add one day to created date to get H+1
    const hPlusOne = new Date(createdDay);
    hPlusOne.setDate(createdDay.getDate() + 1);
    
    // Delivery is eligible if today is H+1 or later
    return todayDay >= hPlusOne;
  }

  // Mutations
  const createDeliveryMutation = useMutation({
    mutationFn: createDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
      toast.success('Delivery created successfully')
      setIsCreateDialogOpen(false)
      // Reset form
      setCreateFormData({
        deliveryOrderNumber: '',
        supplier: 'PT PERTAMINA PATRA NIAGA MADIUN',
        fuelType: 'Pertamax',
        liters: 0,
      })
    },
    onError: (error: any) => {
      console.log('=== CREATE DELIVERY MUTATION ERROR ===');
      console.log('Full error object:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error message:', error.message);
      
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           'Failed to create delivery';
      
      console.log('Displaying error message:', errorMessage);
      toast.error(errorMessage)
    }
  })

  const confirmDeliveryMutation = useMutation({
    mutationFn: confirmDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
      toast.success('Delivery confirmed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to confirm delivery')
    }
  })

  const approveDeliveryMutation = useMutation({
    mutationFn: approveDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
      toast.success('Delivery approved successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve delivery')
    }
  })

  // Form states
  const [createFormData, setCreateFormData] = useState({
    deliveryOrderNumber: '',
    supplier: 'PT PERTAMINA PATRA NIAGA MADIUN',
    fuelType: 'Pertamax',
    liters: 0,
    harga_beli: null as number | null
  })

  // Handle confirmation form changes
  const handleConfirmFormChange = (field: string, value: string | number | File) => {
    if (field === 'deliveryOrderPhoto' && value instanceof File) {
      setConfirmFormData(prev => ({
        ...prev,
        deliveryOrderPhoto: value,
        photoPreview: URL.createObjectURL(value)
      }))
    } else {
      setConfirmFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Handle create form changes
  const handleCreateFormChange = (field: string, value: string | number) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }))
  }

  // Reset confirmation form
  const resetConfirmForm = () => {
    setConfirmFormData({
      actualLiters: 0,
      deliveryOrderPhoto: null,
      photoPreview: ''
    })
    setSelectedDelivery(null)
  }

  // Open confirmation dialog
  const openConfirmDialog = (delivery: Delivery) => {
    setSelectedDelivery(delivery)
    setConfirmFormData({
      actualLiters: parseFloat(delivery.planned_liters) || 0,
      deliveryOrderPhoto: null,
      photoPreview: ''
    })
    setIsConfirmDialogOpen(true)
  }

  // Open detail dialog
  const openDetailDialog = (delivery: Delivery) => {
    setSelectedDelivery(delivery)
    setIsDetailDialogOpen(true)
  }

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setIsConfirmDialogOpen(false)
    resetConfirmForm()
  }

  // Close detail dialog
  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false)
    setSelectedDelivery(null)
  }

  // Handle create delivery
  const handleCreateDelivery = (deliveryData: any) => {
    console.log('=== HANDLE CREATE DELIVERY DEBUG ===');
    console.log('Received deliveryData in handleCreateDelivery:', deliveryData);
    console.log('Checking for spbuId:', deliveryData.spbuId, 'Type:', typeof deliveryData.spbuId);
    
    // Check if this is data from SuperAdminDeliveryForm (has spbuId)
    if (deliveryData.spbuId !== undefined && deliveryData.spbuId !== null) {
      console.log('Processing superadmin delivery data');
      
      // Validate required fields for superadmin form
      if (deliveryData.plannedLiters <= 0) {
        toast.error('Planned liters must be greater than 0')
        return
      }
      
      // Validate SPBU ID
      const spbuId = Number(deliveryData.spbuId);
      if (!spbuId || spbuId <= 0 || !Number.isInteger(spbuId)) {
        console.error('Invalid SPBU ID:', deliveryData.spbuId);
        toast.error('Invalid SPBU selection. Please select a valid SPBU.')
        return
      }
      
      // Prepare data for submission with SPBU relation
      // Map frontend field names to backend field names (keeping backend expected names)
      const superAdminDeliveryData = {
        spbu_id: spbuId,  // Backend expects spbu_id
        deliveryOrderNumber: deliveryData.deliveryOrderNumber || '',  // Backend expects deliveryOrderNumber
        supplier: deliveryData.supplier,  // Backend expects supplier
        fuelType: deliveryData.fuelType || 'Pertamax',  // Backend expects fuelType (not fuel_type)
        liters: deliveryData.plannedLiters,  // Backend expects liters (not planned_liters)
        hargaBeli: deliveryData.hargaBeli  // Backend expects hargaBeli (not harga_beli)
      }
      
      console.log('Sending superAdminDeliveryData (backend expected field names):', superAdminDeliveryData);
      
      createDeliveryMutation.mutate(superAdminDeliveryData)
    } else {
      console.log('Processing regular delivery data');
      console.log('spbuId condition:', deliveryData.spbuId !== undefined && deliveryData.spbuId !== null);
      
      // Regular form data (backward compatibility)
      // Validate required fields
      if (parseFloat(createFormData.liters.toString()) <= 0) {
        toast.error('Liters must be greater than 0')
        return
      }
      
      // Prepare data for submission
      // Use backend expected field names
      const regularDeliveryData = {
        deliveryOrderNumber: createFormData.deliveryOrderNumber,
        supplier: createFormData.supplier,
        fuelType: createFormData.fuelType,
        liters: createFormData.liters,
        hargaBeli: createFormData.harga_beli
      }
      
      // Log the data being sent
      console.log('Sending delivery data to backend:', regularDeliveryData);
      
      createDeliveryMutation.mutate(regularDeliveryData)
    }
  }

  // Handle confirm delivery
  const handleConfirmDelivery = async (id: number) => {
    if (!selectedDelivery) return;

    // Validate required fields
    if (confirmFormData.actualLiters <= 0) {
      toast.error('Actual liters must be greater than 0')
      return
    }

    if (!confirmFormData.deliveryOrderPhoto) {
      toast.error('Delivery order photo is required')
      return
    }

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('actualLiters', confirmFormData.actualLiters.toString())
      if (confirmFormData.harga_beli) {
        formData.append('hargaBeli', confirmFormData.harga_beli.toString())
      }
      formData.append('deliveryOrderPhoto', confirmFormData.deliveryOrderPhoto)

      // Send confirmation request with photo
      const response = await apiClient.put(`/api/deliveries/${id}/confirm-with-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['deliveries'] })
        toast.success('Delivery confirmed successfully')
        closeConfirmDialog()
      } else {
        toast.error(response.data.message || 'Failed to confirm delivery')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm delivery')
    }
  }

  // Handle approve delivery
  const handleApproveDelivery = (id: number) => {
    if (window.confirm('Are you sure you want to approve this delivery?')) {
      approveDeliveryMutation.mutate(id)
    }
  }

  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }

  // Mobile view
  if (isMobile) {
    // If we're creating a delivery, show the appropriate form
    if (isCreateDialogOpen && !isReadOnly && !isOperator) {
      if (user?.role.includes('Super Admin')) {
        // Super Admin mobile form
        return (
          <div className="space-y-6">
            <SuperAdminDeliveryForm
              onSubmit={handleCreateDelivery}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={createDeliveryMutation.isPending}
            />
          </div>
        )
      } else {
        // Regular mobile form
        return (
          <div className="space-y-6">
            <MobileDeliveriesForm
              formData={createFormData}
              isCreating={true}
              isConfirming={false}
              isLoading={createDeliveryMutation.isPending}
              onChange={(field, value) => handleCreateFormChange(field, value as string | number)}
              onSubmit={handleCreateDelivery}
              onCancel={() => setIsCreateDialogOpen(false)}
              isReadOnly={isReadOnly}
            />
          </div>
        )
      }
    }
    
    // If we're confirming a delivery, show the mobile form
    if (isConfirmDialogOpen && selectedDelivery) {
      return (
        <div className="space-y-6">
          <MobileDeliveriesForm
            formData={confirmFormData}
            isCreating={false}
            isConfirming={true}
            isLoading={confirmDeliveryMutation.isPending}
            onChange={(field, value) => handleConfirmFormChange(field, value)}
            onSubmit={() => handleConfirmDelivery(selectedDelivery.id)}
            onCancel={closeConfirmDialog}
            isReadOnly={isReadOnly}
            selectedDelivery={selectedDelivery}
          />
        </div>
      )
    }
    
    // If we're viewing details, show the mobile form
    if (isDetailDialogOpen && selectedDelivery) {
      return (
        <div className="space-y-6">
          <MobileDeliveriesForm
            formData={{}}
            isCreating={false}
            isConfirming={false}
            isLoading={false}
            onChange={() => {}}
            onSubmit={() => {}}
            onCancel={closeDetailDialog}
            isReadOnly={true}
            selectedDelivery={selectedDelivery}
          />
        </div>
      )
    }
    
    // Otherwise, show the mobile deliveries list
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4 pt-2">
          <div>
            <h1 className="text-2xl font-bold">{isOperator ? 'Confirm Deliveries' : 'Deliveries Management'}</h1>
            <p className="text-muted-foreground text-sm">
              {isOperator 
                ? 'Confirm deliveries that are ready (H+1)' 
                : isReadOnly 
                  ? 'View deliveries in the system' 
                  : 'Manage deliveries'}
            </p>
          </div>
        </div>
        <MobileDeliveriesList
          deliveries={filteredDeliveries}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddDelivery={() => setIsCreateDialogOpen(true)}
          onViewDetail={openDetailDialog}
          onConfirmDelivery={openConfirmDialog}
          onApproveDelivery={(delivery) => {
            if (window.confirm('Are you sure you want to approve this delivery?')) {
              approveDeliveryMutation.mutate(delivery.id)
            }
          }}
          isLoading={deliveriesLoading}
          isError={deliveriesError}
          isReadOnly={isReadOnly}
          isOperator={isOperator}
          isDeliveryEligibleForConfirmation={isDeliveryEligibleForConfirmation}
        />
      </div>
    )
  }

  if (deliveriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading deliveries...</span>
      </div>
    )
  }

  if (deliveriesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Deliveries</div>
          <div className="text-gray-600 mb-4">Failed to load deliveries data. Please try again later.</div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['deliveries'] })}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{isOperator ? 'Confirm Deliveries' : 'Deliveries Management'}</h1>
            <p className="text-muted-foreground">
              {isOperator 
                ? 'Confirm deliveries that are ready for confirmation (H+1)' 
                : isReadOnly 
                  ? 'View deliveries in the system' 
                  : 'Manage deliveries'}
            </p>
          </div>
        </div>
        {!isReadOnly && !isOperator && (
          <>
            {user?.role.includes('Super Admin') ? (
              // Super Admin form dialog
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Delivery
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <SuperAdminDeliveryForm
                    onSubmit={handleCreateDelivery}
                    onCancel={() => setIsCreateDialogOpen(false)}
                    isLoading={createDeliveryMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              // Regular form dialog for other roles
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Delivery
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Delivery</DialogTitle>
                    <DialogDescription>
                      Add a new fuel delivery. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="delivery_order_number" className="text-right">
                        DO Number
                      </Label>
                      <Input
                        id="delivery_order_number"
                        value={createFormData.deliveryOrderNumber}
                        onChange={(e) => setCreateFormData({...createFormData, deliveryOrderNumber: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="supplier" className="text-right">
                        Supplier
                      </Label>
                      <Input
                        id="supplier"
                        value={createFormData.supplier}
                        readOnly
                        className="col-span-3 bg-gray-100"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fuel_type" className="text-right">
                        Fuel Type
                      </Label>
                      <Select
                        value={createFormData.fuelType}
                        onValueChange={(value) => setCreateFormData({...createFormData, fuelType: value})}
                      >
                        <SelectTrigger className="col-span-3">
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="liters" className="text-right">
                        Liters
                      </Label>
                      <Input
                        id="liters"
                        type="number"
                        step="0.01"
                        value={createFormData.liters}
                        onChange={(e) => setCreateFormData({...createFormData, liters: parseFloat(e.target.value) || 0})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="harga_beli" className="text-right">
                        Harga Beli
                      </Label>
                      <Input
                        id="harga_beli"
                        type="number"
                        step="0.01"
                        value={createFormData.harga_beli || ''}
                        onChange={(e) => setCreateFormData({...createFormData, harga_beli: parseFloat(e.target.value) || null})}
                        className="col-span-3"
                        placeholder="Opsional"
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
                      onClick={handleCreateDelivery}
                      disabled={createDeliveryMutation.isPending}
                    >
                      {createDeliveryMutation.isPending ? 'Creating...' : 'Create Delivery'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}

        {/* Confirmation Dialog for Operators */}
        {isOperator && selectedDelivery && (
          <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Delivery</DialogTitle>
                <DialogDescription>
                  Confirm delivery with actual liters and upload delivery order photo
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fuel_type" className="text-right">
                    Fuel Type
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="fuel_type"
                      value={selectedDelivery.fuel_type}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="planned_liters" className="text-right">
                    Planned Liters
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="planned_liters"
                      value={parseFloat(selectedDelivery.planned_liters).toFixed(2)}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="actual_liters" className="text-right">
                    Actual Liters
                  </Label>
                  <Input
                    id="actual_liters"
                    type="number"
                    step="0.01"
                    value={confirmFormData.actualLiters}
                    onChange={(e) => handleConfirmFormChange('actualLiters', parseFloat(e.target.value) || 0)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="harga_beli_confirm" className="text-right">
                    Harga Beli
                  </Label>
                  <Input
                    id="harga_beli_confirm"
                    type="number"
                    step="0.01"
                    value={confirmFormData.harga_beli || ''}
                    onChange={(e) => handleConfirmFormChange('harga_beli', parseFloat(e.target.value) || null)}
                    className="col-span-3"
                    placeholder="Opsional"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="delivery_order_photo" className="text-right">
                    DO Photo
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="delivery_order_photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleConfirmFormChange('deliveryOrderPhoto', e.target.files[0])}
                    />
                    {confirmFormData.photoPreview && (
                      <div className="mt-2">
                        <img 
                          src={confirmFormData.photoPreview} 
                          alt="Preview" 
                          className="max-w-full h-32 object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={closeConfirmDialog}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleConfirmDelivery(selectedDelivery.id)}
                  disabled={confirmDeliveryMutation.isPending}
                >
                  {confirmDeliveryMutation.isPending ? 'Confirming...' : 'Confirm Delivery'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Detail Delivery Dialog */}
      {selectedDelivery && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Delivery Details</DialogTitle>
              <DialogDescription>
                Detailed information about delivery #{selectedDelivery.id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Animation for pending deliveries */}
              {selectedDelivery.status === 'pending' && (
                <div className="flex justify-center mb-4">
                  <PendingDeliveryAnimation size="md" />
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Created At</Label>
                <div className="col-span-3">
                  {new Date(selectedDelivery.created_at).toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Delivery Date</Label>
                <div className="col-span-3">
                  {new Date(selectedDelivery.delivery_date).toLocaleDateString()}
                </div>
              </div>
              {isOperator && selectedDelivery.status === 'pending' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">H+1 Status</Label>
                  <div className="col-span-3">
                    {isDeliveryEligibleForConfirmation(selectedDelivery) ? (
                      <span className="text-green-600 font-medium">Eligible for confirmation</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">
                        Not eligible yet (Can confirm after {new Date(new Date(selectedDelivery.created_at).setDate(new Date(selectedDelivery.created_at).getDate() + 1)).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">SPBU</Label>
                <div className="col-span-3">
                  {selectedDelivery.SPBU ? `${selectedDelivery.SPBU.name} (${selectedDelivery.SPBU.code})` : '-'}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">DO Number</Label>
                <div className="col-span-3">
                  {selectedDelivery.delivery_order_number || '-'}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Supplier</Label>
                <div className="col-span-3">
                  {selectedDelivery.supplier}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Fuel Type</Label>
                <div className="col-span-3">
                  {selectedDelivery.fuel_type}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Planned Liters</Label>
                <div className="col-span-3">
                  {parseFloat(selectedDelivery.planned_liters).toFixed(2)}
                </div>
              </div>
              {selectedDelivery.actual_liters && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Actual Liters</Label>
                  <div className="col-span-3">
                    {parseFloat(selectedDelivery.actual_liters).toFixed(2)}
                  </div>
                </div>
              )}
              {selectedDelivery.harga_beli && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Harga Beli</Label>
                  <div className="col-span-3">
                    {parseFloat(selectedDelivery.harga_beli).toFixed(2)}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    selectedDelivery.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : selectedDelivery.status === 'confirmed' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedDelivery.status.charAt(0).toUpperCase() + selectedDelivery.status.slice(1)}
                    {isOperator && selectedDelivery.status === 'pending' && !isDeliveryEligibleForConfirmation(selectedDelivery) && (
                      <span className="ml-1 text-xs italic">(Can confirm after H+1)</span>
                    )}
                  </span>
                </div>
              </div>
              {selectedDelivery.confirmer && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Confirmed By</Label>
                  <div className="col-span-3">
                    {selectedDelivery.confirmer.name}
                  </div>
                </div>
              )}
              {selectedDelivery.approver && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Approved By</Label>
                  <div className="col-span-3">
                    {selectedDelivery.approver.name}
                  </div>
                </div>
              )}
              {selectedDelivery.delivery_order_photo && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">DO Photo</Label>
                  <div className="col-span-3">
                    <img 
                      src={selectedDelivery.delivery_order_photo} 
                      alt="Delivery Order" 
                      className="max-w-full h-48 object-contain border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={closeDetailDialog}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isOperator ? 'Deliveries Ready for Confirmation' : 'Deliveries'}</CardTitle>
          <CardDescription>
            {isOperator
              ? 'Deliveries that can be confirmed today (H+1 or later after creation)'
              : isReadOnly 
                ? 'View all deliveries in the system' 
                : 'Manage all deliveries in the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search deliveries..."
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
                <TableHead>DO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Planned Liters</TableHead>
                <TableHead>Actual Liters</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confirmed By</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Detail</TableHead>
                {isOperator && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
                {!isReadOnly && !isOperator && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isReadOnly ? 11 : isOperator ? 12 : 12} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">No deliveries found</div>
                      {searchTerm && (
                        <div className="text-sm text-gray-500">
                          No deliveries match your search for "{searchTerm}"
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">
                      {new Date(delivery.delivery_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {delivery.SPBU ? `${delivery.SPBU.name} (${delivery.SPBU.code})` : '-'}
                    </TableCell>
                    <TableCell>{delivery.delivery_order_number || '-'}</TableCell>
                    <TableCell>{delivery.supplier}</TableCell>
                    <TableCell>{delivery.fuel_type}</TableCell>
                    <TableCell>{parseFloat(delivery.planned_liters).toFixed(2)}</TableCell>
                    <TableCell>{delivery.actual_liters ? parseFloat(delivery.actual_liters).toFixed(2) : '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        delivery.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : delivery.status === 'confirmed' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                        {isOperator && delivery.status === 'pending' && !isDeliveryEligibleForConfirmation(delivery) && (
                          <span className="ml-1 text-xs italic">(H+1)</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{delivery.confirmer ? delivery.confirmer.name : '-'}</TableCell>
                    <TableCell>{delivery.approver ? delivery.approver.name : '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailDialog(delivery)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    {isOperator && delivery.status === 'pending' && (
                      <TableCell className="text-right">
                        <div className="inline-flex items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirmDialog(delivery)}
                            disabled={!isDeliveryEligibleForConfirmation(delivery)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Confirm
                          </Button>
                          {!isDeliveryEligibleForConfirmation(delivery) && (
                            <span className="ml-2 text-xs text-gray-500 italic">
                              Can confirm after H+1
                            </span>
                          )}
                        </div>
                      </TableCell>
                    )}
                    {!isReadOnly && !isOperator && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {delivery.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConfirmDelivery(delivery.id)}
                              disabled={confirmDeliveryMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {delivery.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveDelivery(delivery.id)}
                              disabled={approveDeliveryMutation.isPending}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
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

export default DeliveriesManagementPage