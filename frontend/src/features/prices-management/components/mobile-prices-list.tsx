import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, Fuel, CreditCard, Calendar, User, Hash } from 'lucide-react'

interface SPBU {
  id: number
  name: string
  code: string
  location: string
  is_active: boolean
}

interface Price {
  id: number
  spbu_id: number | null
  fuel_type: 'Premium' | 'Pertamax' | 'Pertalite' | 'Solar' | 'Dexlite'
  price: string
  effective_date: string
  updated_by: number
  created_at: string
  updated_at: string
  SPBU?: {
    name: string
    code: string
  }
  updated_by_user?: {
    name: string
  }
}

interface MobilePricesListProps {
  prices: Price[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddPrice: () => void
  onEditPrice: (price: Price) => void
  isLoading: boolean
  isError: boolean
  isReadOnly: boolean
}

export const MobilePricesList: React.FC<MobilePricesListProps> = ({
  prices,
  searchTerm,
  onSearchChange,
  onAddPrice,
  onEditPrice,
  isLoading,
  isError,
  isReadOnly
}) => {
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

  // Format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-base">Loading prices...</span>
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
            Failed to load prices data. Please try again later.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section title with improved spacing */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">Prices Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isReadOnly 
            ? 'View current fuel prices' 
            : 'Manage fuel prices'}
        </p>
      </div>

      {/* Search bar with enhanced styling and spacing */}
      <div className="px-4">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search prices..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full shadow-sm py-5"
          />
        </div>
        
        {!isReadOnly && (
          <Button onClick={onAddPrice} className="w-full mt-4 py-5">
            <Plus className="mr-2 h-4 w-4" />
            Add Price
          </Button>
        )}
      </div>

      {/* Prices list with improved spacing and visual hierarchy */}
      <div className="px-4 flex flex-col gap-4 pb-4">
        {prices.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchTerm ? 'No prices found matching your search' : 'No prices available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          prices.map((price) => (
            <Card key={price.id} className="overflow-hidden shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                      <Fuel className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <CardTitle className="text-lg truncate">{price.fuel_type}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {price.spbu_id 
                          ? (price.SPBU ? `${price.SPBU.name} (${price.SPBU.code})` : `SPBU ${price.spbu_id}`) 
                          : 'Global'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    className={`text-xs whitespace-nowrap flex-shrink-0 ${getFuelColor(price.fuel_type)}`}
                  >
                    {price.fuel_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Price
                    </span>
                    <span className="truncate font-medium">
                      {formatCurrency(price.price)}
                    </span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Effective
                    </span>
                    <span className="truncate">
                      {new Date(price.effective_date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Updated By
                    </span>
                    <span className="truncate">
                      {price.updated_by_user ? price.updated_by_user.name : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      ID
                    </span>
                    <span className="truncate">#{price.id}</span>
                  </div>
                </div>
                
                {!isReadOnly && (
                  <div className="flex gap-3 mt-5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 py-5"
                      onClick={() => onEditPrice(price)}
                    >
                      <Fuel className="h-4 w-4 mr-2" />
                      Edit Price
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