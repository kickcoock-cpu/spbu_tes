import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Gauge, Zap } from 'lucide-react';

interface TankStatusCardProps {
  name: string;
  fuelType: string;
  currentStock: number;
  capacity: number;
  percentage: number;
}

export const TankStatusCard: React.FC<TankStatusCardProps> = ({
  name,
  fuelType,
  currentStock,
  capacity,
  percentage
}) => {
  // Get status text based on fill level (consistent with TankVisualization)
  const getStatusText = () => {
    if (percentage < 20) return 'Critical';
    if (percentage < 50) return 'Low';
    if (percentage < 80) return 'Normal';
    return 'Good';
  };

  // Get status color based on fill level (consistent with TankVisualization)
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
  
  // Simplified visualization for mobile
  const renderMobileVisualization = () => {
    return (
      <div className="relative h-20 rounded-lg overflow-hidden border">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100"></div>
        <div 
          className={`absolute bottom-0 w-full transition-all duration-1000 ease-out bg-gradient-to-t ${getFuelColor()}`}
          style={{ height: `${Math.min(100, Math.max(0, percentage))}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>
        <div className="absolute top-1 left-2 text-white font-bold text-xs">
          {currentStock.toLocaleString()}L
        </div>
        <div className="absolute bottom-1 right-2 text-white text-xs opacity-80">
          {percentage.toFixed(1)}%
        </div>
      </div>
    );
  };
  
  // Full visualization for desktop
  const renderDesktopVisualization = () => {
    return (
      <div className="relative h-28 rounded-lg overflow-hidden border">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100"></div>
        <div 
          className={`absolute bottom-0 w-full transition-all duration-1000 ease-out bg-gradient-to-t ${getFuelColor()}`}
          style={{ height: `${Math.min(100, Math.max(0, percentage))}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>
        <div className="absolute top-2 left-2 text-white font-bold">
          {currentStock.toLocaleString()}L
        </div>
        <div className="absolute bottom-2 right-2 text-white text-sm opacity-80">
          {percentage.toFixed(1)}%
        </div>
        
        {/* Measurement lines */}
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
    );
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 min-w-0">
            <span className="text-lg flex-shrink-0">{getFuelIcon()}</span>
            <span className="truncate">{name}</span>
          </CardTitle>
          <span className={`text-xs px-2 py-1 rounded-full font-bold border whitespace-nowrap flex-shrink-0 ${getStatusColor()}`}>
            {getStatusText()} ({percentage.toFixed(1)}%)
          </span>
        </div>
        <CardDescription className="text-xs mt-1">
          {fuelType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Responsive tank visualization */}
          <div className="sm:hidden">
            {renderMobileVisualization()}
          </div>
          <div className="hidden sm:block">
            {renderDesktopVisualization()}
          </div>
          
          {/* Stats */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Droplets className="text-gray-500" size={16} />
                <span className="text-gray-600 font-medium text-sm">Stock</span>
              </div>
              <span className="font-bold text-sm">
                {currentStock.toLocaleString()} <span className="text-xs font-normal text-gray-500">L</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Gauge className="text-gray-500" size={16} />
                <span className="text-gray-600 font-medium text-sm">Capacity</span>
              </div>
              <span className="font-semibold text-sm">
                {capacity.toLocaleString()} <span className="text-xs font-normal text-gray-500">L</span>
              </span>
            </div>
            
            <div className="pt-1">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <Zap className="text-gray-500" size={14} />
                  <span className="text-gray-600 font-medium text-sm">Fill Level</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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