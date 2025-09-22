import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Fuel, Truck, DollarSign, Droplets } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  color = 'blue'
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'red': return 'text-red-500 bg-red-100';
      case 'green': return 'text-green-500 bg-green-100';
      case 'yellow': return 'text-yellow-500 bg-yellow-100';
      case 'purple': return 'text-purple-500 bg-purple-100';
      default: return 'text-blue-500 bg-blue-100';
    }
  };
  
  return (
    <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full border-2 border-transparent hover:border-blue-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${getColorClasses()}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold truncate">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${trend.isUp ? '' : 'rotate-180'}`} />
            {trend.value}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SummaryStatsProps {
  totalLiters: number;
  criticalStocks: number;
  activeTanks: number;
  pendingDeliveries: number;
  adjustmentMetrics: {
    totalAdjustments: number;
    totalGain: number;
    totalLoss: number;
    netValue: number;
  };
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  totalLiters,
  criticalStocks,
  activeTanks,
  pendingDeliveries,
  adjustmentMetrics
}) => {
  console.log('=== SUMMARY STATS ===');
  console.log('Props received:', { totalLiters, criticalStocks, activeTanks, pendingDeliveries, adjustmentMetrics });
  console.log('Critical stocks type:', typeof criticalStocks, 'Value:', criticalStocks);
  console.log('=== END SUMMARY STATS ===');
  
  const stats = [
    {
      title: 'Total Liters',
      value: totalLiters.toLocaleString(),
      description: 'Liters sold today',
      icon: <DollarSign className="h-4 w-4" />,
      color: 'green',
      trend: { value: 12, isUp: true }
    },
    {
      title: 'Critical Stocks',
      value: criticalStocks,
      description: 'Stocks running low',
      icon: <Fuel className="h-4 w-4" />,
      color: 'red',
      trend: { value: 3, isUp: false }
    },
    {
      title: 'Active Tanks',
      value: activeTanks,
      description: 'Tanks monitored',
      icon: <Droplets className="h-4 w-4" />,
      color: 'blue',
      trend: { value: 0, isUp: true }
    },
    {
      title: 'Pending Deliveries',
      value: pendingDeliveries,
      description: 'Awaiting confirmation',
      icon: <Truck className="h-4 w-4" />,
      color: 'yellow',
      trend: { value: 8, isUp: true }
    },
    {
      title: 'Total Gain',
      value: `${adjustmentMetrics.totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`,
      description: 'Fuel gained from adjustments',
      icon: <Fuel className="h-4 w-4" />,
      color: 'green',
      trend: { value: 5, isUp: true }
    },
    {
      title: 'Total Loss',
      value: `${adjustmentMetrics.totalLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`,
      description: 'Fuel lost from adjustments',
      icon: <Fuel className="h-4 w-4" />,
      color: 'red',
      trend: { value: 2, isUp: false }
    }
  ];
  
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          color={stat.color as any}
          trend={stat.trend}
        />
      ))}
    </div>
  );
};