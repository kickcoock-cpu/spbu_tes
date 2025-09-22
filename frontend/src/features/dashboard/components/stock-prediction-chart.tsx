import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StockPredictionChartProps {
  data: Array<{
    fuelType: string;
    currentStock: number;
    tankCapacity: number;
    avgDailyConsumption: number;
    consumptionTrend: string;
    confidenceLevel: string;
    daysUntilStockout: number;
    predictedStockoutDate: string;
    isCritical: boolean;
  }>;
}

export const StockPredictionChart: React.FC<StockPredictionChartProps> = ({ data }) => {
  const getColor = (isCritical: boolean, days: number) => {
    if (isCritical) return '#ef4444'; // red
    if (days <= 10) return '#f97316'; // orange
    if (days <= 20) return '#eab308'; // yellow
    return '#22c55e'; // green
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short'
    });
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.fuelType}</p>
          <p className="text-sm">Current Stock: {data.currentStock.toLocaleString()} L</p>
          <p className="text-sm">Tank Capacity: {data.tankCapacity.toLocaleString()} L</p>
          <p className="text-sm">Fill Level: {((data.currentStock / data.tankCapacity) * 100).toFixed(1)}%</p>
          <p className="text-sm">Avg Daily Consumption: {(data.avgDailyConsumption || 0).toFixed(2)} L</p>
          <p className="text-sm flex items-center">
            Consumption Trend: {getTrendIcon(data.consumptionTrend)}
            <span className="ml-1 capitalize">{data.consumptionTrend}</span>
          </p>
          <p className="text-sm">
            Days Until Stockout: 
            <span className={`font-semibold ${data.isCritical ? 'text-red-500' : 'text-green-500'}`}>
              {' '}{data.daysUntilStockout} days
            </span>
          </p>
          <p className="text-sm">Predicted Date: {formatDate(data.predictedStockoutDate)}</p>
          <p className="text-sm">Confidence: 
            <span className={`font-semibold ${getConfidenceColor(data.confidenceLevel)}`}>
              {' '}{data.confidenceLevel}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Mobile view for stock predictions
  const MobileStockPredictionView = () => (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">{item.fuelType}</h3>
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: getColor(item.isCritical, item.daysUntilStockout) }}
              ></div>
              <span className={`text-sm font-medium ${item.isCritical ? 'text-red-500' : ''}`}>
                {item.daysUntilStockout} days
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground">Current Stock</div>
              <div className="font-medium">{item.currentStock.toLocaleString()} L</div>
            </div>
            <div>
              <div className="text-muted-foreground">Tank Capacity</div>
              <div className="font-medium">{item.tankCapacity.toLocaleString()} L</div>
            </div>
            <div>
              <div className="text-muted-foreground">Daily Consumption</div>
              <div className="font-medium">{(item.avgDailyConsumption || 0).toFixed(2)} L</div>
            </div>
            <div>
              <div className="text-muted-foreground">Stockout Date</div>
              <div className="font-medium">{formatDate(item.predictedStockoutDate)}</div>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 pt-2 border-t">
            <div className="flex items-center">
              {getTrendIcon(item.consumptionTrend)}
              <span className="ml-1 capitalize text-sm">{item.consumptionTrend}</span>
            </div>
            <span className={`text-sm ${getConfidenceColor(item.confidenceLevel)}`}>
              {item.confidenceLevel} confidence
            </span>
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Predictions</CardTitle>
        <CardDescription>
          Predicted stockout dates for fuel types
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile view */}
        <div className="sm:hidden">
          <MobileStockPredictionView />
        </div>
        
        {/* Desktop view */}
        <div className="hidden sm:block">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="fuelType" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ 
                    value: 'Days', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="daysUntilStockout" name="Days Until Stockout">
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColor(entry.isCritical, entry.daysUntilStockout)} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Additional Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Consumption Trends</h3>
              <div className="space-y-2">
                {data.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{item.fuelType}</span>
                    <div className="flex items-center">
                      {getTrendIcon(item.consumptionTrend)}
                      <span className="ml-1 capitalize">{item.consumptionTrend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Prediction Confidence</h3>
              <div className="space-y-2">
                {data.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{item.fuelType}</span>
                    <span className={getConfidenceColor(item.confidenceLevel)}>
                      {item.confidenceLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Critical (&lt;5 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Low (5-10 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Medium (10-20 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Healthy (&gt;20 days)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};