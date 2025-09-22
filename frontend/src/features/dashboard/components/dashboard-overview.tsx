import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Fuel, Droplets } from 'lucide-react';
import { TankStatusCard } from './tank-status-card';
import { SummaryStats } from './summary-stats';
import { StockPredictionChart } from './stock-prediction-chart';
import { RecentActivity } from './recent-activity';
import { AdjustmentMetricsCard } from './adjustment-metrics-card';
import { useNavigate } from '@tanstack/react-router';

interface DashboardOverviewProps {
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
      operatorName: string;
      totalAmount: number;
      litersSold: number;
      fuel_type: string;
      createdAt: string;
      spbu?: {
        name: string;
        code: string;
      };
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

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  dashboardData,
  isLoading,
  isError,
  refetch
}) => {
  console.log('=== DASHBOARD OVERVIEW ===');
  console.log('Dashboard data received:', dashboardData);
  console.log('Is loading:', isLoading);
  console.log('Is error:', isError);
  console.log('Dashboard data type:', typeof dashboardData);
  console.log('Dashboard data keys:', dashboardData ? Object.keys(dashboardData) : 'null/undefined');
  console.log('Tank stocks:', dashboardData?.tankStocks);
  console.log('Tank stocks type:', typeof dashboardData?.tankStocks);
  console.log('Tank stocks length:', dashboardData?.tankStocks?.length);
  console.log('Recent sales:', dashboardData?.recentSales);
  console.log('Recent deliveries:', dashboardData?.recentDeliveries);
  console.log('Adjustment metrics:', dashboardData?.adjustmentMetrics);
  console.log('=== END DASHBOARD OVERVIEW ===');
  
  const navigate = useNavigate();
  
  // Run direct test of filtering logic
  React.useEffect(() => {
    if (dashboardData?.stockPredictions) {
      console.log('=== RUNNING DIRECT FILTER TEST ===');
      const testData = dashboardData.stockPredictions;
      console.log('Test data:', testData);
      
      if (!testData || !Array.isArray(testData)) {
        console.log('Invalid test data: not an array');
        return;
      }
      
      console.log(`Processing ${testData.length} stock predictions for direct test`);
      
      let criticalCount = 0;
      testData.forEach((stock, index) => {
        // Skip if stock data is invalid
        if (!stock || typeof stock !== 'object') {
          console.log(`[${index}] Invalid stock data:`, stock);
          return;
        }
        
        console.log(`[${index}] --- Checking stock: ${stock.fuelType || 'Unknown'} ---`);
        console.log(`[${index}] Raw daysUntilStockout:`, stock.daysUntilStockout);
        console.log(`[${index}] Type of daysUntilStockout:`, typeof stock.daysUntilStockout);
        
        // Handle different data types that might come from the API
        let days;
        if (typeof stock.daysUntilStockout === 'string') {
          // Try to parse string to number
          days = parseFloat(stock.daysUntilStockout);
        } else if (typeof stock.daysUntilStockout === 'number') {
          // Already a number
          days = stock.daysUntilStockout;
        } else {
          // Convert to number (handles null, undefined, etc.)
          days = Number(stock.daysUntilStockout);
        }
        
        console.log(`[${index}] Converted days: ${days}`);
        console.log(`[${index}] Is NaN: ${isNaN(days)}`);
        console.log(`[${index}] Is Finite: ${isFinite(days)}`);
        
        // Additional check for edge cases
        if (isNaN(days) || !isFinite(days)) {
          console.log(`[${index}] Skipping due to invalid number`);
          return;
        }
        
        // Check if it's a valid number and less than or equal to 5
        const isCritical = days <= 5;
        console.log(`[${index}] Is Critical: ${isCritical} (days: ${days})`);
        
        if (isCritical) {
          criticalCount++;
        }
      });
      
      console.log(`Direct test critical stocks count: ${criticalCount}`);
      console.log('=== END DIRECT FILTER TEST ===');
    }
  }, [dashboardData?.stockPredictions]);
  // Get critical stocks (tanks with Critical status - percentage < 20)
  const criticalStocks = React.useMemo(() => {
    console.log('=== CRITICAL STOCKS BY TANK STATUS ===');
    console.log('Raw tank stocks data:', dashboardData?.tankStocks);
    
    // More comprehensive check
    if (!dashboardData) {
      console.log('No dashboard data available');
      return [];
    }
    
    if (!('tankStocks' in dashboardData)) {
      console.log('tankStocks property not found in dashboardData');
      return [];
    }
    
    const tankStocks = dashboardData.tankStocks;
    
    if (!tankStocks) {
      console.log('tankStocks is null or undefined');
      return [];
    }
    
    if (!Array.isArray(tankStocks)) {
      console.log('tankStocks is not an array, type:', typeof tankStocks);
      console.log('tankStocks value:', tankStocks);
      return [];
    }
    
    console.log(`Processing ${tankStocks.length} tank stocks`);
    
    // Filter tanks with Critical status (percentage < 20)
    const criticalTanks = tankStocks.filter(tank => {
      console.log(`--- Checking tank: ${tank.name} ---`);
      console.log(`  Fuel type: ${tank.fuelType}`);
      console.log(`  Current stock: ${tank.currentStock}`);
      console.log(`  Capacity: ${tank.capacity}`);
      console.log(`  Percentage: ${tank.percentage}`);
      console.log(`  Percentage type: ${typeof tank.percentage}`);
      
      // Check if percentage is valid
      if (typeof tank.percentage !== 'number' || isNaN(tank.percentage) || !isFinite(tank.percentage)) {
        console.log('  Invalid percentage, skipping');
        return false;
      }
      
      // Check if tank is Critical (percentage < 20)
      const isCritical = tank.percentage < 20;
      console.log(`  Is Critical: ${isCritical}`);
      
      return isCritical;
    }) || [];
    
    console.log(`Filtered critical tanks count: ${criticalTanks.length}`);
    console.log('Filtered critical tanks:', criticalTanks);
    console.log('=== END CRITICAL STOCKS BY TANK STATUS ===');
    
    return criticalTanks;
  }, [dashboardData]);
  
  // Get pending deliveries
  const pendingDeliveries = React.useMemo(() => {
    return dashboardData?.recentDeliveries?.filter(
      delivery => delivery.status === 'pending'
    ).length || 0;
  }, [dashboardData?.recentDeliveries]);
  
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
  
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {console.log('=== SUMMARY STATS PROPS ===') || 
       console.log('totalLiters:', dashboardData?.totalLiters || 0) || 
       console.log('criticalStocks.length:', criticalStocks?.length || 0) || 
       console.log('activeTanks:', dashboardData?.tankStocks?.length || 0) || 
       console.log('pendingDeliveries:', pendingDeliveries) || 
       console.log('=== END SUMMARY STATS PROPS ===') || null}
      <SummaryStats
        totalLiters={dashboardData?.totalLiters || 0}
        criticalStocks={criticalStocks?.length || 0}
        activeTanks={dashboardData?.tankStocks?.length || 0}
        pendingDeliveries={pendingDeliveries}
        adjustmentMetrics={dashboardData?.adjustmentMetrics || { totalAdjustments: 0, totalGain: 0, totalLoss: 0, netValue: 0 }}
      />
      
      {/* Critical Stock Alerts */}
      {(criticalStocks && criticalStocks.length > 0) ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Critical Stock Alerts
            </CardTitle>
            <CardDescription>
              Immediate attention required for these fuel types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalStocks.map((tank, index) => (
                <div key={index} className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-red-500 text-white">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{tank.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Stock level critically low
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Fuel className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{tank.currentStock.toLocaleString()} L</span>
                            <span className="text-xs text-muted-foreground">({tank.percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{tank.capacity.toLocaleString()} L</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Status: Critical (below 20% threshold)
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
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-green-500" />
              Critical Stock Alerts
            </CardTitle>
            <CardDescription>
              All fuel stocks are at healthy levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No critical stock alerts at this time.</p>
          </CardContent>
        </Card>
      )}
      
      {/* Stock Prediction Chart */}
      <StockPredictionChart 
        data={(dashboardData?.stockPredictions || []).map(stock => {
          // Ensure daysUntilStockout is a valid number for comparison
          const days = Number(stock.daysUntilStockout);
          const isCritical = !isNaN(days) && days <= 5;
          return {
            ...stock,
            isCritical
          };
        })}
      />
      
      {/* Tank Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Tank Status
          </CardTitle>
          <CardDescription>
            Real-time fuel levels in tanks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData?.tankStocks.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dashboardData.tankStocks.map((tank) => (
                <TankStatusCard
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
      </Card>
      
      {/* Adjustment Metrics */}
      <AdjustmentMetricsCard 
        adjustmentMetrics={dashboardData?.adjustmentMetrics || { totalAdjustments: 0, totalGain: 0, totalLoss: 0, netValue: 0 }}
      />
      
      {/* Recent Activity */}
      <RecentActivity 
        sales={dashboardData?.recentSales || []}
        deliveries={dashboardData?.recentDeliveries || []}
      />
    </div>
  );
};