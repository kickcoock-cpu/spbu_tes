import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
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
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { apiClient } from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileSalesList } from './components/mobile-sales-list'
import { MobileSalesForm } from './components/mobile-sales-form'
import { MobileSalesFormWithBLE } from './components/mobile-sales-form-ble'
import { MobileOperatorSales } from './components/mobile-operator-sales'
import { MobileOperatorSalesBLE } from './components/mobile-operator-sales-ble'
import { EnhancedMobileOperatorSales } from './components/enhanced-mobile-operator-sales'
import { SalesListWithFilter } from './components/sales-list-with-filter-old'


// Types
interface Sale {
  id: number
  transaction_id?: string
  spbu_id: number
  operator_id: number
  pump_number: number
  fuel_type: string
  liters: number
  amount: number
  transaction_date: string
  created_at: string
  updated_at: string
  SPBU?: {
    name: string
    code: string
  }
  operator?: {
    name: string
    email: string
  }
}

interface Tank {
  id: number
  name: string
  fuel_type: string
  capacity: number
  current_stock: number
  spbu_id?: number
  SPBU?: {
    id: number
    name: string
    code: string
  }
  created_at?: string
  updated_at?: string
  current_price?: number
}

// API functions
const fetchSales = async (): Promise<Sale[]> => {
  const response = await apiClient.get('/api/sales')
  // Ensure liters and amount are numbers
  return response.data.data.map((sale: any) => ({
    ...sale,
    liters: typeof sale.liters === 'string' ? parseFloat(sale.liters) : sale.liters,
    amount: typeof sale.amount === 'string' ? parseFloat(sale.amount) : sale.amount
  }))
}

const fetchTanks = async (): Promise<Tank[]> => {
  const response = await apiClient.get('/api/tanks')
  return response.data.data
}

const fetchPrices = async (): Promise<any[]> => {
  const response = await apiClient.get('/api/prices')
  return response.data.data
}

const createSale = async (saleData: any): Promise<Sale> => {
  const response = await apiClient.post('/api/sales', saleData)
  return response.data.data
}

const SalesManagementPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore().auth
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const isMobile = useIsMobile()
  console.log('Device detection - isMobile:', isMobile, 'window.innerWidth:', typeof window !== 'undefined' ? window.innerWidth : 'N/A');

  // Check if user has access to sales management
  const userHasAccess = user ? hasAccess(user, 'sales') : false;
  const userHasFullAccess = user ? hasFullAccess(user, 'sales') : false;
  const isReadOnly = !userHasFullAccess;
  
  // Check if user is Operator
  const isOperator = user?.role?.includes('Operator');
  console.log('User role check - isOperator:', isOperator, 'user role:', user?.role);

  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])

  // Fetch data
  const { data: sales = [], isLoading: salesLoading, isError: salesError } = useQuery({
    queryKey: ['sales'],
    queryFn: fetchSales,
    enabled: userHasAccess
  })

  const { data: tanks = [], isLoading: tanksLoading } = useQuery({
    queryKey: ['tanks'],
    queryFn: fetchTanks,
    enabled: userHasAccess
  })

  const { data: prices = [], isLoading: pricesLoading } = useQuery({
    queryKey: ['prices'],
    queryFn: fetchPrices,
    enabled: userHasAccess
  })

  // Filter sales based on search term and sort by transaction date (newest first)
  const filteredSales = sales
    .filter(sale => 
      sale.fuel_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.SPBU?.name && sale.SPBU.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.SPBU?.code && sale.SPBU.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.operator?.name && sale.operator.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => 
      new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    )

  // Mutations
  const createSaleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: (newSale) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['tanks'] }) // Also invalidate tanks to refresh stock
      toast.success('Sale created successfully')
      setIsCreateDialogOpen(false)
      // Reset form
      setCreateFormData({
        fuel_type: availableFuelTypes.length > 0 ? availableFuelTypes[0] : '',
        liters: 0,
        amount: 0,
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create sale')
    }
  })

  // Form states
  const [createFormData, setCreateFormData] = useState({
    fuel_type: '',
    liters: 0,
    amount: 0,
  })

  // Get available fuel types from tanks
  const availableFuelTypes = Array.from(
    new Set(tanks.map(tank => tank.fuel_type))
  ).filter(Boolean) as string[]

  // Get current price for a fuel type
  const getCurrentPrice = (fuelType: string) => {
    // First, try to get price from tanks data if available
    const tankWithPrice = tanks.find(tank => 
      tank.fuel_type === fuelType && 
      tank.current_price !== undefined
    )
    
    if (tankWithPrice && tankWithPrice.current_price) {
      return tankWithPrice.current_price
    }
    
    // Fall back to prices data if tank price not available
    // Find the most recent price for this fuel type for the user's SPBU or global price
    const relevantPrices = prices.filter(price => 
      price.fuel_type === fuelType && 
      (price.spbu_id === null || price.spbu_id === (user?.spbu_id || null))
    )
    
    // Sort by effective date (newest first)
    relevantPrices.sort((a, b) => 
      new Date(b.effective_date || b.created_at).getTime() - new Date(a.effective_date || a.created_at).getTime()
    )
    
    return relevantPrices.length > 0 ? parseFloat(relevantPrices[0].price) : 0
  }

  // Set initial fuel type based on available tanks
  useEffect(() => {
    if (availableFuelTypes.length > 0 && !createFormData.fuel_type) {
      setCreateFormData(prev => ({
        ...prev,
        fuel_type: availableFuelTypes[0]
      }))
    } else if (availableFuelTypes.length > 0 && !availableFuelTypes.includes(createFormData.fuel_type)) {
      setCreateFormData(prev => ({
        ...prev,
        fuel_type: availableFuelTypes[0]
      }))
    }
  }, [availableFuelTypes, createFormData.fuel_type])

  // Handle create form changes
  const handleCreateFormChange = (field: string, value: string | number) => {
    // Prevent manual editing of amount field
    if (field === 'amount') {
      return
    }
    setCreateFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle create sale
  const handleCreateSale = async () => {
    // Validate required fields
    if (!createFormData.fuel_type) {
      toast.error('Please select a fuel type')
      return
    }
    
    if (createFormData.liters <= 0) {
      toast.error('Liters must be greater than 0')
      return
    }
    
    if (createFormData.amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }
    
    try {
      // Prepare sale data without pump number
      const saleData = {
        fuel_type: createFormData.fuel_type,
        liters: createFormData.liters,
        amount: createFormData.amount
      }
      
      // Create the sale (backend will handle tank stock reduction)
      await createSaleMutation.mutateAsync(saleData)
      
      toast.success(`Sale created successfully for ${createFormData.liters} liters of ${createFormData.fuel_type}`)
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error(error.response?.data?.message || 'Failed to create sale')
    }
  }

  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    console.log('User access check failed - user:', user, 'userHasAccess:', userHasAccess);
    return null;
  }

  console.log('Rendering sales management page - isMobile:', isMobile, 'isOperator:', isOperator);

  // Mobile view
  if (isMobile) {
    console.log('Rendering mobile view');
    // For operators, show the enhanced simplified sales transaction form directly
    if (isOperator) {
      console.log('Operator detected, showing enhanced BLE component');
      // If we're creating a sale, show the mobile form with BLE support
      if (isCreateDialogOpen) {
        console.log('Showing mobile form with BLE support');
        return (
          <div className="space-y-6">
            <MobileSalesFormWithBLE
              formData={createFormData}
              availableFuelTypes={availableFuelTypes}
              getCurrentPrice={getCurrentPrice}
              isLoading={createSaleMutation.isPending}
              onChange={handleCreateFormChange}
              onSubmit={handleCreateSale}
              onCancel={() => setIsCreateDialogOpen(false)}
              isReadOnly={isReadOnly}
            />
          </div>
        )
      }
      
      // Otherwise, show the enhanced operator sales view with BLE support
      console.log('Showing enhanced mobile operator sales component');
      return (
        <div className="space-y-6">
          <EnhancedMobileOperatorSales />
        </div>
      );
    }
    
    // If we're creating a sale, show the mobile form
    if (isCreateDialogOpen) {
      console.log('Showing mobile form for non-operator');
      return (
        <div className="space-y-6">
          <MobileSalesForm
            formData={createFormData}
            availableFuelTypes={availableFuelTypes}
            getCurrentPrice={getCurrentPrice}
            isLoading={createSaleMutation.isPending}
            onChange={handleCreateFormChange}
            onSubmit={handleCreateSale}
            onCancel={() => setIsCreateDialogOpen(false)}
            isReadOnly={isReadOnly}
          />
        </div>
      )
    }
    
    // Otherwise, show the mobile sales list
    console.log('Showing mobile sales list');
    return (
      <div className="space-y-6">
        <MobileSalesList
          sales={filteredSales}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddSale={() => setIsCreateDialogOpen(true)}
          isLoading={salesLoading || tanksLoading || pricesLoading}
          isError={salesError}
          isReadOnly={isReadOnly}
        />
      </div>
    )
  }

  if (salesLoading || tanksLoading || pricesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading sales, tanks, and prices...</span>
      </div>
    )
  }

  if (salesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Sales</div>
          <div className="text-gray-600 mb-4">Failed to load sales data. Please try again later.</div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['sales'] })}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // For Admin/Super Admin, show the enhanced sales list with filtering
  if (userHasFullAccess) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sales Management</h1>
            <p className="text-muted-foreground">
              Manage sales transactions
            </p>
          </div>
          <div className="flex items-center gap-4">

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Sale</DialogTitle>
                  <DialogDescription>
                    Add a new sale transaction. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fuel_type" className="text-right">
                      Fuel Type
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={createFormData.fuel_type}
                        onValueChange={(value) => handleCreateFormChange('fuel_type', value)}
                        disabled={availableFuelTypes.length === 0}
                      >
                        <SelectTrigger>
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
                      <p className="text-sm text-gray-500 mt-1">
                        Fuel types are based on available tanks
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="liters" className="text-right">
                      Liters
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="liters"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={createFormData.liters}
                        onChange={(e) => handleCreateFormChange('liters', parseFloat(e.target.value) || 0)}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter the amount of fuel in liters
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount (IDR)
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={createFormData.amount}
                        className="mb-1 bg-gray-100 cursor-not-allowed"
                        readOnly
                      />
                      <div className="text-sm text-gray-500">
                        Calculated: {createFormData.liters}L × Rp {getCurrentPrice(createFormData.fuel_type).toFixed(2)}/L
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Amount is automatically calculated and locked
                      </p>
                    </div>
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
                    onClick={handleCreateSale}
                    disabled={createSaleMutation.isPending}
                  >
                    {createSaleMutation.isPending ? 'Processing...' : 'Create Sale'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <SalesListWithFilter sales={sales} />
      </div>
    );
  }

  // For users with read-only access, show the standard sales list
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground">
            View sales transactions in the system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
          <CardDescription>
            View all sales transactions in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search sales..."
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
                <TableHead>Operator</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Liters</TableHead>
                <TableHead>Amount (IDR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">No sales found</div>
                      {searchTerm && (
                        <div className="text-sm text-gray-500">
                          No sales match your search for "{searchTerm}"
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {new Date(sale.transaction_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {sale.SPBU ? `${sale.SPBU.name} (${sale.SPBU.code})` : '-'}
                    </TableCell>
                    <TableCell>
                      {sale.operator ? sale.operator.name : '-'}
                    </TableCell>
                    <TableCell>{sale.fuel_type}</TableCell>
                    <TableCell>{parseFloat(sale.liters.toString()).toFixed(2)}</TableCell>
                    <TableCell>{parseFloat(sale.amount.toString()).toFixed(2)}</TableCell>
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

export default SalesManagementPage