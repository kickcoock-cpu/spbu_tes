import React, { useState } from 'react';
import { AlertTriangle, Droplets, Gauge, Zap } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface TankVisualizationProps {
  tanks: Array<{
    id: number;
    name: string;
    fuel_type: string;
    capacity: number;
    current_stock: number;
    SPBU?: {
      name: string;
      code: string;
    };
  }>;
}

const TankVisualization: React.FC<TankVisualizationProps> = ({ tanks }) => {
  const [selectedTank, setSelectedTank] = useState<number | null>(null);
  const navigate = useNavigate();
  
  // Get tank colors based on fuel type
  const getFuelColor = (fuelType: string) => {
    switch (fuelType) {
      case 'Premium': return { from: 'from-red-400', to: 'to-red-600', light: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' };
      case 'Pertamax': return { from: 'from-blue-400', to: 'to-blue-600', light: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' };
      case 'Pertalite': return { from: 'from-green-400', to: 'to-green-600', light: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' };
      case 'Solar': return { from: 'from-yellow-400', to: 'to-yellow-600', light: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' };
      case 'Dexlite': return { from: 'from-purple-400', to: 'to-purple-600', light: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' };
      default: return { from: 'from-gray-400', to: 'to-gray-600', light: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  // Get fuel icon based on fuel type
  const getFuelIcon = (fuelType: string) => {
    switch (fuelType) {
      case 'Premium': return '⛽';
      case 'Pertamax': return '⛽';
      case 'Pertalite': return '⛽';
      case 'Solar': return '🛢️';
      case 'Dexlite': return '🛢️';
      default: return '⛽';
    }
  };

  // Calculate fill percentage
  const getFillPercentage = (current: number, capacity: number) => {
    return Math.min(100, Math.max(0, (current / capacity) * 100));
  };

  // Check if stock is low (less than 20%)
  const isLowStock = (current: number, capacity: number) => {
    return (current / capacity) < 0.2;
  };

  // Get status text based on fill level
  const getStatusText = (percentage: number) => {
    if (percentage < 20) return 'Critical';
    if (percentage < 50) return 'Low';
    if (percentage < 80) return 'Normal';
    return 'Good';
  };

  // Get status color based on fill level
  const getStatusColor = (percentage: number) => {
    if (percentage < 20) return 'text-red-600 bg-red-100 border-red-200';
    if (percentage < 50) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (percentage < 80) return 'text-blue-600 bg-blue-100 border-blue-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  // Handle low stock alert click
  const handleLowStockClick = (tank: { id: number; name: string; fuel_type: string; current_stock: number }) => {
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
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {tanks.map((tank) => {
        const fillPercentage = getFillPercentage(tank.current_stock, tank.capacity);
        const isLow = isLowStock(tank.current_stock, tank.capacity);
        const fuelColor = getFuelColor(tank.fuel_type);
        const statusText = getStatusText(fillPercentage);
        const statusColor = getStatusColor(fillPercentage);
        
        return (
          <div
            key={tank.id}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-xl cursor-pointer transform hover:-translate-y-1 ${
              selectedTank === tank.id 
                ? 'border-blue-500 ring-4 ring-blue-100' 
                : 'border-gray-200'
            }`}
            onClick={() => setSelectedTank(tank.id === selectedTank ? null : tank.id)}
          >
            {/* Tank Header */}
            <div className={`p-5 bg-gradient-to-r ${fuelColor.from} ${fuelColor.to} text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getFuelIcon(tank.fuel_type)}</span>
                    <div>
                      <h3 className="text-xl font-bold truncate">{tank.name}</h3>
                      <p className="text-sm opacity-90 mt-1">{tank.fuel_type}</p>
                    </div>
                  </div>
                </div>
                {isLow && (
                  <div 
                    className="flex-shrink-0 animate-pulse-enhanced cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLowStockClick(tank);
                    }}
                  >
                    <div className="bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors">
                      <AlertTriangle size={20} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tank Visualization */}
            <div className="p-5">
              <div className="relative w-full h-48">
                {/* Tank Container */}
                <div className="absolute inset-0 flex items-end">
                  {/* Tank Body */}
                  <div className="w-full h-5/6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 relative overflow-hidden shadow-inner">
                    {/* Fuel Fill with Gradient */}
                    <div
                      className={`absolute bottom-0 w-full transition-all duration-1500 ease-out bg-gradient-to-t ${fuelColor.from} ${fuelColor.to}`}
                      style={{ 
                        height: `${fillPercentage}%`,
                      }}
                    >
                      {/* Animated Fuel Surface */}
                      <div className="absolute top-0 left-0 right-0 h-4">
                        <div className="absolute inset-0 bg-white opacity-20 rounded-t-lg"></div>
                        <div 
                          className="absolute top-1 left-0 w-1/2 h-1 bg-white opacity-40 rounded-full animate-wave"
                          style={{
                            animationDelay: '0s'
                          }}
                        ></div>
                        <div 
                          className="absolute top-0 left-1/3 w-1/3 h-1 bg-white opacity-30 rounded-full animate-wave"
                          style={{
                            animationDelay: '0.8s'
                          }}
                        ></div>
                      </div>
                      
                      {/* Fuel Bubbles Animation */}
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full bg-white opacity-25 animate-bubble"
                          style={{
                            width: `${Math.random() * 6 + 2}px`,
                            height: `${Math.random() * 6 + 2}px`,
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
                        className="absolute w-full flex items-center px-2"
                        style={{ bottom: `${percent}%` }}
                      >
                        <div className="h-px bg-gray-400 flex-grow"></div>
                        <span className="text-xs text-gray-500 ml-2 bg-white bg-opacity-80 px-1.5 rounded">
                          {percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Tank Cap */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-full shadow-md"></div>
                
                {/* Tank Base */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-gradient-to-b from-gray-500 to-gray-700 rounded-b-lg"></div>
              </div>

              {/* Tank Info */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Droplets className="text-gray-500" size={18} />
                    <span className="text-gray-600 font-medium">Current Stock</span>
                  </div>
                  <span className="font-bold text-xl">
                    {tank.current_stock.toLocaleString()} <span className="text-sm font-normal text-gray-500">L</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Gauge className="text-gray-500" size={18} />
                    <span className="text-gray-600 font-medium">Capacity</span>
                  </div>
                  <span className="font-semibold">
                    {tank.capacity.toLocaleString()} <span className="text-sm font-normal text-gray-500">L</span>
                  </span>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="text-gray-500" size={16} />
                      <span className="text-gray-600 font-medium">Fill Level</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor} border`}>
                      {statusText} ({fillPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1500 ease-out bg-gradient-to-r ${fuelColor.from} ${fuelColor.to}`}
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
                    className="flex items-center gap-3 mt-3 p-3 bg-red-50 rounded-lg border border-red-200 animate-pulse-enhanced cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLowStockClick(tank);
                    }}
                  >
                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-red-700 font-bold text-sm">Low Stock Alert!</p>
                      <p className="text-red-600 text-xs">Click to create delivery</p>
                    </div>
                  </div>
                )}
                
                {tank.SPBU && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">SPBU:</span> {tank.SPBU.name} <span className="opacity-70">({tank.SPBU.code})</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TankVisualization;