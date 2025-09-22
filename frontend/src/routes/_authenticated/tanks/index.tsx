import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { tankApi, apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import TankVisualization from '@/components/tanks/TankVisualization'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileTankList } from '@/features/tanks/components/mobile-tank-list'
import { MobileTankForm } from '@/features/tanks/components/mobile-tank-form'
import { MobileTankVisualization } from '@/features/tanks/components/mobile-tank-visualization'

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
}

interface SPBU {
  id: number
  name: string
  code: string
}

export function TankList() {
  const [tanks, setTanks] = useState<Tank[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tankToDelete, setTankToDelete] = useState<Tank | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'visualization'>('table')
  
  // Create tank form state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    fuelType: '',
    capacity: '',
    spbuId: ''
  })
  
  // Edit tank form state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    id: 0,
    name: '',
    fuelType: '',
    capacity: '',
    spbuId: ''
  })
  
  const [spbues, setSpbues] = useState<SPBU[]>([])
  const [createLoading, setCreateLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  
  // Mobile view states
  const [searchTerm, setSearchTerm] = useState('')
  const isMobile = useIsMobile()
  
  // Test re-render counter
  const renderCount = useRef(0)
  
  const { user } = useAuthStore((state) => state.auth)
  const navigate = useNavigate()

  // Increment render count inside useEffect to avoid redeclaration errors
  useEffect(() => {
    renderCount.current = renderCount.current + 1
    console.log('Component render count:', renderCount.current)
  }, []) // Empty dependency array means this runs once on mount

  useEffect(() => {
    fetchTanks()
  }, [])

  // Fetch SPBUs when component mounts and user is Super Admin
  useEffect(() => {
    if (user?.role.includes('Super Admin')) {
      fetchSPBUs()
    }
  }, [user])

  // Log when tanks state changes
  useEffect(() => {
    console.log('Tanks state updated:', tanks)
    // Log specific tank we're interested in
    const targetTank = tanks.find(t => t.id === 3)
    if (targetTank) {
      console.log('Target tank (ID 3) state:', targetTank)
      console.log('Target tank current_stock:', targetTank.current_stock)
    }
  }, [tanks])

  // Filter tanks based on search term
  const filteredTanks = tanks.filter(tank => 
    tank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tank.fuel_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tank.SPBU?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (tank.SPBU?.code.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  )

  const fetchTanks = async () => {
    try {
      console.log('Fetching tanks...')
      const response = await tankApi.getAll()
      console.log('Tanks API response:', response)
      console.log('Full tanks response:', response)
      console.log('Tanks data:', response.data)
      console.log('Tanks data.data:', response.data.data)
      // Log specific tank data to see if current_stock is updated
      response.data.data.forEach((tank: any) => {
        console.log(`Tank ${tank.id} - ${tank.name}: current_stock = ${tank.current_stock}`)
      })
      
      // Ensure numeric values are properly typed
      const processedTanks = response.data.data.map((tank: any) => ({
        id: tank.id,
        name: tank.name,
        fuel_type: tank.fuel_type,
        capacity: typeof tank.capacity === 'string' 
          ? parseFloat(tank.capacity) 
          : typeof tank.capacity === 'number'
          ? tank.capacity
          : 0, // default value if undefined
        current_stock: typeof tank.current_stock === 'string' 
          ? parseFloat(tank.current_stock) 
          : typeof tank.current_stock === 'number'
          ? tank.current_stock
          : 0, // default value if undefined
        spbu_id: tank.spbu_id,
        SPBU: tank.SPBU,
        created_at: tank.created_at,
        updated_at: tank.updated_at
      }))
      
      console.log('Processed tanks:', processedTanks)
      setTanks(processedTanks)
      console.log('Tanks state updated with:', processedTanks)
    } catch (error: any) {
      console.error('Fetch tanks error:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      
      toast.error('Failed to fetch tanks')
      
      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        console.error('Error status:', error.response.status)
        console.error('Error data:', error.response.data)
        if (error.response.status === 401) {
          toast.error('Authentication failed. Please log in again.')
        } else if (error.response.status === 403) {
          toast.error('Access denied. Insufficient permissions.')
        } else if (error.response.status === 500) {
          toast.error('Server error. Please try again later.')
        } else {
          toast.error(`Failed to fetch tanks: ${error.response.status}`)
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request)
        toast.error('Network error. Please check your connection.')
      } else {
        // Something else happened
        console.error('Error message:', error.message)
        toast.error('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchSPBUs = async () => {
    try {
      const response = await apiClient.get('/api/spbu')
      setSpbues(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch SPBUs')
      console.error('Fetch SPBUs error:', error)
    }
  }

  const handleDeleteTank = async () => {
    if (!tankToDelete) return

    try {
      console.log('Deleting tank with ID:', tankToDelete.id)
      await tankApi.delete(tankToDelete.id)
      console.log('Tank deleted successfully')
      toast.success('Tank deleted successfully')
      setTanks(tanks.filter(tank => tank.id !== tankToDelete.id))
    } catch (error: any) {
      console.error('Delete tank error:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      
      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        console.error('Error status:', error.response.status)
        console.error('Error data:', error.response.data)
        if (error.response.status === 401) {
          toast.error('Authentication failed. Please log in again.')
        } else if (error.response.status === 403) {
          toast.error('Access denied. Only Super Admin can delete tanks.')
        } else if (error.response.status === 404) {
          toast.error('Tank not found.')
        } else if (error.response.status === 500) {
          toast.error('Server error. Please try again later.')
        } else {
          toast.error(`Failed to delete tank: ${error.response.status}`)
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request)
        toast.error('Network error. Please check your connection.')
      } else {
        // Something else happened
        console.error('Error message:', error.message)
        toast.error('An unexpected error occurred.')
      }
    } finally {
      setDeleteDialogOpen(false)
      setTankToDelete(null)
    }
  }

  const handleCreateTank = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)

    try {
      console.log('Creating tank with data:', createForm)
      
      const requestData: any = {
        name: createForm.name,
        fuel_type: createForm.fuelType,
        capacity: parseFloat(createForm.capacity),
        spbu_id: parseInt(createForm.spbuId)
      }
      
      const response = await tankApi.create(requestData)

      console.log('Tank created successfully:', response)
      toast.success('Tank created successfully')
      
      // Close dialog and reset form
      setCreateDialogOpen(false)
      setCreateForm({
        name: '',
        fuelType: '',
        capacity: '',
        spbuId: ''
      })
      
      // Refresh tanks list
      fetchTanks()
    } catch (error: any) {
      console.error('Create tank error:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      
      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        console.error('Error status:', error.response.status)
        console.error('Error data:', error.response.data)
        if (error.response.status === 401) {
          toast.error('Authentication failed. Please log in again.')
        } else if (error.response.status === 403) {
          toast.error('Access denied. Only Super Admin can create tanks.')
        } else if (error.response.status === 400) {
          toast.error('Invalid data. Please check your input.')
        } else if (error.response.status === 500) {
          toast.error('Server error. Please try again later.')
        } else {
          toast.error(`Failed to create tank: ${error.response.status}`)
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request)
        toast.error('Network error. Please check your connection.')
      } else {
        // Something else happened
        console.error('Error message:', error.message)
        toast.error('An unexpected error occurred.')
      }
    } finally {
      setCreateLoading(false)
    }
  }

  const handleEditTank = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)

    try {
      console.log('Updating tank with data:', editForm)
      
      // Validate form data
      const capacityFloat = parseFloat(editForm.capacity)
      const currentStockFloat = parseFloat(editForm.currentStock)
      const spbuIdInt = parseInt(editForm.spbuId)
      
      console.log('Parsed values:', {
        capacity: capacityFloat,
        currentStock: currentStockFloat,
        spbuId: spbuIdInt,
        capacityValid: !isNaN(capacityFloat),
        currentStockValid: !isNaN(currentStockFloat),
        spbuIdValid: !isNaN(spbuIdInt)
      })
      
      if (isNaN(capacityFloat)) {
        throw new Error('Invalid capacity value: ' + editForm.capacity)
      }
      
      if (isNaN(currentStockFloat)) {
        throw new Error('Invalid current stock value: ' + editForm.currentStock)
      }
      
      if (isNaN(spbuIdInt)) {
        throw new Error('Invalid SPBU ID value: ' + editForm.spbuId)
      }
      
      // Log the data being sent to the API
      const updateData: any = {
        name: editForm.name,
        fuel_type: editForm.fuelType,
        capacity: capacityFloat,
        current_stock: currentStockFloat, // Use the correct field name
        spbu_id: spbuIdInt
      }
      
      console.log('Sending update data to API:', updateData)
      
      // Log the current state before update
      const tankBeforeUpdate = tanks.find(t => t.id === editForm.id)
      console.log('Tank before update:', tankBeforeUpdate)
      
      console.log('Calling tankApi.update with ID:', editForm.id)
      console.log('Full update call:', { id: editForm.id, data: updateData })
      const response = await tankApi.update(editForm.id, updateData)
      
      console.log('Tank update API call succeeded')
      console.log('Tank updated successfully:', response)
      console.log('Full response:', response)
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      console.log('Response data:', response.data)
      console.log('Response data.data:', response.data.data)
      console.log('Updated current_stock value:', response.data.data?.current_stock)
      
      // Check if the response indicates success
      if (response.data && response.data.success !== undefined) {
        console.log('API response success flag:', response.data.success)
        if (!response.data.success) {
          console.error('API returned success=false, update may have failed')
          toast.error('Update may have failed - server reported error')
          setEditLoading(false)
          return
        }
      }
      
      toast.success('Tank updated successfully')
      
      // Close dialog and reset form
      setEditDialogOpen(false)
      setEditForm({
        id: 0,
        name: '',
        fuelType: '',
        capacity: '',
        currentStock: '',
        spbuId: ''
      })
      
      // Instead of trying to update the specific tank, let's just fetch all tanks again
      // This ensures we get the latest data from the server
      console.log('Fetching all tanks again to get latest data...')
      fetchTanks()
    } catch (error: any) {
      console.error('=== EDIT TANK ERROR ===')
      console.error('Edit tank error:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      if (error.response) {
        // Server responded with error status
        console.error('Error status:', error.response.status)
        console.error('Error status text:', error.response.statusText)
        console.error('Error headers:', error.response.headers)
        console.error('Error data:', error.response.data)
        
        toast.error(`Failed to update tank: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`)
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request)
        toast.error('Network error. Please check your connection.')
      } else {
        // Something else happened
        console.error('Error message:', error.message)
        toast.error('An unexpected error occurred.')
      }
      
      // Show a more detailed error in the UI for debugging
      toast.error(`Update failed: ${error.message}`, {
        duration: 10000, // Show for 10 seconds
      })
    } finally {
      setEditLoading(false)
    }
  }

  const canCreate = user?.role.includes('Super Admin')
  const canEdit = user?.role.includes('Super Admin')
  const canDelete = user?.role.includes('Super Admin')
  
  // Debug logging
  console.log('User object:', user)
  console.log('User roles:', user?.role)
  console.log('Can create (has Super Admin):', canCreate)
  console.log('Can edit (has Super Admin):', canEdit)
  console.log('Can delete (has Super Admin):', canDelete)
  
  // Debug API function
  const debugApiCall = async () => {
    try {
      console.log('=== DEBUG API CALL ===')
      console.log('Current auth state:', { user })
      
      // Check cookie directly
      const cookies = document.cookie.split('; ')
      console.log('All cookies:', cookies)
      
      const cookieToken = cookies
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1]
      console.log('Direct cookie token:', cookieToken)
      
      // Also check using getCookie function
      const { getCookie } = await import('@/lib/cookies')
      const libCookieToken = getCookie('accessToken')
      console.log('Library cookie token:', libCookieToken)
      
      const response = await tankApi.getAll()
      console.log('API Response:', response)
      toast.success('API call successful!')
    } catch (err: any) {
      console.error('=== API ERROR ===')
      console.error('Error:', err)
      console.error('Error response:', err.response)
      console.error('Error message:', err.message)
      
      if (err.response) {
        toast.error(`API call failed: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`)
      } else if (err.request) {
        toast.error('API call failed: No response received')
      } else {
        toast.error(`API call failed: ${err.message}`)
      }
    }
  }

  // Mobile view components
  if (isMobile) {
    // Mobile visualization view
    if (viewMode === 'visualization') {
      return (
        <MobileTankVisualization
          tanks={filteredTanks}
          onBack={() => setViewMode('table')}
        />
      )
    }
    
    // Mobile edit form view
    if (editDialogOpen && tankToDelete) {
      return (
        <MobileTankForm
          formData={editForm}
          spbues={spbues}
          isEditing={true}
          isLoading={editLoading}
          onChange={(field, value) => setEditForm({ ...editForm, [field]: value })}
          onSubmit={handleEditTank}
          onCancel={() => {
            setEditDialogOpen(false)
            setTankToDelete(null)
          }}
          canEdit={canEdit}
        />
      )
    }
    
    // Mobile create form view
    if (createDialogOpen) {
      return (
        <MobileTankForm
          formData={createForm}
          spbues={spbues}
          isEditing={false}
          isLoading={createLoading}
          onChange={(field, value) => setCreateForm({ ...createForm, [field]: value })}
          onSubmit={handleCreateTank}
          onCancel={() => setCreateDialogOpen(false)}
          canEdit={canCreate}
        />
      )
    }
    
    // Mobile tank list view
    return (
      <MobileTankList
        tanks={filteredTanks}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddTank={() => setCreateDialogOpen(true)}
        onEditTank={(tank) => {
          setTankToDelete(tank)
          setEditForm({
            id: tank.id,
            name: tank.name,
            fuelType: tank.fuel_type,
            capacity: tank.capacity?.toString() || '0',
            currentStock: tank.current_stock?.toString() || '0',
            spbuId: tank.spbu_id?.toString() || tank.SPBU?.id?.toString() || ''
          })
          setEditDialogOpen(true)
        }}
        onDeleteTank={(tank) => {
          setTankToDelete(tank)
          setDeleteDialogOpen(true)
        }}
        onViewVisualization={() => setViewMode('visualization')}
        isLoading={loading}
        isError={false}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        spbues={spbues}
      />
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tanks</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setViewMode(viewMode === 'table' ? 'visualization' : 'table')}
            variant="outline"
          >
            <Eye className="mr-2 h-4 w-4" />
            {viewMode === 'table' ? 'Visualization View' : 'Table View'}
          </Button>
          <Button onClick={debugApiCall} variant="outline">
            Debug API
          </Button>
          <Button onClick={fetchTanks} variant="outline">
            Refresh
          </Button>
          <Button onClick={() => setTanks([...tanks])} variant="outline">
            Force Re-render
          </Button>
          {canCreate && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Tank
            </Button>
          )}
        </div>
      </div>

      {(user?.role.includes('Admin') || user?.role.includes('Super Admin')) && (
        <div></div>
      )}

      {viewMode === 'visualization' ? (
        <TankVisualization tanks={filteredTanks} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tank List</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTanks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tanks found</p>
                {canCreate && (
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate({ to: '/tanks/create' })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Tank
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Capacity (L)</TableHead>
                    <TableHead>Current Stock (L)</TableHead>
                    {user?.role.includes('Super Admin') && <TableHead>SPBU</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTanks.map((tank) => (
                    <TableRow key={tank.id}>
                      <TableCell className="font-medium">{tank.name}</TableCell>
                      <TableCell>{tank.fuel_type}</TableCell>
                      <TableCell>{tank.capacity}</TableCell>
                      <TableCell>
                        {tank.current_stock}
                      </TableCell>
                      {user?.role.includes('Super Admin') && (
                        <TableCell>
                          {tank.SPBU?.name} ({tank.SPBU?.code})
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {console.log(`Rendering tank ${tank.id}:`, tank)}
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                              setEditForm({
                                id: tank.id,
                                name: tank.name,
                                fuelType: tank.fuel_type,
                                capacity: tank.capacity?.toString() || '0',
                                currentStock: tank.current_stock?.toString() || '0',
                                spbuId: tank.spbu_id?.toString() || tank.SPBU?.id?.toString() || ''
                              })
                              console.log('Setting edit form with tank data:', {
                                id: tank.id,
                                name: tank.name,
                                fuelType: tank.fuel_type,
                                capacity: tank.capacity?.toString() || '0',
                                currentStock: tank.current_stock?.toString() || '0',
                                spbuId: tank.spbu_id?.toString() || tank.SPBU?.id?.toString() || ''
                              })
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTankToDelete(tank)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tank{' '}
              {tankToDelete?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTank}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Tank Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Tank</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTank} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tank Name</Label>
              <Input
                id="name"
                value={createForm.name}
                onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                placeholder="Enter tank name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select value={createForm.fuelType} onValueChange={(value) => setCreateForm({...createForm, fuelType: value})} required>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (Liters)</Label>
              <Input
                id="capacity"
                type="number"
                value={createForm.capacity}
                onChange={(e) => setCreateForm({...createForm, capacity: e.target.value})}
                placeholder="Enter capacity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spbuId">SPBU</Label>
              <Select value={createForm.spbuId} onValueChange={(value) => setCreateForm({...createForm, spbuId: value})} required>
                <SelectTrigger>
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

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create Tank'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tank Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Tank</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTank} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tank Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Enter tank name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fuelType">Fuel Type</Label>
              <Select value={editForm.fuelType} onValueChange={(value) => setEditForm({...editForm, fuelType: value})} required>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity (Liters)</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={editForm.capacity}
                onChange={(e) => setEditForm({...editForm, capacity: e.target.value})}
                placeholder="Enter capacity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-currentStock">Current Stock (Liters)</Label>
              <Input
                id="edit-currentStock"
                type="number"
                value={editForm.currentStock}
                onChange={(e) => {
                  console.log('Current stock input changed to:', e.target.value)
                  setEditForm({...editForm, currentStock: e.target.value})
                }}
                placeholder="Enter current stock"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-spbuId">SPBU</Label>
              <Select value={editForm.spbuId} onValueChange={(value) => setEditForm({...editForm, spbuId: value})} required>
                <SelectTrigger>
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

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? 'Updating...' : 'Update Tank'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}