import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Edit } from 'lucide-react'
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
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess, hasReadOnlyAccess } from '@/lib/rbac'
import { apiClient, spbuApi, tankApi } from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobilePricesList } from './components/mobile-prices-list'
import { MobilePricesForm } from './components/mobile-prices-form'

// Types
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

interface Price {
  id: number
  spbu_id: number | null
  fuel_type: 'Premium' | 'Pertamax' | 'Pertalite' | 'Solar' | 'Dexlite'
  price: string
  effective_date: string
  updated_by: number
  created_at: string
  updated_at: string
  SPBU?: {
    name: string
    code: string
  }
  updated_by_user?: {
    name: string
  }
}

// API functions
const fetchPrices = async (): Promise<Price[]> => {
  try {
    const response = await apiClient.get('/api/prices')
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching prices:', error)
    throw error
  }
}

const fetchSPBUs = async (): Promise<SPBU[]> => {
  try {
    const response = await spbuApi.getAll()
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching SPBUs:', error)
    throw error
  }
}

const fetchTanks = async (): Promise<Tank[]> => {
  try {
    const response = await tankApi.getAll()
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching tanks:', error)
    throw error
  }
}

const createPrice = async (priceData: any): Promise<Price> => {
  try {
    const response = await apiClient.post('/api/prices', priceData)
    return response.data.data
  } catch (error: any) {
    console.error('Error creating price:', error)
    throw error
  }
}

const updatePrice = async ({ id, ...priceData }: { id: number, price: string, spbu_id?: number }): Promise<Price> => {
  try {
    const response = await apiClient.put(`/api/prices/${id}`, priceData)
    return response.data.data
  } catch (error: any) {
    console.error('Error updating price:', error)
    throw error
  }
}

const PricesManagementPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore().auth
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPrice, setEditingPrice] = useState<Price | null>(null)
  const isMobile = useIsMobile()

  // Check if user has access to prices management
  const userHasAccess = user ? hasAccess(user, 'prices') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'prices') : false
  const userHasReadOnlyAccess = user ? hasReadOnlyAccess(user, 'prices') : false
  const isReadOnly = userHasReadOnlyAccess && !userHasFullAccess

  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])

  // Fetch data
  const { data: prices = [], isLoading: pricesLoading, isError: pricesError } = useQuery({
    queryKey: ['prices'],
    queryFn: fetchPrices,
    enabled: userHasAccess
  })

  const { data: spbus = [], isLoading: spbusLoading, isError: spbusError } = useQuery({
    queryKey: ['spbus'],
    queryFn: fetchSPBUs,
    enabled: userHasAccess && user?.Role?.name === 'Super Admin'
  })

  const { data: tanks = [], isLoading: tanksLoading, isError: tanksError } = useQuery({
    queryKey: ['tanks'],
    queryFn: fetchTanks,
    enabled: userHasAccess
  })

  // Filter prices based on search term
  const filteredPrices = prices.filter(price => 
    price.fuel_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (price.SPBU?.name && price.SPBU.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (price.SPBU?.code && price.SPBU.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (price.updated_by_user?.name && price.updated_by_user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Mutations
  const createPriceMutation = useMutation({
    mutationFn: createPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prices'] })
      toast.success('Price created successfully')
      setIsCreateDialogOpen(false)
      // Reset form
      setCreateFormData({
        fuelType: 'Pertamax',
        price: 0,
        spbuId: user?.Role?.name === 'Super Admin' ? null : undefined,
        tankId: null,
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create price')
    }
  })

  const updatePriceMutation = useMutation({
    mutationFn: updatePrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prices'] })
      toast.success('Price updated successfully')
      setIsEditDialogOpen(false)
      setEditingPrice(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update price')
    }
  })

  // Form states
  const [createFormData, setCreateFormData] = useState({
    fuelType: 'Pertamax',
    price: 0,
    spbuId: user?.Role?.name === 'Super Admin' ? null : undefined,
    tankId: null as number | null,
  })

  const [editFormData, setEditFormData] = useState({
    price: 0,
    tankId: null as number | null,
  })

  // Handle create form changes
  const handleCreateFormChange = (field: string, value: string | number | null) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle edit form changes
  const handleEditFormChange = (field: string, value: string | number | null) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle create price
  const handleCreatePrice = () => {
    // Validate required fields
    if (parseFloat(createFormData.price.toString()) <= 0) {
      toast.error('Price must be greater than 0')
      return
    }
    
    createPriceMutation.mutate({
      fuelType: createFormData.fuelType,
      price: createFormData.price,
      spbu_id: createFormData.spbuId,
      tank_id: createFormData.tankId,
    })
  }

  // Handle edit price
  const handleEditPrice = () => {
    if (!editingPrice) return
    
    // Validate required fields
    if (parseFloat(editFormData.price.toString()) <= 0) {
      toast.error('Price must be greater than 0')
      return
    }
    
    updatePriceMutation.mutate({
      id: editingPrice.id,
      price: editFormData.price,
      tank_id: editFormData.tankId,
    })
  }

  // Open edit dialog
  const openEditDialog = (price: Price) => {
    setEditingPrice(price)
    setEditFormData({
      price: parseFloat(price.price),
      tankId: null, // We don't have tankId in the current data model, but keeping it for completeness
    })
    setIsEditDialogOpen(true)
  }

  // Close edit dialog
  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingPrice(null)
  }

  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }

  // Mobile view
  if (isMobile) {
    // If we're creating a price, show the mobile form
    if (isCreateDialogOpen && !isReadOnly) {
      return (
        <div className="space-y-6">
          <MobilePricesForm
            formData={createFormData}
            spbus={spbus}
            tanks={tanks}
            isCreating={true}
            isEditing={false}
            isLoading={createPriceMutation.isPending}
            userRole={user?.Role?.name}
            userSpbuId={user?.spbu_id}
            onChange={handleCreateFormChange}
            onSubmit={handleCreatePrice}
            onCancel={() => setIsCreateDialogOpen(false)}
            isReadOnly={isReadOnly}
          />
        </div>
      )
    }
    
    // If we're editing a price, show the mobile form
    if (isEditDialogOpen && editingPrice && !isReadOnly) {
      return (
        <div className="space-y-6">
          <MobilePricesForm
            formData={editFormData}
            spbus={spbus}
            tanks={tanks}
            isCreating={false}
            isEditing={true}
            isLoading={updatePriceMutation.isPending}
            userRole={user?.Role?.name}
            userSpbuId={user?.spbu_id}
            onChange={handleEditFormChange}
            onSubmit={handleEditPrice}
            onCancel={closeEditDialog}
            isReadOnly={isReadOnly}
            editingPrice={editingPrice}
          />
        </div>
      )
    }
    
    // Otherwise, show the mobile prices list
    return (
      <div className="space-y-6">
        <MobilePricesList
          prices={filteredPrices}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddPrice={() => setIsCreateDialogOpen(true)}
          onEditPrice={openEditDialog}
          isLoading={pricesLoading}
          isError={pricesError}
          isReadOnly={isReadOnly}
        />
      </div>
    )
  }

  if (pricesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading prices...</span>
      </div>
    )
  }

  if (pricesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Prices</div>
          <div className="text-gray-600 mb-4">Failed to load prices data. Please try again later.</div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['prices'] })}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prices Management</h1>
          <p className="text-muted-foreground">
            {isReadOnly 
              ? 'View current fuel prices' 
              : 'Manage fuel prices'}
          </p>
        </div>
        {!isReadOnly && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Price
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Price</DialogTitle>
                <DialogDescription>
                  Add a new fuel price. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fuel_type" className="text-right">
                    Fuel Type
                  </Label>
                  <Select
                    value={createFormData.fuelType}
                    onValueChange={(value) => handleCreateFormChange('fuelType', value)}
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
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={createFormData.price}
                    onChange={(e) => handleCreateFormChange('price', parseFloat(e.target.value) || 0)}
                    className="col-span-3"
                  />
                </div>
                {user?.Role?.name === 'Super Admin' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="spbu" className="text-right">
                      SPBU
                    </Label>
                    <Select
                      value={createFormData.spbuId === null ? 'global' : createFormData.spbuId?.toString() || 'global'}
                      onValueChange={(value) => handleCreateFormChange('spbuId', value === 'global' ? null : parseInt(value))}
                    >
                      <SelectTrigger className="col-span-3">
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tank" className="text-right">
                    Tank
                  </Label>
                  <Select
                  value={createFormData.tankId ? createFormData.tankId.toString() : 'none'}
                  onValueChange={(value) => handleCreateFormChange('tankId', value === 'none' ? null : parseInt(value))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select tank (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {tanks
                        .filter(tank => 
                          user?.Role?.name === 'Super Admin' || 
                          tank.spbu_id === user?.spbu_id
                        )
                        .map((tank) => (
                          <SelectItem key={tank.id} value={tank.id.toString()}>
                            {tank.name} - {tank.fuel_type} ({tank.current_stock}L / {tank.capacity}L)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
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
                  onClick={handleCreatePrice}
                  disabled={createPriceMutation.isPending}
                >
                  {createPriceMutation.isPending ? 'Creating...' : 'Create Price'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prices</CardTitle>
          <CardDescription>
            {isReadOnly 
              ? 'View all current fuel prices' 
              : 'Manage all fuel prices'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search prices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fuel Type</TableHead>
                <TableHead>SPBU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Updated By</TableHead>
                {!isReadOnly && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isReadOnly ? 5 : 6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">No prices found</div>
                      {searchTerm && (
                        <div className="text-sm text-gray-500">
                          No prices match your search for "{searchTerm}"
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell className="font-medium">{price.fuel_type}</TableCell>
                    <TableCell>
                      {price.spbu_id 
                        ? (price.SPBU ? `${price.SPBU.name} (${price.SPBU.code})` : `SPBU ${price.spbu_id}`) 
                        : 'Global'}
                    </TableCell>
                    <TableCell>Rp {parseFloat(price.price).toFixed(2)}</TableCell>
                    <TableCell>{new Date(price.effective_date).toLocaleDateString()}</TableCell>
                    <TableCell>{price.updated_by_user ? price.updated_by_user.name : '-'}</TableCell>
                    {!isReadOnly && (
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(price)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Price</DialogTitle>
            <DialogDescription>
              Update the fuel price. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingPrice && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_fuel_type" className="text-right">
                  Fuel Type
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit_fuel_type"
                    value={editingPrice.fuel_type}
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_price" className="text-right">
                  Price
                </Label>
                <Input
                  id="edit_price"
                  type="number"
                  step="0.01"
                  value={editFormData.price}
                  onChange={(e) => handleEditFormChange('price', parseFloat(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_spbu" className="text-right">
                  SPBU
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit_spbu"
                    value={editingPrice.spbu_id 
                      ? (editingPrice.SPBU ? `${editingPrice.SPBU.name} (${editingPrice.SPBU.code})` : `SPBU ${editingPrice.spbu_id}`) 
                      : 'Global'}
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_tank" className="text-right">
                  Tank
                </Label>
                <Select
                  value={editFormData.tankId ? editFormData.tankId.toString() : 'none'}
                  onValueChange={(value) => handleEditFormChange('tankId', value === 'none' ? null : parseInt(value))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select tank (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {tanks
                      .filter(tank => 
                        user?.Role?.name === 'Super Admin' || 
                        tank.spbu_id === user?.spbu_id
                      )
                      .map((tank) => (
                        <SelectItem key={tank.id} value={tank.id.toString()}>
                          {tank.name} - {tank.fuel_type} ({tank.current_stock}L / {tank.capacity}L)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeEditDialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditPrice}
              disabled={updatePriceMutation.isPending}
            >
              {updatePriceMutation.isPending ? 'Updating...' : 'Update Price'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PricesManagementPage