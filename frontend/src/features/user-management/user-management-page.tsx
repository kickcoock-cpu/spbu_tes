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
import { MobileUserList } from './components/mobile-user-list'
import { MobileUserForm } from './components/mobile-user-form'

// Types
interface User {
  id: number
  name: string
  username: string
  email: string
  role: {
    name: string
  } | string
  spbu?: {
    id: number
    name: string
    location: string
    code: string
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Role {
  id: number
  name: string
}

interface SPBU {
  id: number
  name: string
  location: string
  code: string
}

// API functions
const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/api/users')
  return response.data.data
}

const fetchRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('/api/roles')
  return response.data.data
}

const fetchSPBUs = async (): Promise<SPBU[]> => {
  const response = await apiClient.get('/api/spbu')
  return response.data.data
}

const createUser = async (userData: any): Promise<User> => {
  const response = await apiClient.post('/api/users/register', userData)
  return response.data.data
}

const updateUser = async ({ id, userData }: { id: number; userData: any }): Promise<User> => {
  const response = await apiClient.put(`/api/users/${id}`, userData)
  return response.data.data
}

const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/users/${id}`)
}

const UserManagementPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore().auth
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Check if user has access to user management
  const userHasAccess = user ? hasAccess(user, 'users') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'users') : false
  const isReadOnly = !userHasFullAccess
  const isAdmin = user?.role?.includes('Admin') || false

  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])
  const { data: users = [], isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: userHasAccess
  })

  const { data: roles = [], isLoading: rolesLoading, isError: rolesError } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    enabled: userHasAccess && userHasFullAccess
  })

  const { data: spbus = [], isLoading: spbusLoading, isError: spbusError } = useQuery({
    queryKey: ['spbus'],
    queryFn: fetchSPBUs,
    enabled: userHasAccess && userHasFullAccess
  })

  // Filter users based on search term and role (Admin only sees operators)
  const filteredUsers = users.filter(user => {
    // If user is Admin, only show operators
    if (isAdmin && 
        !(typeof user.role === 'string' ? user.role === 'Operator' : user.role?.name === 'Operator')) {
      return false
    }
    
    // Apply search filtering
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.role && 
        (typeof user.role === 'string' 
          ? user.role.toLowerCase().includes(searchTerm.toLowerCase())
          : user.role.name && user.role.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
  })

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
      setIsCreateDialogOpen(false)
      // Reset form
      setCreateFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        role: '',
        spbu: ''
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user')
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated successfully')
      setIsEditDialogOpen(false)
      setEditingUser(null)
      // Reset form
      setEditFormData({
        name: '',
        username: '',
        email: '',
        role: '',
        spbu: '',
        is_active: true
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  })

  // Form states
  const [createFormData, setCreateFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: '',
    spbu: ''
  })

  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: '',
    spbu: '',
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

  // Handle create user
  const handleCreateUser = () => {
    // Validate required fields
    if (!createFormData.name.trim()) {
      toast.error('Name is required')
      return
    }
    
    if (!createFormData.username.trim()) {
      toast.error('Username is required')
      return
    }
    
    if (!createFormData.role) {
      toast.error('Role is required')
      return
    }
    
    // Check if SPBU is required for the selected role
    const rolesRequiringSPBU = ['Admin', 'Operator']
    if (rolesRequiringSPBU.includes(createFormData.role) && !createFormData.spbu) {
      toast.error('SPBU is required for Admin and Operator roles')
      return
    }
    
    if (!createFormData.password) {
      toast.error('Password is required')
      return
    }
    
    // Prepare data for submission
    const userData: any = {
      ...createFormData,
    }
    
    // Handle SPBU ID conversion
    if (createFormData.spbu) {
      userData.spbu = parseInt(createFormData.spbu)
    } else {
      delete userData.spbu
    }
    
    // Remove empty fields
    if (!userData.email) {
      delete userData.email
    }
    
    createUserMutation.mutate(userData)
  }

  // Handle edit user
  const handleEditUser = () => {
    if (editingUser) {
      // Validate required fields
      if (!editFormData.name.trim()) {
        toast.error('Name is required')
        return
      }
      
      if (!editFormData.username.trim()) {
        toast.error('Username is required')
        return
      }
      
      if (!editFormData.role) {
        toast.error('Role is required')
        return
      }
      
      // Check if SPBU is required for the selected role
      const rolesRequiringSPBU = ['Admin', 'Operator']
      if (rolesRequiringSPBU.includes(editFormData.role) && !editFormData.spbu) {
        toast.error('SPBU is required for Admin and Operator roles')
        return
      }
      
      // Prepare data for submission
      const userData: any = {
        ...editFormData,
      }
      
      // Handle SPBU ID conversion
      if (editFormData.spbu) {
        userData.spbu = parseInt(editFormData.spbu)
      } else {
        delete userData.spbu
      }
      
      // Remove empty fields
      if (!userData.email) {
        delete userData.email
      }
      
      updateUserMutation.mutate({ 
        id: editingUser.id, 
        userData
      })
    }
  }

  // Handle delete user
  const handleDeleteUser = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(id)
    }
  }

  // Open edit dialog with user data
  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      username: user.username,
      email: user.email || '',
      role: typeof user.role === 'string' ? user.role : (user.role?.name || ''),
      spbu: user.spbu?.id?.toString() || '',
      is_active: user.is_active
    })
    setIsEditDialogOpen(true)
  }

  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }

  // Check if we're on mobile device
  const isMobile = useIsMobile()

  // If user only has read-only access, hide create and edit functionality
  // const isReadOnly = !userHasFullAccess (already declared above)

  if (usersLoading || rolesLoading || spbusLoading) {
    if (isMobile) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <span className="text-base">
              {usersLoading ? 'Loading users...' : rolesLoading ? 'Loading roles...' : 'Loading SPBUs...'}
            </span>
          </div>
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mr-4"></div>
          <span className="text-lg">
            {usersLoading ? 'Loading users...' : rolesLoading ? 'Loading roles...' : 'Loading SPBUs...'}
          </span>
        </div>
      </div>
    )
  }

  if (usersError || rolesError || spbusError) {
    if (isMobile) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center px-4">
            <div className="text-red-500 text-lg font-bold mb-2">Error Loading Data</div>
            <div className="text-gray-600 mb-4 text-sm">
              {usersError ? 'Failed to load user data.' : 
               rolesError ? 'Failed to load role data.' : 
               'Failed to load SPBU data.'}
              Please try again later.
            </div>
            <Button 
              onClick={() => {
                if (usersError) queryClient.invalidateQueries({ queryKey: ['users'] })
                if (rolesError) queryClient.invalidateQueries({ queryKey: ['roles'] })
                if (spbusError) queryClient.invalidateQueries({ queryKey: ['spbus'] })
              }}
              size="sm"
              className="py-5"
            >
              Retry
            </Button>
          </div>
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Data</div>
          <div className="text-gray-600 mb-4">
            {usersError ? 'Failed to load user data.' : 
             rolesError ? 'Failed to load role data.' : 
             'Failed to load SPBU data.'}
            Please try again later.
          </div>
          <Button 
            onClick={() => {
              if (usersError) queryClient.invalidateQueries({ queryKey: ['users'] })
              if (rolesError) queryClient.invalidateQueries({ queryKey: ['roles'] })
              if (spbusError) queryClient.invalidateQueries({ queryKey: ['spbus'] })
            }}
            className="py-5"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Mobile view
  if (isMobile) {
    // If we're editing a user, show the mobile form
    if (isEditDialogOpen && editingUser) {
      return (
        <div className="space-y-6">
          <MobileUserForm
            formData={editFormData}
            roles={roles}
            spbus={spbus}
            isEditing={true}
            isLoading={updateUserMutation.isPending}
            onChange={handleEditFormChange}
            onSubmit={handleEditUser}
            onCancel={() => {
              setIsEditDialogOpen(false)
              setEditingUser(null)
            }}
            isReadOnly={isReadOnly}
          />
        </div>
      )
    }
    
    // If we're creating a user, show the mobile form
    if (isCreateDialogOpen) {
      return (
        <div className="space-y-6">
          <MobileUserForm
            formData={createFormData}
            roles={roles}
            spbus={spbus}
            isEditing={false}
            isLoading={createUserMutation.isPending}
            onChange={handleCreateFormChange}
            onSubmit={handleCreateUser}
            onCancel={() => setIsCreateDialogOpen(false)}
            isReadOnly={isReadOnly}
          />
        </div>
      )
    }
    
    // Otherwise, show the mobile user list
    return (
      <div className="space-y-6">
        <MobileUserList
          users={filteredUsers}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddUser={() => setIsCreateDialogOpen(true)}
          onEditUser={(user) => {
            setEditingUser(user)
            setEditFormData({
              name: user.name,
              username: user.username,
              email: user.email || '',
              role: typeof user.role === 'string' ? user.role : (user.role?.name || ''),
              spbu: user.spbu?.id?.toString() || '',
              is_active: user.is_active
            })
            setIsEditDialogOpen(true)
          }}
          onDeleteUser={(id) => {
            if (window.confirm('Are you sure you want to delete this user?')) {
              deleteUserMutation.mutate(id)
            }
          }}
          isLoading={false}
          isError={false}
          isReadOnly={isReadOnly}
          isAdmin={isAdmin}
        />
      </div>
    )
  }

  // Desktop view (existing implementation)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          {isReadOnly 
            ? (isAdmin ? 'View operators in the system' : 'View users in the system') 
            : 'Manage users, roles, and permissions'}
        </p>
      </div>
      {!isReadOnly && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. Click save when you're done.
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
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={createFormData.username}
                  onChange={(e) => handleCreateFormChange('username', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => handleCreateFormChange('email', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => handleCreateFormChange('password', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={createFormData.role}
                  onValueChange={(value) => handleCreateFormChange('role', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: Role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="spbu" className="text-right">
                  SPBU
                </Label>
                <Select
                  value={createFormData.spbu}
                  onValueChange={(value) => handleCreateFormChange('spbu', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an SPBU" />
                  </SelectTrigger>
                  <SelectContent>
                    {spbus.map((spbu: SPBU) => (
                      <SelectItem key={spbu.id} value={spbu.id.toString()}>
                        {spbu.name} ({spbu.code})
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
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {isReadOnly 
              ? (isAdmin ? 'View all operators in the system' : 'View all users in the system') 
              : 'Manage all users in the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>SPBU</TableHead>
                <TableHead>Status</TableHead>
                {!isReadOnly && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isReadOnly ? 6 : 7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">No users found</div>
                      {searchTerm && (
                        <div className="text-sm text-gray-500">
                          No users match your search for "{searchTerm}"
                        </div>
                      )}
                      {isAdmin && !searchTerm && (
                        <div className="text-sm text-gray-500">
                          No operators found in the system
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      {typeof user.role === 'string' ? user.role : (user.role?.name || '')}
                    </TableCell>
                    <TableCell>
                      {user.spbu ? `${user.spbu.name} (${user.spbu.code})` : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleteUserMutation.isPending}
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

      {/* Edit User Dialog */}
      {!isReadOnly && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
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
                  <Label htmlFor="edit-username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="edit-username"
                    value={editFormData.username}
                    onChange={(e) => handleEditFormChange('username', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleEditFormChange('email', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(value) => handleEditFormChange('role', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role: Role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-spbu" className="text-right">
                    SPBU
                  </Label>
                  <Select
                    value={editFormData.spbu}
                    onValueChange={(value) => handleEditFormChange('spbu', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select an SPBU" />
                    </SelectTrigger>
                    <SelectContent>
                      {spbus.map((spbu: SPBU) => (
                        <SelectItem key={spbu.id} value={spbu.id.toString()}>
                          {spbu.name} ({spbu.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                onClick={handleEditUser}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default UserManagementPage;