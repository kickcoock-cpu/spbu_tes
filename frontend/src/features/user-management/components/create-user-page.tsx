import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import { ChevronLeft, Save, User, Shield } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { hasFullAccess } from '@/lib/rbac'

// Types
interface Role {
  id: number
  name: string
}

interface SPBU {
  id: number
  name: string
  code: string
}

interface UserFormData {
  name: string
  username: string
  email: string
  password: string
  role: string
  spbu: string
}

// API functions
const fetchRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('/api/roles')
  return response.data.data
}

const fetchSPBUs = async (): Promise<SPBU[]> => {
  const response = await apiClient.get('/api/spbu')
  return response.data.data
}

const createUser = async (userData: any) => {
  const response = await apiClient.post('/api/users', userData)
  return response.data
}

export const CreateUserPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    role: '',
    spbu: ''
  })
  
  // Fetch roles and SPBUs
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles
  })
  
  const { data: spbus, isLoading: spbusLoading } = useQuery({
    queryKey: ['spbus'],
    queryFn: fetchSPBUs
  })
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      toast.success('User created successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate({ to: '/users' })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user')
    }
  })
  
  // Handle form changes
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  // Handle form submission
  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }
    
    if (!formData.username.trim()) {
      toast.error('Username is required')
      return
    }
    
    if (!formData.role) {
      toast.error('Role is required')
      return
    }
    
    // Check if role requires SPBU
    const rolesRequiringSPBU = ['Admin', 'Operator']
    if (rolesRequiringSPBU.includes(formData.role) && !formData.spbu) {
      toast.error('SPBU is required for Admin and Operator roles')
      return
    }
    
    if (!formData.password) {
      toast.error('Password is required')
      return
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    // Prepare data for submission
    const userData: any = {
      name: formData.name,
      username: formData.username,
      role: formData.role,
      password: formData.password
    }
    
    // Add email if provided
    if (formData.email) {
      userData.email = formData.email
    }
    
    // Add SPBU if selected and required
    if (formData.spbu) {
      userData.spbu = parseInt(formData.spbu)
    }
    
    createUserMutation.mutate(userData)
  }
  
  // Roles that require SPBU selection
  const rolesRequiringSPBU = ['Admin', 'Operator']
  const isSPBURequired = formData.role && rolesRequiringSPBU.includes(formData.role)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate({ to: '/users' })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create User</h1>
          <p className="text-muted-foreground">
            Add a new user to the system
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Enter the details for the new user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter full name"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => handleFormChange('username', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleFormChange('role', value)}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesLoading ? (
                      <SelectItem value="loading">Loading roles...</SelectItem>
                    ) : (
                      roles?.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spbu">
                SPBU {isSPBURequired && <span className="text-destructive">*</span>}
              </Label>
              <Select 
                value={formData.spbu} 
                onValueChange={(value) => handleFormChange('spbu', value)}
                disabled={!isSPBURequired}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isSPBURequired ? "Select SPBU" : "Not required for this role"} />
                </SelectTrigger>
                <SelectContent>
                  {spbusLoading ? (
                    <SelectItem value="loading">Loading SPBUs...</SelectItem>
                  ) : (
                    spbus?.map((spbu) => (
                      <SelectItem key={spbu.id} value={spbu.id.toString()}>
                        {spbu.name} ({spbu.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate({ to: '/users' })}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}