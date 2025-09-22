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
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Save, User, Shield } from 'lucide-react'
import { hasFullAccess } from '@/lib/rbac'

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

interface UserFormData {
  name: string
  username: string
  email: string
  password: string
  role: string
  spbu: string
  is_active?: boolean
}

interface MobileUserFormProps {
  formData: UserFormData
  roles: Role[]
  spbus: SPBU[]
  isEditing: boolean
  isLoading: boolean
  onChange: (field: string, value: string | boolean) => void
  onSubmit: () => void
  onCancel: () => void
  isReadOnly: boolean
}

export const MobileUserForm: React.FC<MobileUserFormProps> = ({
  formData,
  roles,
  spbus,
  isEditing,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
  isReadOnly
}) => {
  const rolesRequiringSPBU = ['Admin', 'Operator']
  const isSPBURequired = rolesRequiringSPBU.includes(formData.role)

  return (
    <div className="flex flex-col gap-6">
      {/* Enhanced header with better visual balance */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-12 w-12">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit User' : 'Create User'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEditing 
              ? 'Update user information' 
              : 'Add a new user to the system'}
          </p>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isEditing ? 'Edit User Details' : 'Create New User'}
              </CardTitle>
              <CardDescription className="text-sm">
                {isEditing 
                  ? 'Update user information' 
                  : 'Add a new user to the system'}
              </CardDescription>
            </div>
          </div>
          {/* Permission indicator */}
          {isReadOnly && (
            <div className="mt-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs">
                Read Only Access
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  placeholder="Enter full name"
                  disabled={isReadOnly}
                  className="py-5"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => onChange('username', e.target.value)}
                  placeholder="Enter username"
                  disabled={isReadOnly}
                  className="py-5"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  placeholder="Enter email address"
                  disabled={isReadOnly}
                  className="py-5"
                />
              </div>

              {!isEditing && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => onChange('password', e.target.value)}
                    placeholder="Enter password"
                    disabled={isReadOnly}
                    className="py-5"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => onChange('role', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Role permissions info */}
                {formData.role && (
                  <div className="bg-gray-50 p-3 rounded-lg mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Role Permissions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${hasFullAccess({role: [formData.role]}, 'users') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>User Management</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${hasFullAccess({role: [formData.role]}, 'sales') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Sales</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${hasFullAccess({role: [formData.role]}, 'deliveries') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Deliveries</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${hasFullAccess({role: [formData.role]}, 'reports') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Reports</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${hasFullAccess({role: [formData.role]}, 'spbu') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>SPBU</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${hasFullAccess({role: [formData.role]}, 'prices') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Prices</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${hasFullAccess({role: [formData.role]}, 'dashboard') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Dashboard</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${hasFullAccess({role: [formData.role]}, 'attendance') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Attendance</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="spbu" className="flex items-center">
                  <span>SPBU</span>
                  {isSPBURequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Select
                  value={formData.spbu}
                  onValueChange={(value) => onChange('spbu', value)}
                  disabled={isReadOnly || !formData.role}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Select an SPBU" />
                  </SelectTrigger>
                  <SelectContent>
                    {spbus.map((spbu) => (
                      <SelectItem key={spbu.id} value={spbu.id.toString()}>
                        {spbu.name} ({spbu.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isSPBURequired && !formData.spbu && (
                  <p className="text-sm text-destructive mt-1">
                    SPBU is required for {formData.role} role
                  </p>
                )}
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
                  className="flex-1 py-6 text-base"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="flex-1 py-6 text-base"
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