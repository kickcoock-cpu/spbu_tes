import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, Edit, Trash2, Droplets, Gauge, Zap } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

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

interface MobileTankListProps {
  tanks: Tank[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddTank: () => void
  onEditTank: (tank: Tank) => void
  onDeleteTank: (tank: Tank) => void
  onViewVisualization: () => void
  isLoading: boolean
  isError: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  spbues: SPBU[]
}

export const MobileTankList: React.FC<MobileTankListProps> = ({
  tanks,
  searchTerm,
  onSearchChange,
  onAddTank,
  onEditTank,
  onDeleteTank,
  onViewVisualization,
  isLoading,
  isError,
  canCreate,
  canEdit,
  canDelete,
  spbues
}) => {
  const navigate = useNavigate()
  
  // Get fuel color based on fuel type
  const getFuelColor = (fuelType: string) => {
    switch (fuelType) {
      case 'Premium': return 'bg-red-100 text-red-800 border-red-200'
      case 'Pertamax': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Pertalite': return 'bg-green-100 text-green-800 border-green-200'
      case 'Solar': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Dexlite': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get fuel icon based on fuel type
  const getFuelIcon = (fuelType: string) => {
    switch (fuelType) {
      case 'Premium': return '⛽'
      case 'Pertamax': return '⛽'
      case 'Pertalite': return '⛽'
      case 'Solar': return '🛢️'
      case 'Dexlite': return '🛢️'
      default: return '⛽'
    }
  }

  // Calculate fill percentage
  const getFillPercentage = (current: number, capacity: number) => {
    return Math.min(100, Math.max(0, (current / capacity) * 100))
  }

  // Check if stock is low (less than 20%)
  const isLowStock = (current: number, capacity: number) => {
    return (current / capacity) < 0.2
  }

  // Get status text based on fill level
  const getStatusText = (percentage: number) => {
    if (percentage < 20) return 'Critical'
    if (percentage < 50) return 'Low'
    if (percentage < 80) return 'Normal'
    return 'Good'
  }

  // Get status color based on fill level
  const getStatusColor = (percentage: number) => {
    if (percentage < 20) return 'text-red-600 bg-red-100 border-red-200'
    if (percentage < 50) return 'text-yellow-600 bg-yellow-100 border-yellow-200'
    if (percentage < 80) return 'text-blue-600 bg-blue-100 border-blue-200'
    return 'text-green-600 bg-green-100 border-green-200'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-base">Loading tanks...</span>
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
            Failed to load tank data. Please try again later.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section title with improved spacing */}
      <div className="px-4 pt-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Tanks</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your fuel tanks and monitor stock levels
            </p>
          </div>
          <Button 
            onClick={onViewVisualization} 
            variant="outline" 
            size="sm"
            className="py-5"
          >
            <Zap className="mr-2 h-4 w-4" />
            Visualize
          </Button>
        </div>
      </div>

      {/* Search bar with enhanced styling and spacing */}
      <div className="px-4">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tanks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full shadow-sm py-5"
          />
        </div>
        
        {canCreate && (
          <Button onClick={onAddTank} className="w-full mt-4 py-5">
            <Plus className="mr-2 h-4 w-4" />
            Add Tank
          </Button>
        )}
      </div>

      {/* Tank list with improved spacing and visual hierarchy */}
      <div className="px-4 flex flex-col gap-4 pb-4">
        {tanks.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Droplets className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchTerm ? 'No tanks found matching your search' : 'No tanks available'}
              </p>
              {canCreate && (
                <Button 
                  className="mt-4 py-5" 
                  onClick={() => navigate({ to: '/tanks/create' })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Tank
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          tanks.map((tank) => {
            const fillPercentage = getFillPercentage(tank.current_stock, tank.capacity)
            const isLow = isLowStock(tank.current_stock, tank.capacity)
            const statusText = getStatusText(fillPercentage)
            const statusColor = getStatusColor(fillPercentage)
            
            return (
              <Card key={tank.id} className="overflow-hidden shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-full flex-shrink-0 border ${getFuelColor(tank.fuel_type)}`}>
                        <span className="text-lg">{getFuelIcon(tank.fuel_type)}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <CardTitle className="text-lg truncate">{tank.name}</CardTitle>
                        <CardDescription className="text-sm flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getFuelColor(tank.fuel_type)}`}>
                            {tank.fuel_type}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={isLow ? "destructive" : "default"}
                      className="text-xs whitespace-nowrap flex-shrink-0"
                    >
                      {isLow ? 'Low Stock' : 'Normal'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        Current
                      </span>
                      <span className="truncate font-medium">
                        {tank.current_stock.toLocaleString()} L
                      </span>
                    </div>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        Capacity
                      </span>
                      <span className="truncate">
                        {tank.capacity.toLocaleString()} L
                      </span>
                    </div>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Fill Level
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs w-fit ${statusColor}`}>
                        {statusText} ({fillPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    {tank.SPBU && (
                      <div className="flex flex-col text-sm">
                        <span className="font-medium text-muted-foreground text-xs">SPBU</span>
                        <span className="truncate">{tank.SPBU.code}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 mt-5">
                    {canEdit && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 py-5"
                        onClick={() => onEditTank(tank)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 py-5"
                        onClick={() => onDeleteTank(tank)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}