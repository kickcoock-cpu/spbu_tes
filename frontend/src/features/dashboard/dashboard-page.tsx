import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { apiClient } from '@/lib/api'
import { webSocketService } from '@/lib/websocket'
import { DashboardOverview } from './components/dashboard-overview'
import { MobileDashboard } from './components/mobile-dashboard'

// Types
interface DashboardData {
  totalLiters: number
  totalSalesCount: number
  stockPredictions: StockPrediction[]
  tankStocks: TankStock[]
  recentSales: RecentSale[]
  recentDeliveries: RecentDelivery[]
  adjustmentMetrics: {
    totalAdjustments: number
    totalGain: number
    totalLoss: number
    netValue: number
  }
}

interface StockPrediction {
  fuelType: string
  currentStock: number
  tankCapacity: number
  avgDailyConsumption: number
  avgTransactionsPerDay: number
  consumptionTrend: string
  confidenceLevel: string
  predictedStockoutDate: string
  daysUntilStockout: number
}

interface TankStock {
  id: number
  name: string
  fuelType: string
  capacity: number
  currentStock: number
  percentage: number
}

interface RecentSale {
  id: number
  operatorName: string
  totalAmount: number
  litersSold: number
  fuel_type: string
  createdAt: string
}

interface RecentDelivery {
  id: number
  supplier: string
  fuelType: string
  liters: number
  status: string
  createdAt: string
}

// API functions
const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await apiClient.get('/api/dashboard')
  console.log('=== RAW API RESPONSE ===');
  console.log('Response data:', response.data);
  console.log('Dashboard data:', response.data.data);
  console.log('Stock predictions:', response.data.data.stockPredictions);
  console.log('Tank stocks:', response.data.data.tankStocks);
  console.log('Recent sales:', response.data.data.recentSales);
  console.log('Recent deliveries:', response.data.data.recentDeliveries);
  console.log('Adjustment metrics:', response.data.data.adjustmentMetrics);
  console.log('=== END RAW API RESPONSE ===');
  return response.data.data
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore().auth
  
  const userHasAccess = user ? hasAccess(user, 'dashboard') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'dashboard') : false
  const isReadOnly = !userHasFullAccess

  // Get user role
  const userRole = user?.role?.[0] || 'Operator'

  // State for real-time data
  const [realtimeData, setRealtimeData] = useState<DashboardData | null>(null)
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)

  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])

  // Initialize WebSocket connection
  useEffect(() => {
    if (userHasAccess) {
      // Connect to WebSocket
      webSocketService.connect()
      
      // Listen for connection status
      const handleConnect = () => setIsWebSocketConnected(true)
      const handleDisconnect = () => setIsWebSocketConnected(false)
      
      webSocketService['socket']?.on('connect', handleConnect)
      webSocketService['socket']?.on('disconnect', handleDisconnect)
      
      // Request initial data
      webSocketService.requestDashboardData()
      
      // Cleanup
      return () => {
        webSocketService['socket']?.off('connect', handleConnect)
        webSocketService['socket']?.off('disconnect', handleDisconnect)
        webSocketService.disconnect()
      }
    }
  }, [userHasAccess])

    // Fetch data with React Query (fallback for when WebSocket is not available)
  const { data: dashboardData, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    enabled: userHasAccess,
    refetchInterval: 30000, // Refetch every 30 seconds (fallback)
    staleTime: 10000 // Consider data stale after 10 seconds
  })

  // Listen for real-time dashboard updates
  useEffect(() => {
    const handleDashboardRefresh = () => {
      console.log('Received dashboard refresh request');
      // Instead of using the data directly, refetch to get filtered data
      refetch();
    }
    
    const handleDashboardError = (event: CustomEvent) => {
      console.error('Real-time dashboard error:', event.detail);
      toast.error('Failed to receive real-time dashboard updates');
    }
    
    window.addEventListener('dashboardDataRefresh', handleDashboardRefresh as EventListener);
    window.addEventListener('dashboardDataError', handleDashboardError as EventListener);
    
    return () => {
      window.removeEventListener('dashboardDataRefresh', handleDashboardRefresh as EventListener);
      window.removeEventListener('dashboardDataError', handleDashboardError as EventListener);
    }
  }, [refetch]);

  // Use real-time data if available, otherwise use React Query data
  const currentData = realtimeData || dashboardData

  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }

  // Log current data for debugging
  console.log('=== CURRENT DATA ===');
  console.log('Current data:', currentData);
  console.log('Adjustment metrics in current data:', currentData?.adjustmentMetrics);
  console.log('=== END CURRENT DATA ===');

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isWebSocketConnected ? (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-yellow-600">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Connecting...</span>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              webSocketService.requestDashboardData()
              refetch()
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Use mobile dashboard on small screens, desktop on larger screens */}
      <div className="md:hidden">
        <MobileDashboard
          dashboardData={currentData}
          isLoading={isLoading && !realtimeData}
          isError={isError && !realtimeData}
          refetch={refetch}
        />
      </div>
      <div className="hidden md:block">
        <DashboardOverview
          dashboardData={currentData}
          isLoading={isLoading && !realtimeData}
          isError={isError && !realtimeData}
          refetch={refetch}
        />
      </div>
    </div>
  )
}

export default DashboardPage