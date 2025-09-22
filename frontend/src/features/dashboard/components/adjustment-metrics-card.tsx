import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel } from 'lucide-react';

interface AdjustmentMetricsCardProps {
  adjustmentMetrics: {
    totalAdjustments: number;
    totalGain: number;
    totalLoss: number;
    netValue: number;
  };
}

export const AdjustmentMetricsCard: React.FC<AdjustmentMetricsCardProps> = ({ adjustmentMetrics }) => {
  const { totalAdjustments, totalGain, totalLoss, netValue } = adjustmentMetrics;

  return (
    <Card className="col-span-1 md:col-span-2">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">{totalAdjustments}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Adjustments</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-green-50">
            <div className="text-2xl font-bold text-green-600">
              {totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total Gain</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-red-50">
            <div className="text-2xl font-bold text-red-600">
              {totalLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total Loss</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-purple-50">
            <div className="text-2xl font-bold text-purple-600">
              {netValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L
            </div>
            <div className="text-sm text-muted-foreground mt-1">Net Value</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};