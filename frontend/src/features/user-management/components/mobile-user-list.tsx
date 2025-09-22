import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, Edit, Trash2, User, Shield } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { getUserPermission } from '@/lib/rbac'

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

interface MobileUserListProps {
  users: User[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddUser: () => void
  onEditUser: (user: User) => void
  onDeleteUser: (id: number) => void
  isLoading: boolean
  isError: boolean
  isReadOnly: boolean
  isAdmin: boolean
}

export const MobileUserList: React.FC<MobileUserListProps> = ({
  users,
  searchTerm,
  onSearchChange,
  onAddUser,
  onEditUser,
  onDeleteUser,
  isLoading,
  isError,
  isReadOnly,
  isAdmin
}) => {
  const { user } = useAuthStore((state) => state.auth)
  
  // Get user permission level
  const userPermission = user ? getUserPermission(user, 'users') : 'none';
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-base">Loading users...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-bold mb-2">Error Loading Data</div>
          <div className="text-gray-600 mb-4 text-sm">
            Failed to load user data. Please try again later.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section title with improved spacing */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isReadOnly 
            ? (isAdmin ? 'View operators in the system' : 'View users in the system') 
            : 'Manage users, roles, and permissions'}
        </p>
        {/* Permission indicator */}
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {userPermission === 'full' ? 'Full Access' : 
             userPermission === 'read-only' ? 'Read Only' : 
             userPermission === 'limited' ? 'Limited Access' : 'No Access'}
          </Badge>
          <div className="group relative">
            <Shield className="h-4 w-4 text-muted-foreground cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-black text-white text-xs rounded py-1 px-2 z-10">
              {userPermission === 'full' ? 'Can create, read, update, and delete' : 
               userPermission === 'read-only' ? 'Can only view information' : 
               userPermission === 'limited' ? 'Restricted actions allowed' : 'No access to this section'}
            </div>
          </div>
        </div>
      </div>

      {/* Search bar with enhanced styling and spacing */}
      <div className="px-4">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full shadow-sm py-5"
          />
        </div>
        
        {!isReadOnly && (
          <Button onClick={onAddUser} className="w-full mt-4 py-6 text-base">
            <Plus className="mr-2 h-5 w-5" />
            Add User
          </Button>
        )}
      </div>

      {/* User list with improved spacing and visual hierarchy */}
      <div className="px-4 flex flex-col gap-4 pb-4">
        {users.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchTerm ? 'No users found matching your search' : 'No users available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="overflow-hidden shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <CardTitle className="text-lg truncate">{user.name}</CardTitle>
                        <CardDescription className="text-sm truncate">@{user.username}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant={user.is_active ? "default" : "destructive"}
                        className="text-xs whitespace-nowrap flex-shrink-0"
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {user.is_active ? (
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      )}
                    </div>
                  </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-2 gap-3">
                  {user.email && (
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs">Email</span>
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs">Role</span>
                    <span className="truncate">
                      {typeof user.role === 'string' ? user.role : user.role?.name || 'N/A'}
                    </span>
                    {/* Role permissions indicator */}
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {getUserPermission({role: [typeof user.role === 'string' ? user.role : user.role?.name || '']}, 'users') === 'full' ? 'Full' : 
                         getUserPermission({role: [typeof user.role === 'string' ? user.role : user.role?.name || '']}, 'users') === 'read-only' ? 'Read' : 
                         getUserPermission({role: [typeof user.role === 'string' ? user.role : user.role?.name || '']}, 'users') === 'limited' ? 'Limited' : 'None'}
                      </span>
                    </div>
                  </div>
                  {user.spbu && (
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs">SPBU</span>
                      <span className="truncate">{user.spbu.name}</span>
                    </div>
                  )}
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs">ID</span>
                    <span className="truncate">#{user.id}</span>
                  </div>
                </div>
                
                {!isReadOnly && (
                  <div className="flex gap-3 mt-5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 py-5 text-base"
                      onClick={() => onEditUser(user)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 py-5 text-base"
                      onClick={() => onDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}