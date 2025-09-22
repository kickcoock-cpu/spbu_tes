import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Gauge, Zap } from 'lucide-react';

interface MobileTankStatusCardProps {
  name: string;
  fuelType: string;
  currentStock: number;
  capacity: number;
  percentage: number;
}

export const MobileTankStatusCard: React.FC<MobileTankStatusCardProps> = ({
  name,
  fuelType,
  currentStock,
  capacity,
  percentage
}) => {
  // Get status text based on fill level
  const getStatusText = () => {
    if (percentage < 20) return 'Critical';
    if (percentage < 50) return 'Low';
    if (percentage < 80) return 'Normal';
    return 'Good';
  };

  // Get status color based on fill level
  const getStatusColor = () => {
    if (percentage < 20) return 'text-red-600 bg-red-100 border-red-200';
    if (percentage < 50) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (percentage < 80) return 'text-blue-600 bg-blue-100 border-blue-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };
  
  const getFuelIcon = () => {
    switch (fuelType) {
      case 'Premium': return '⛽';
      case 'Pertamax': return '⛽';
      case 'Pertalite': return '⛽';
      case 'Solar': return '🛢️';
      case 'Dexlite': return '🛢️';
      default: return '⛽';
    }
  };
  
  const getFuelColor = () => {
    switch (fuelType) {
      case 'Premium': return 'from-red-400 to-red-600';
      case 'Pertamax': return 'from-blue-400 to-blue-600';
      case 'Pertalite': return 'from-green-400 to-green-600';
      case 'Solar': return 'from-yellow-400 to-yellow-600';
      case 'Dexlite': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };
  
  // Mobile-optimized visualization
  const renderMobileVisualization = () => {
    return (
      <div className="relative h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100"></div>
        <div 
          className={`absolute bottom-0 w-full transition-all duration-1000 ease-out bg-gradient-to-t ${getFuelColor()}`}
          style={{ height: `${Math.min(100, Math.max(0, percentage))}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>
        <div className="absolute top-2 left-3 text-white font-bold text-sm">
          {currentStock.toLocaleString()}L
        </div>
        <div className="absolute bottom-2 right-3 text-white text-sm opacity-90">
          {percentage.toFixed(1)}%
        </div>
      </div>
    );
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow h-full border-2 border-transparent hover:border-blue-200">
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 min-w-0">
            <span className="text-xl flex-shrink-0">{getFuelIcon()}</span>
            <span className="truncate">{name}</span>
          </CardTitle>
          <span className={`text-xs px-2.5 py-1.5 rounded-full font-bold border whitespace-nowrap flex-shrink-0 ${getStatusColor()}`}>
            {getStatusText()} ({percentage.toFixed(1)}%)
          </span>
        </div>
        <CardDescription className="text-sm mt-2">
          {fuelType}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 pt-3">
        <div className="space-y-3">
          {/* Mobile tank visualization */}
          {renderMobileVisualization()}
          
          {/* Stats in a more compact format for mobile */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <Droplets className="text-gray-600" size={16} />
              <div>
                <div className="text-xs text-gray-500">Stock</div>
                <div className="font-bold text-base">
                  {currentStock.toLocaleString()} <span className="text-xs font-normal">L</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <Gauge className="text-gray-600" size={16} />
              <div>
                <div className="text-xs text-gray-500">Capacity</div>
                <div className="font-bold text-base">
                  {capacity.toLocaleString()} <span className="text-xs font-normal">L</span>
                </div>
              </div>
            </div>
            
            <div className="col-span-2 pt-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="text-gray-600" size={14} />
                  <span className="text-gray-700 font-medium text-sm">Fill Level</span>
                </div>
                <span className="text-sm font-bold">{percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getFuelColor()}`}
                  style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                >
                  {percentage > 30 && (
                    <div className="h-full w-full bg-gradient-to-r from-white/30 to-transparent"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};