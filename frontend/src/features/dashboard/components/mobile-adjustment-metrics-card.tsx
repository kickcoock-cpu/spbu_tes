import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel } from 'lucide-react';

interface MobileAdjustmentMetricsCardProps {
  adjustmentMetrics: {
    totalAdjustments: number;
    totalGain: number;
    totalLoss: number;
    netValue: number;
  };
}

export const MobileAdjustmentMetricsCard: React.FC<MobileAdjustmentMetricsCardProps> = ({ adjustmentMetrics }) => {
  const { totalAdjustments, totalGain, totalLoss, netValue } = adjustmentMetrics;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-blue-500" />
          Adjustment Metrics
        </CardTitle>
        <CardDescription>
          Fuel gain and loss from adjustments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-blue-50">
            <div className="text-lg font-bold text-blue-600">{totalAdjustments}</div>
            <div className="text-xs text-muted-foreground mt-1">Adjustments</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50">
            <div className="text-lg font-bold text-green-600">
              {totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L
            </div>
            <div className="text-xs text-muted-foreground mt-1">Gain</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50">
            <div className="text-lg font-bold text-red-600">
              {totalLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L
            </div>
            <div className="text-xs text-muted-foreground mt-1">Loss</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50">
            <div className="text-lg font-bold text-purple-600">
              {netValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L
            </div>
            <div className="text-xs text-muted-foreground mt-1">Net</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};