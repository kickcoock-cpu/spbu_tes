import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, Check, X } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess, hasLimitedAccess } from '@/lib/rbac'

interface Tank {
  id: number
  spbu_id: number
  name: string
  fuel_type: string
  capacity: string
  current_stock: string
  created_at: string
  updated_at: string
  SPBU?: {
    name: string
    code: string
  }
}

interface Adjustment {
  id: number
  spbu_id: number
  operator_id: number | null
  type: 'fuel' | 'equipment' | 'other'
  description: string
  tank_id?: number | null
  adjustment_type?: 'gain' | 'loss' | null
  quantity?: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_by: number | null
  rejected_by: number | null
  created_at: string
  updated_at: string
  SPBU?: {
    name: string
    code: string
  }
  operator?: {
    name: string
  }
  adjustment_approver?: {
    name: string
  }
  adjustment_rejector?: {
    name: string
  }
  Tank?: {
    name: string
    fuel_type: string
  }
}

interface MobileAdjustmentsListProps {
  adjustments: Adjustment[]
  tanks: Tank[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onCreateAdjustment: (data: any) => void
  onApproveAdjustment: (id: number) => void
  onRejectAdjustment: (id: number) => void
  isLoading: boolean
  isError: boolean
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  createFormData: any
  onCreateFormChange: (field: string, value: any) => void
  handleCreateAdjustment: () => void
  approveAdjustmentMutation: any
  rejectAdjustmentMutation: any
  createAdjustmentMutation: any
}

export const MobileAdjustmentsList: React.FC<MobileAdjustmentsListProps> = ({
  adjustments,
  tanks,
  searchTerm,
  onSearchChange,
  onCreateAdjustment,
  onApproveAdjustment,
  onRejectAdjustment,
  isLoading,
  isError,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  createFormData,
  onCreateFormChange,
  handleCreateAdjustment,
  approveAdjustmentMutation,
  rejectAdjustmentMutation,
  createAdjustmentMutation
}) => {
  const { user } = useAuthStore().auth
  
  // Check if user has access to adjustments management
  const userHasAccess = user ? hasAccess(user, 'adjustments') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'adjustments') : false
  const userHasLimitedAccess = user ? hasLimitedAccess(user, 'adjustments') && !userHasFullAccess : false
  
  // Custom RBAC logic for adjustments:
  // - Operators (limited access): Can create adjustment requests
  // - Super Admins/Admins (full access): Can only approve/reject (not create)
  const isOperator = userHasLimitedAccess && !userHasFullAccess
  const isApprover = userHasFullAccess
  const canCreateAdjustments = isOperator
  const canApproveAdjustments = isApprover
  const isReadOnly = !isOperator && !isApprover

  // Filter adjustments based on search term
  const filteredAdjustments = adjustments.filter(adjustment => 
    adjustment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adjustment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (adjustment.SPBU?.name && adjustment.SPBU.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (adjustment.SPBU?.code && adjustment.SPBU.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (adjustment.operator?.name && adjustment.operator.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading adjustments...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Data</div>
          <div className="text-gray-600 mb-4">
            Failed to load adjustments data. Please try again later.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Section title with improved spacing */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold">Adjustments Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isReadOnly 
            ? 'View adjustment requests' 
            : isOperator
              ? 'Request adjustments'
              : isApprover
                ? 'Approve/Reject adjustment requests'
                : 'Manage adjustments'}
        </p>
        {/* Permission indicator */}
        <div className="mt-2">
          <Badge variant={userHasFullAccess ? "default" : userHasLimitedAccess ? "secondary" : "outline"} className="text-xs">
            {userHasFullAccess ? 'Full Access' : userHasLimitedAccess ? 'Limited Access' : 'Read Only'}
          </Badge>
        </div>
      </div>
      
      {/* Search and Create Button */}
      <div className="px-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search adjustments..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full shadow-sm py-6 text-base"
          />
        </div>
        
        {canCreateAdjustments && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="w-full py-6 text-base rounded-full shadow-md"
          >
            <Plus className="mr-2 h-5 w-5" />
            Request Adjustment
          </Button>
        )}
      </div>
      
      {/* Adjustments list with improved spacing and visual hierarchy */}
      <div className="px-4 flex flex-col gap-4 pb-4">
        {filteredAdjustments.length === 0 ? (
          <Card className="shadow-sm rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <p className="text-gray-500 text-center text-base">
                {searchTerm ? 'No adjustments found matching your search' : 'No adjustment requests available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAdjustments.map((adjustment) => (
            <Card key={adjustment.id} className="overflow-hidden shadow-md rounded-xl border-2 border-transparent hover:border-blue-300 transition-all duration-300">
              <CardHeader className="pb-3 bg-gray-50">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex flex-col min-w-0">
                    <CardTitle className="text-xl font-bold">#{adjustment.id}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {new Date(adjustment.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      adjustment.status === 'pending' ? 'default' : 
                      adjustment.status === 'approved' ? 'success' : 'destructive'
                    }
                    className="text-sm py-1 px-3 whitespace-nowrap font-medium"
                  >
                    {adjustment.status.charAt(0).toUpperCase() + adjustment.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Type</span>
                    <span className="truncate text-base font-medium mt-1">
                      {adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Operator</span>
                    <span className="truncate text-base mt-1">
                      {adjustment.operator ? adjustment.operator.name : '-'}
                    </span>
                  </div>
                  {adjustment.Tank && (
                    <div className="flex flex-col">
                      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Tank</span>
                      <span className="truncate text-base mt-1">
                        {adjustment.Tank.name} - {adjustment.Tank.fuel_type}
                      </span>
                    </div>
                  )}
                  {adjustment.adjustment_type && (
                    <div className="flex flex-col">
                      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Adjustment</span>
                      <span className="truncate text-base mt-1">
                        {adjustment.adjustment_type.charAt(0).toUpperCase() + adjustment.adjustment_type.slice(1)}
                      </span>
                    </div>
                  )}
                  {adjustment.quantity && (
                    <div className="flex flex-col">
                      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Quantity</span>
                      <span className="truncate text-base font-bold mt-1">
                        {parseFloat(adjustment.quantity).toFixed(2)} L
                      </span>
                    </div>
                  )}
                  <div className="col-span-2 flex flex-col">
                    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Description</span>
                    <span className="mt-1 text-base line-clamp-2">
                      {adjustment.description || '-'}
                    </span>
                  </div>
                </div>
                
                {canApproveAdjustments && adjustment.status === 'pending' && (
                  <div className="flex gap-3 mt-6">
                    <Button 
                      variant="default" 
                      className="flex-1 py-6 text-base rounded-full bg-green-500 hover:bg-green-600"
                      onClick={() => onApproveAdjustment(adjustment.id)}
                      disabled={approveAdjustmentMutation.isPending}
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1 py-6 text-base rounded-full"
                      onClick={() => onRejectAdjustment(adjustment.id)}
                      disabled={rejectAdjustmentMutation.isPending}
                    >
                      <X className="h-5 w-5 mr-2" />
                      Reject
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