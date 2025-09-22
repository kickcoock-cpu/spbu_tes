import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Check, Edit3 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api'
import { MovingTruckAnimation } from '@/components/MovingTruckAnimation'

// Types
interface Delivery {
  id: number
  spbu_id: number
  supplier: string
  delivery_order_number: string
  fuel_type: string
  liters: string
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

// Types
interface Delivery {
  id: number
  spbu_id: number
  supplier: string
  delivery_order_number: string
  fuel_type: string
  liters: string
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
const fetchDeliveriesReadyForConfirmation = async (): Promise<Delivery[]> => {
  const response = await apiClient.get('/api/deliveries/ready-for-confirmation')
  return response.data.data
}

const confirmDelivery = async (id: number, actualLiters: number): Promise<Delivery> => {
  const response = await apiClient.put(`/api/deliveries/${id}/confirm`, { actualLiters })
  return response.data.data
}

const DeliveriesConfirmationPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore().auth
  const [searchTerm, setSearchTerm] = useState('')
  const [actualLiters, setActualLiters] = useState<{[key: number]: number}>({})

  // Redirect if not authorized
  useEffect(() => {
    if (user && !user.role.includes('Operator')) {
      navigate({ to: '/403' })
    }
  }, [user, navigate])

  // Fetch data
  const { data: deliveries = [], isLoading: deliveriesLoading, isError: deliveriesError } = useQuery({
    queryKey: ['deliveries-ready-for-confirmation'],
    queryFn: fetchDeliveriesReadyForConfirmation,
    enabled: user?.role.includes('Operator')
  })

  // Filter deliveries based on search term
  const filteredDeliveries = deliveries.filter(delivery => 
    delivery.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.fuel_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (delivery.delivery_order_number && delivery.delivery_order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (delivery.SPBU?.name && delivery.SPBU.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (delivery.SPBU?.code && delivery.SPBU.code.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Mutations
  const confirmDeliveryMutation = useMutation({
    mutationFn: ({ id, actualLiters }: { id: number, actualLiters: number }) => confirmDelivery(id, actualLiters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries-ready-for-confirmation'] })
      toast.success('Delivery confirmed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to confirm delivery')
    }
  })

  // Handle confirm delivery
  const handleConfirmDelivery = (id: number) => {
    const liters = actualLiters[id] || parseFloat(deliveries.find(d => d.id === id)?.liters || '0')
    if (window.confirm(`Are you sure you want to confirm this delivery with ${liters} actual liters?`)) {
      confirmDeliveryMutation.mutate({ id, actualLiters: liters })
    }
  }

  // Handle actual liters change
  const handleActualLitersChange = (id: number, value: string) => {
    const liters = parseFloat(value) || 0
    setActualLiters(prev => ({
      ...prev,
      [id]: liters
    }))
  }

  // If user is not an Operator, don't render anything
  if (!user || !user.role.includes('Operator')) {
    return null
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
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['deliveries-ready-for-confirmation'] })}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mobile header with animation */}
      <div className="sm:hidden flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Confirm Deliveries</h1>
          <p className="text-muted-foreground text-sm">
            Confirm deliveries that are ready (H+1)
          </p>
        </div>
        <MovingTruckAnimation size="sm" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deliveries Ready for Confirmation</CardTitle>
          <CardDescription>
            Deliveries that can be confirmed today (H+1 or later after creation)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <input
              placeholder="Search deliveries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 w-full max-w-sm"
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">No deliveries ready for confirmation</div>
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
                    <TableCell>{parseFloat(delivery.liters).toFixed(2)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={actualLiters[delivery.id] || delivery.liters}
                        onChange={(e) => handleActualLitersChange(delivery.id, e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmDelivery(delivery.id)}
                        disabled={confirmDeliveryMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirm
                      </Button>
                    </TableCell>
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

export default DeliveriesConfirmationPage