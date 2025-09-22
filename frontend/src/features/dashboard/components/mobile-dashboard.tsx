import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Fuel, 
  Droplets, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { TankStatusCard } from './tank-status-card';
import { MobileTankStatusCard } from './mobile-tank-status-card';
import { StatCard } from './summary-stats';
import { StockPredictionChart } from './stock-prediction-chart';
import { RecentActivity } from './recent-activity';
import { MobileAdjustmentMetricsCard } from './mobile-adjustment-metrics-card';

interface MobileDashboardProps {
  dashboardData: {
    totalLiters: number;
    stockPredictions: Array<{
      fuelType: string;
      currentStock: number;
      tankCapacity: number;
      avgDailyConsumption: number;
      avgTransactionsPerDay: number;
      consumptionTrend: string;
      confidenceLevel: string;
      predictedStockoutDate: string;
      daysUntilStockout: number;
    }>;
    tankStocks: Array<{
      id: number;
      name: string;
      fuelType: string;
      capacity: number;
      currentStock: number;
      percentage: number;
    }>;
    recentSales: Array<{
      id: number;
      transactionId?: string;
      operatorName: string;
      totalAmount: number;
      litersSold: number;
      createdAt: string;
    }>;
    recentDeliveries: Array<{
      id: number;
      supplier: string;
      fuelType: string;
      liters: number;
      status: string;
      createdAt: string;
    }>;
    adjustmentMetrics: {
      totalAdjustments: number;
      totalGain: number;
      totalLoss: number;
      netValue: number;
    };
  };
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  dashboardData,
  isLoading,
  isError,
  refetch
}) => {
  console.log('=== MOBILE DASHBOARD PROPS ===');
  console.log('Dashboard data:', dashboardData);
  console.log('Adjustment metrics:', dashboardData?.adjustmentMetrics);
  console.log('=== END MOBILE DASHBOARD PROPS ===');
  
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    criticalAlerts: true,
    tankStatus: true,
    predictions: true,
    recentActivity: true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    refetch();
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Dashboard</div>
          <div className="text-gray-600 mb-4">Failed to load dashboard data. Please try again later.</div>
          <Button onClick={refetch}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Get critical stocks (tanks with Critical status - percentage < 20)
  const criticalStocks = dashboardData?.tankStocks?.filter(tank => tank.percentage < 20) || [];

  // Get pending deliveries
  const pendingDeliveries = dashboardData?.recentDeliveries?.filter(
    delivery => delivery.status === 'pending'
  ).length || 0;

  // Summary stats for mobile
  const stats = [
    {
      title: 'Total Liters',
      value: (dashboardData?.totalLiters || 0).toLocaleString(),
      description: 'Liters sold today',
      icon: <DollarSign className="h-4 w-4" />,
      color: 'green',
      trend: { value: 12, isUp: true }
    },
    {
      title: 'Critical Stocks',
      value: criticalStocks.length,
      description: 'Stocks running low',
      icon: <Fuel className="h-4 w-4" />,
      color: 'red',
      trend: { value: 3, isUp: false }
    },
    {
      title: 'Active Tanks',
      value: dashboardData?.tankStocks?.length || 0,
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
      value: `${(dashboardData?.adjustmentMetrics?.totalGain || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`,
      description: 'Fuel gained',
      icon: <Fuel className="h-4 w-4" />,
      color: 'green',
      trend: { value: 5, isUp: true }
    },
    {
      title: 'Total Loss',
      value: `${(dashboardData?.adjustmentMetrics?.totalLoss || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`,
      description: 'Fuel lost',
      icon: <Fuel className="h-4 w-4" />,
      color: 'red',
      trend: { value: 2, isUp: false }
    }
  ];

  return (
    <div className="space-y-4 pb-4">
      {/* Pull to Refresh Indicator */}
      <div className="flex justify-center pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Pull to Refresh'}
        </Button>
      </div>

      {/* Summary Stats - 2 columns */}
      <div className="grid grid-cols-2 gap-4">
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

      {/* Critical Stock Alerts */}
      <Card>
        <CardHeader 
          className="cursor-pointer pb-2"
          onClick={() => toggleSection('criticalAlerts')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg">Critical Alerts</CardTitle>
            </div>
            {expandedSections.criticalAlerts ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </div>
          <CardDescription>
            Immediate attention required
          </CardDescription>
        </CardHeader>
        
        {expandedSections.criticalAlerts && (
          <CardContent className="pt-2">
            {criticalStocks.length > 0 ? (
              <div className="space-y-3">
                {criticalStocks.map((tank) => (
                  <div key={tank.id} className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{tank.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Fuel className="h-4 w-4 text-red-500" />
                          <p className="text-sm text-muted-foreground">
                            {tank.currentStock.toLocaleString()}L ({tank.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-9 text-sm ml-2 flex-shrink-0"
                        onClick={() => navigate({ to: '/deliveries' })}
                      >
                        Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-center mb-3">
                  <AlertTriangle className="h-10 w-10 text-green-500" />
                </div>
                <p className="text-green-700 font-medium text-lg">All stocks are healthy</p>
                <p className="text-green-600 text-sm mt-1">
                  No critical stock alerts at this time
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Tank Status */}
      <Card>
        <CardHeader 
          className="cursor-pointer pb-2"
          onClick={() => toggleSection('tankStatus')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              <CardTitle className="text-lg">Tank Status</CardTitle>
            </div>
            {expandedSections.tankStatus ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </div>
          <CardDescription>
            Real-time fuel levels
          </CardDescription>
        </CardHeader>
        
        {expandedSections.tankStatus && (
          <CardContent className="pt-2">
            {dashboardData?.tankStocks?.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {dashboardData.tankStocks.map((tank) => (
                  <MobileTankStatusCard
                    key={tank.id}
                    name={tank.name}
                    fuelType={tank.fuelType}
                    currentStock={tank.currentStock}
                    capacity={tank.capacity}
                    percentage={tank.percentage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No tanks found</div>
                <div className="text-sm text-gray-500">
                  Add tanks to monitor fuel levels
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Adjustment Metrics */}
      <MobileAdjustmentMetricsCard 
        adjustmentMetrics={dashboardData?.adjustmentMetrics || { totalAdjustments: 0, totalGain: 0, totalLoss: 0, netValue: 0 }}
      />

      {/* Stock Prediction Chart */}
      <Card>
        <CardHeader 
          className="cursor-pointer pb-2"
          onClick={() => toggleSection('predictions')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-lg">Stock Predictions</CardTitle>
            </div>
            {expandedSections.predictions ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </div>
          <CardDescription>
            Forecasted stock levels
          </CardDescription>
        </CardHeader>
        
        {expandedSections.predictions && (
          <CardContent className="pt-3">
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Prediction Legend</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">Critical (&lt;5 days)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs">Low (5-10 days)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Normal (&gt;10 days)</span>
                </div>
              </div>
            </div>
            <StockPredictionChart 
              data={(dashboardData?.stockPredictions || []).map(stock => {
                const days = Number(stock.daysUntilStockout);
                const isCritical = !isNaN(days) && days <= 5;
                return {
                  ...stock,
                  isCritical
                };
              })}
            />
          </CardContent>
        )}
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader 
          className="cursor-pointer pb-2"
          onClick={() => toggleSection('recentActivity')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </div>
            {expandedSections.recentActivity ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </div>
          <CardDescription>
            Latest sales and deliveries
          </CardDescription>
        </CardHeader>
        
        {expandedSections.recentActivity && (
          <CardContent className="pt-2">
            <RecentActivity 
              sales={dashboardData?.recentSales || []}
              deliveries={dashboardData?.recentDeliveries || []}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
};