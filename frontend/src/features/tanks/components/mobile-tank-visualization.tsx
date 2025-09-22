import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Droplets, Gauge, Zap, ChevronLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

interface Tank {
  id: number
  name: string
  fuel_type: string
  capacity: number
  current_stock: number
  SPBU?: {
    name: string
    code: string
  }
}

interface MobileTankVisualizationProps {
  tanks: Tank[]
  onBack: () => void
  onTankSelect?: (tank: Tank) => void
}

export const MobileTankVisualization: React.FC<MobileTankVisualizationProps> = ({
  tanks,
  onBack,
  onTankSelect
}) => {
  const [selectedTank, setSelectedTank] = useState<number | null>(null)
  const navigate = useNavigate()
  
  // Get tank colors based on fuel type
  const getFuelColor = (fuelType: string) => {
    switch (fuelType) {
      case 'Premium': return { from: 'from-red-400', to: 'to-red-600', light: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' }
      case 'Pertamax': return { from: 'from-blue-400', to: 'to-blue-600', light: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' }
      case 'Pertalite': return { from: 'from-green-400', to: 'to-green-600', light: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' }
      case 'Solar': return { from: 'from-yellow-400', to: 'to-yellow-600', light: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' }
      case 'Dexlite': return { from: 'from-purple-400', to: 'to-purple-600', light: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' }
      default: return { from: 'from-gray-400', to: 'to-gray-600', light: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
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

  // Handle low stock alert click
  const handleLowStockClick = (tank: Tank) => {
    // Navigate to deliveries page with tank information
    navigate({ 
      to: '/deliveries', 
      state: { 
        fromTank: {
          tankId: tank.id,
          tankName: tank.name,
          fuelType: tank.fuel_type,
          currentStock: tank.current_stock
        }
      } 
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between pt-2 px-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl font-bold">Tank Visualization</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visual representation of tank levels
          </p>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      {/* Tank visualization cards */}
      <div className="px-4 pb-4">
        {tanks.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Droplets className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                No tanks available for visualization
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tanks.map((tank) => {
              const fillPercentage = getFillPercentage(tank.current_stock, tank.capacity)
              const isLow = isLowStock(tank.current_stock, tank.capacity)
              const fuelColor = getFuelColor(tank.fuel_type)
              const statusText = getStatusText(fillPercentage)
              const statusColor = getStatusColor(fillPercentage)
              
              return (
                <Card
                  key={tank.id}
                  className={`overflow-hidden shadow-sm ${
                    selectedTank === tank.id 
                      ? 'ring-4 ring-blue-100 border-blue-500' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedTank(tank.id === selectedTank ? null : tank.id)}
                >
                  {/* Tank Header */}
                  <div className={`p-4 bg-gradient-to-r ${fuelColor.from} ${fuelColor.to} text-white`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getFuelIcon(tank.fuel_type)}</span>
                          <div>
                            <h3 className="text-lg font-bold truncate">{tank.name}</h3>
                            <p className="text-sm opacity-90 mt-1">{tank.fuel_type}</p>
                          </div>
                        </div>
                      </div>
                      {isLow && (
                        <div 
                          className="flex-shrink-0 animate-pulse cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLowStockClick(tank)
                          }}
                        >
                          <div className="bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors">
                            <AlertTriangle size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tank Visualization */}
                  <CardContent className="p-4">
                    <div className="relative w-full h-40">
                      {/* Tank Container */}
                      <div className="absolute inset-0 flex items-end">
                        {/* Tank Body */}
                        <div className="w-full h-5/6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 relative overflow-hidden shadow-inner">
                          {/* Fuel Fill with Gradient */}
                          <div
                            className={`absolute bottom-0 w-full transition-all duration-1000 ease-out bg-gradient-to-t ${fuelColor.from} ${fuelColor.to}`}
                            style={{ 
                              height: `${fillPercentage}%`,
                            }}
                          >
                            {/* Animated Fuel Surface */}
                            <div className="absolute top-0 left-0 right-0 h-3">
                              <div className="absolute inset-0 bg-white opacity-20 rounded-t-lg"></div>
                              <div 
                                className="absolute top-0.5 left-0 w-1/2 h-0.5 bg-white opacity-40 rounded-full animate-wave"
                                style={{
                                  animationDelay: '0s'
                                }}
                              ></div>
                              <div 
                                className="absolute top-0 left-1/3 w-1/3 h-0.5 bg-white opacity-30 rounded-full animate-wave"
                                style={{
                                  animationDelay: '0.8s'
                                }}
                              ></div>
                            </div>
                            
                            {/* Fuel Bubbles Animation */}
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute rounded-full bg-white opacity-25 animate-bubble"
                                style={{
                                  width: `${Math.random() * 4 + 1}px`,
                                  height: `${Math.random() * 4 + 1}px`,
                                  left: `${Math.random() * 90 + 5}%`,
                                  bottom: `${Math.random() * 70 + 10}%`,
                                  animationDelay: `${Math.random() * 1}s`
                                }}
                              ></div>
                            ))}
                          </div>
                          
                          {/* Measurement Lines */}
                          {[0, 25, 50, 75, 100].map((percent) => (
                            <div 
                              key={percent}
                              className="absolute w-full flex items-center px-1"
                              style={{ bottom: `${percent}%` }}
                            >
                              <div className="h-px bg-gray-400 flex-grow"></div>
                              <span className="text-xs text-gray-500 ml-1 bg-white bg-opacity-80 px-1 rounded">
                                {percent}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Tank Cap */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-full shadow-md"></div>
                      
                      {/* Tank Base */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-gradient-to-b from-gray-500 to-gray-700 rounded-b-lg"></div>
                    </div>

                    {/* Tank Info */}
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Droplets className="text-gray-500" size={16} />
                          <span className="text-gray-600 text-sm font-medium">Current Stock</span>
                        </div>
                        <span className="font-bold text-lg">
                          {tank.current_stock.toLocaleString()} <span className="text-xs font-normal text-gray-500">L</span>
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Gauge className="text-gray-500" size={16} />
                          <span className="text-gray-600 text-sm font-medium">Capacity</span>
                        </div>
                        <span className="font-semibold">
                          {tank.capacity.toLocaleString()} <span className="text-xs font-normal text-gray-500">L</span>
                        </span>
                      </div>
                      
                      <div className="pt-1">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <Zap className="text-gray-500" size={14} />
                            <span className="text-gray-600 text-sm font-medium">Fill Level</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor} border`}>
                            {statusText} ({fillPercentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${fuelColor.from} ${fuelColor.to}`}
                            style={{ width: `${fillPercentage}%` }}
                          >
                            {fillPercentage > 30 && (
                              <div className="h-full w-full bg-gradient-to-r from-white/30 to-transparent"></div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isLow && (
                        <div 
                          className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLowStockClick(tank)
                          }}
                        >
                          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                          <div>
                            <p className="text-red-700 font-bold text-xs">Low Stock Alert!</p>
                            <p className="text-red-600 text-xs">Click to create delivery</p>
                          </div>
                        </div>
                      )}
                      
                      {tank.SPBU && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold">SPBU:</span> {tank.SPBU.name} <span className="opacity-70">({tank.SPBU.code})</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}