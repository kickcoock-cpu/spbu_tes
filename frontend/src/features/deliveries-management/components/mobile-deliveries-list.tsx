import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, Package, CheckCircle, User, Calendar, Hash } from 'lucide-react'

interface Delivery {
  id: number
  spbu_id: number
  supplier: string
  delivery_order_number: string
  delivery_order_photo?: string
  fuel_type: string
  planned_liters: string
  actual_liters?: string
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

interface MobileDeliveriesListProps {
  deliveries: Delivery[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddDelivery: () => void
  onViewDetail: (delivery: Delivery) => void
  onConfirmDelivery: (delivery: Delivery) => void
  onApproveDelivery: (delivery: Delivery) => void
  isLoading: boolean
  isError: boolean
  isReadOnly: boolean
  isOperator: boolean
  isDeliveryEligibleForConfirmation: (delivery: Delivery) => boolean
}

export const MobileDeliveriesList: React.FC<MobileDeliveriesListProps> = ({
  deliveries,
  searchTerm,
  onSearchChange,
  onAddDelivery,
  onViewDetail,
  onConfirmDelivery,
  onApproveDelivery,
  isLoading,
  isError,
  isReadOnly,
  isOperator,
  isDeliveryEligibleForConfirmation
}) => {
  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-base">Loading deliveries...</span>
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
            Failed to load deliveries data. Please try again later.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search bar with enhanced styling and spacing */}
      <div className="px-4">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search deliveries..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full shadow-sm py-5"
          />
        </div>
        
        {!isReadOnly && !isOperator && (
          <Button onClick={onAddDelivery} className="w-full mt-4 py-5">
            <Plus className="mr-2 h-4 w-4" />
            Add Delivery
          </Button>
        )}
      </div>

      {/* Deliveries list with improved spacing and visual hierarchy */}
      <div className="px-4 flex flex-col gap-4 pb-4">
        {deliveries.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchTerm ? 'No deliveries found matching your search' : 'No deliveries available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          deliveries.map((delivery) => (
            <Card key={delivery.id} className="overflow-hidden shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <CardTitle className="text-lg">
                        {new Date(delivery.delivery_date).toLocaleDateString('id-ID')}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {delivery.SPBU ? `${delivery.SPBU.name} (${delivery.SPBU.code})` : '-'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    className={`text-xs whitespace-nowrap flex-shrink-0 ${getStatusColor(delivery.status)}`}
                  >
                    {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Fuel
                    </span>
                    <span className="truncate font-medium">
                      {delivery.fuel_type}
                    </span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Planned
                    </span>
                    <span className="truncate font-medium">
                      {parseFloat(delivery.planned_liters).toFixed(2)} L
                    </span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Actual
                    </span>
                    <span className="truncate">
                      {delivery.actual_liters ? parseFloat(delivery.actual_liters).toFixed(2) + ' L' : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      ID
                    </span>
                    <span className="truncate">#{delivery.id}</span>
                  </div>
                  <div className="col-span-2 flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs">Supplier</span>
                    <span className="truncate">
                      {delivery.supplier}
                    </span>
                  </div>
                  <div className="col-span-2 flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs">DO Number</span>
                    <span className="truncate">
                      {delivery.delivery_order_number || '-'}
                    </span>
                  </div>
                  {delivery.confirmer && (
                    <div className="col-span-2 flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Confirmed
                      </span>
                      <span className="truncate">
                        {delivery.confirmer.name}
                      </span>
                    </div>
                  )}
                  {delivery.approver && (
                    <div className="col-span-2 flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Approved
                      </span>
                      <span className="truncate">
                        {delivery.approver.name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 py-5"
                    onClick={() => onViewDetail(delivery)}
                  >
                    View Details
                  </Button>
                  
                  {isOperator && delivery.status === 'pending' && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 py-5"
                      onClick={() => onConfirmDelivery(delivery)}
                      disabled={!isDeliveryEligibleForConfirmation(delivery)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                  )}
                  
                  {!isReadOnly && !isOperator && delivery.status === 'pending' && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 py-5"
                      onClick={() => onConfirmDelivery(delivery)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                  )}
                  
                  {!isReadOnly && !isOperator && delivery.status === 'confirmed' && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 py-5"
                      onClick={() => onApproveDelivery(delivery)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}