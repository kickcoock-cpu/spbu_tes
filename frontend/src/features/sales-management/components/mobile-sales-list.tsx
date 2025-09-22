import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, Fuel, CreditCard, Calendar, Hash, User } from 'lucide-react'

interface Sale {
  id: number
  spbu_id: number
  operator_id: number
  pump_number: number
  fuel_type: string
  liters: number
  amount: number
  transaction_date: string
  created_at: string
  updated_at: string
  SPBU?: {
    name: string
    code: string
  }
  operator?: {
    name: string
    email: string
  }
}

interface MobileSalesListProps {
  sales: Sale[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddSale: () => void
  isLoading: boolean
  isError: boolean
  isReadOnly: boolean
}

export const MobileSalesList: React.FC<MobileSalesListProps> = ({
  sales,
  searchTerm,
  onSearchChange,
  onAddSale,
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-base">Loading sales...</span>
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
            Failed to load sales data. Please try again later.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section title with improved spacing */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">Sales Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isReadOnly 
            ? 'View sales transactions in the system' 
            : 'Manage sales transactions'}
        </p>
      </div>

      {/* Search bar with enhanced styling and spacing */}
      <div className="px-4">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full shadow-sm py-5"
          />
        </div>
        
        {!isReadOnly && (
          <Button onClick={onAddSale} className="w-full mt-4 py-5">
            <Plus className="mr-2 h-4 w-4" />
            Add Sale
          </Button>
        )}
      </div>

      {/* Sales list with improved spacing and visual hierarchy */}
      <div className="px-4 flex flex-col gap-4 pb-20"> {/* Added padding bottom for bottom nav */}
        {sales.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchTerm ? 'No sales found matching your search' : 'No sales available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          [...sales]
            .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
            .map((sale) => (
              <Card key={sale.id} className="overflow-hidden shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <CardTitle className="text-lg">
                          {new Date(sale.transaction_date).toLocaleDateString('id-ID')}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {sale.SPBU ? `${sale.SPBU.name} (${sale.SPBU.code})` : '-'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      className={`text-xs whitespace-nowrap flex-shrink-0 ${getFuelColor(sale.fuel_type)}`}
                    >
                      {sale.fuel_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        <Fuel className="h-3 w-3" />
                        Liters
                      </span>
                      <span className="truncate font-medium">
                        {parseFloat(sale.liters.toString()).toFixed(2)} L
                      </span>
                    </div>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        Amount
                      </span>
                      <span className="truncate font-medium">
                        {formatCurrency(parseFloat(sale.amount.toString()))}
                      </span>
                    </div>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                        <User className="h-3 w-3" />
                        ID
                      </span>
                      <span className="truncate">#{sale.id}</span>
                    </div>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs">Time</span>
                      <span className="truncate">
                        {new Date(sale.transaction_date).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="col-span-2 flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground text-xs">Operator</span>
                      <span className="truncate">
                        {sale.operator ? sale.operator.name : '-'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  )
}