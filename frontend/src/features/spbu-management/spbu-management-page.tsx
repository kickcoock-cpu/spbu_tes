import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Edit, Trash2 } from 'lucide-react'
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
import { MobileSPBUList } from './components/mobile-spbu-list'
import { MobileSPBUForm } from './components/mobile-spbu-form'

// Types
interface SPBU {
  id: number
  name: string
  location: string
  code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// API functions
const fetchSPBUs = async (): Promise<SPBU[]> => {
  const response = await apiClient.get('/api/spbu')
  return response.data.data
}

const createSPBU = async (spbuData: any): Promise<SPBU> => {
  const response = await apiClient.post('/api/spbu', spbuData)
  return response.data.data
}

const updateSPBU = async ({ id, spbuData }: { id: number; spbuData: any }): Promise<SPBU> => {
  const response = await apiClient.put(`/api/spbu/${id}`, spbuData)
  return response.data.data
}

const deleteSPBU = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/spbu/${id}`)
}

const SPBUManagementPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore().auth
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSPBU, setEditingSPBU] = useState<SPBU | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const isMobile = useIsMobile()

  // Check if user has access to SPBU management
  const userHasAccess = user ? hasAccess(user, 'spbu') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'spbu') : false
  const isReadOnly = !userHasFullAccess

  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])

  // Fetch data
  const { data: spbus = [], isLoading: spbusLoading, isError: spbusError } = useQuery({
    queryKey: ['spbus'],
    queryFn: fetchSPBUs,
    enabled: userHasAccess
  })

  // Filter SPBUs based on search term
  const filteredSPBUs = spbus.filter(spbu => 
    spbu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spbu.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spbu.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Mutations
  const createSPBUMutation = useMutation({
    mutationFn: createSPBU,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spbus'] })
      toast.success('SPBU created successfully')
      setIsCreateDialogOpen(false)
      // Reset form
      setCreateFormData({
        name: '',
        location: '',
        code: '',
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create SPBU')
    }
  })

  const updateSPBUMutation = useMutation({
    mutationFn: updateSPBU,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spbus'] })
      toast.success('SPBU updated successfully')
      setIsEditDialogOpen(false)
      setEditingSPBU(null)
      // Reset form
      setEditFormData({
        name: '',
        location: '',
        code: '',
        is_active: true
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update SPBU')
    }
  })

  const deleteSPBUMutation = useMutation({
    mutationFn: deleteSPBU,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spbus'] })
      toast.success('SPBU deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete SPBU')
    }
  })

  // Form states
  const [createFormData, setCreateFormData] = useState({
    name: '',
    location: '',
    code: '',
  })

  const [editFormData, setEditFormData] = useState({
    name: '',
    location: '',
    code: '',
    is_active: true
  })

  // Handle create form changes
  const handleCreateFormChange = (field: string, value: string | boolean) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle edit form changes
  const handleEditFormChange = (field: string, value: string | boolean) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle create SPBU
  const handleCreateSPBU = () => {
    // Validate required fields
    if (!createFormData.name.trim()) {
      toast.error('Name is required')
      return
    }
    
    if (!createFormData.location.trim()) {
      toast.error('Location is required')
      return
    }
    
    if (!createFormData.code.trim()) {
      toast.error('Code is required')
      return
    }
    
    createSPBUMutation.mutate(createFormData)
  }

  // Handle edit SPBU
  const handleEditSPBU = () => {
    if (editingSPBU) {
      // Validate required fields
      if (!editFormData.name.trim()) {
        toast.error('Name is required')
        return
      }
      
      if (!editFormData.location.trim()) {
        toast.error('Location is required')
        return
      }
      
      if (!editFormData.code.trim()) {
        toast.error('Code is required')
        return
      }
      
      updateSPBUMutation.mutate({ 
        id: editingSPBU.id, 
        spbuData: editFormData
      })
    }
  }

  // Handle delete SPBU
  const handleDeleteSPBU = (id: number) => {
    if (window.confirm('Are you sure you want to delete this SPBU?')) {
      deleteSPBUMutation.mutate(id)
    }
  }

  // Open edit dialog with SPBU data
  const openEditDialog = (spbu: SPBU) => {
    setEditingSPBU(spbu)
    setEditFormData({
      name: spbu.name,
      location: spbu.location,
      code: spbu.code,
      is_active: spbu.is_active
    })
    setIsEditDialogOpen(true)
  }

  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }

  // Mobile view
  if (isMobile) {
    // If we're editing an SPBU, show the mobile form
    if (isEditDialogOpen && editingSPBU) {
      return (
        <div className="space-y-6">
          <MobileSPBUForm
            formData={editFormData}
            isEditing={true}
            isLoading={updateSPBUMutation.isPending}
            onChange={handleEditFormChange}
            onSubmit={handleEditSPBU}
            onCancel={() => {
              setIsEditDialogOpen(false)
              setEditingSPBU(null)
            }}
            isReadOnly={isReadOnly}
          />
        </div>
      )
    }
    
    // If we're creating an SPBU, show the mobile form
    if (isCreateDialogOpen) {
      return (
        <div className="space-y-6">
          <MobileSPBUForm
            formData={createFormData}
            isEditing={false}
            isLoading={createSPBUMutation.isPending}
            onChange={handleCreateFormChange}
            onSubmit={handleCreateSPBU}
            onCancel={() => setIsCreateDialogOpen(false)}
            isReadOnly={isReadOnly}
          />
        </div>
      )
    }
    
    // Otherwise, show the mobile SPBU list
    return (
      <div className="space-y-6">
        <MobileSPBUList
          spbus={filteredSPBUs}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddSPBU={() => setIsCreateDialogOpen(true)}
          onEditSPBU={(spbu) => {
            setEditingSPBU(spbu)
            setEditFormData({
              name: spbu.name,
              location: spbu.location,
              code: spbu.code,
              is_active: spbu.is_active
            })
            setIsEditDialogOpen(true)
          }}
          onDeleteSPBU={(id) => {
            if (window.confirm('Are you sure you want to delete this SPBU?')) {
              deleteSPBUMutation.mutate(id)
            }
          }}
          isLoading={spbusLoading}
          isError={spbusError}
          isReadOnly={isReadOnly}
        />
      </div>
    )
  }

  if (spbusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading SPBUs...</span>
      </div>
    )
  }

  if (spbusError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading SPBUs</div>
          <div className="text-gray-600 mb-4">Failed to load SPBU data. Please try again later.</div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['spbus'] })}>
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
          <h1 className="text-3xl font-bold">SPBU Management</h1>
          <p className="text-muted-foreground">
            {isReadOnly 
              ? 'View SPBUs in the system' 
              : 'Manage SPBUs'}
          </p>
        </div>
        {!isReadOnly && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add SPBU
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New SPBU</DialogTitle>
                <DialogDescription>
                  Add a new SPBU to the system. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={createFormData.name}
                    onChange={(e) => handleCreateFormChange('name', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Code
                  </Label>
                  <Input
                    id="code"
                    value={createFormData.code}
                    onChange={(e) => handleCreateFormChange('code', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={createFormData.location}
                    onChange={(e) => handleCreateFormChange('location', e.target.value)}
                    className="col-span-3"
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
                  onClick={handleCreateSPBU}
                  disabled={createSPBUMutation.isPending}
                >
                  {createSPBUMutation.isPending ? 'Creating...' : 'Create SPBU'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SPBUs</CardTitle>
          <CardDescription>
            {isReadOnly 
              ? 'View all SPBUs in the system' 
              : 'Manage all SPBUs in the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search SPBUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                {!isReadOnly && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSPBUs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isReadOnly ? 4 : 5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">No SPBUs found</div>
                      {searchTerm && (
                        <div className="text-sm text-gray-500">
                          No SPBUs match your search for "{searchTerm}"
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSPBUs.map((spbu) => (
                  <TableRow key={spbu.id}>
                    <TableCell className="font-medium">{spbu.name}</TableCell>
                    <TableCell>{spbu.code}</TableCell>
                    <TableCell>{spbu.location}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        spbu.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {spbu.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(spbu)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSPBU(spbu.id)}
                            disabled={deleteSPBUMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Edit SPBU Dialog */}
      {!isReadOnly && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit SPBU</DialogTitle>
              <DialogDescription>
                Update SPBU details. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            {editingSPBU && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => handleEditFormChange('name', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-code" className="text-right">
                    Code
                  </Label>
                  <Input
                    id="edit-code"
                    value={editFormData.code}
                    onChange={(e) => handleEditFormChange('code', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="edit-location"
                    value={editFormData.location}
                    onChange={(e) => handleEditFormChange('location', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editFormData.is_active.toString()}
                    onValueChange={(value) => handleEditFormChange('is_active', value === 'true')}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSPBU}
                disabled={updateSPBUMutation.isPending}
              >
                {updateSPBUMutation.isPending ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default SPBUManagementPage