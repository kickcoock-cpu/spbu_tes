import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Fuel, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

interface CriticalStockAlertProps {
  fuelType: string;
  currentStock: number;
  tankCapacity: number;
  avgDailyConsumption: number;
  consumptionTrend: string;
  confidenceLevel: string;
  daysUntilStockout: number;
  predictedStockoutDate: string;
}

export const CriticalStockAlert: React.FC<CriticalStockAlertProps> = ({
  fuelType,
  currentStock,
  tankCapacity,
  avgDailyConsumption,
  consumptionTrend,
  confidenceLevel,
  daysUntilStockout,
  predictedStockoutDate
}) => {
  const navigate = useNavigate();
  
  const getAlertLevel = () => {
    if (daysUntilStockout <= 1) return 'critical';
    if (daysUntilStockout <= 3) return 'high';
    return 'medium';
  };
  
  const getAlertColor = () => {
    const level = getAlertLevel();
    switch (level) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-red-500 text-white';
    }
  };
  
  const getStatusBg = () => {
    const level = getAlertLevel();
    switch (level) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-red-500 bg-red-50';
    }
  };
  
  const getStatusColor = () => {
    const level = getAlertLevel();
    switch (level) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };
  
  const getTrendIcon = () => {
    switch (consumptionTrend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getConfidenceColor = () => {
    switch (confidenceLevel) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const fillPercentage = (currentStock / tankCapacity) * 100;
  
  return (
    <div className={`p-4 rounded-lg border-l-4 ${getStatusBg()}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${getAlertColor()}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{fuelType}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Stock level critically low
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Fuel className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{currentStock.toLocaleString()} L</span>
                <span className="text-xs text-muted-foreground">({fillPercentage.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{daysUntilStockout} days</span>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className="text-sm capitalize">{consumptionTrend}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Est. stockout: {formatDate(predictedStockoutDate)}
            </p>
            <p className={`text-xs mt-1 ${getConfidenceColor()}`}>
              Confidence: {confidenceLevel}
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => navigate({ to: '/deliveries' })}
        >
          Order Now
        </Button>
      </div>
    </div>
  );
};