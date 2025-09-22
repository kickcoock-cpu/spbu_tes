import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { DownloadIcon, BarChartIcon, TruckIcon, LandmarkIcon, CalendarIcon, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { apiClient } from '@/lib/api'
import { ReportsVisualization } from './components/reports-visualization'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileAllReports } from './components/mobile-all-reports'

// Types
interface SalesReportItem {
  id: number
  date: string
  spbu: string
  fuelType: string
  quantity: number
  amount: number
  operator: string
}

interface DeliveriesReportItem {
  id: number
  date: string
  spbu: string
  supplier: string
  fuelType: string
  quantity: number
  status: string
  confirmedBy: string
  approvedBy: string
}

interface DepositsReportItem {
  id: number
  date: string
  spbu: string
  amount: number
  paymentMethod: string
  status: string
  operator: string
  approvedBy: string
  rejectedBy: string
}

interface AttendanceReportItem {
  id: number
  date: string
  spbu: string
  user: string
  checkIn: string
  checkOut: string
}

interface SalesReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: SalesReportItem[]
}

interface DeliveriesReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: DeliveriesReportItem[]
}

interface DepositsReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: DepositsReportItem[]
}

interface AttendanceReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: AttendanceReportItem[]
}

// API functions
const fetchSalesReport = async (params: any = {}): Promise<SalesReportData> => {
  try {
    const response = await apiClient.get('/api/reports/sales', { params })
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching sales report:', error)
    throw error
  }
}

const fetchDeliveriesReport = async (params: any = {}): Promise<DeliveriesReportData> => {
  try {
    const response = await apiClient.get('/api/reports/deliveries', { params })
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching deliveries report:', error)
    throw error
  }
}

const fetchDepositsReport = async (params: any = {}): Promise<DepositsReportData> => {
  try {
    const response = await apiClient.get('/api/reports/deposits', { params })
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching deposits report:', error)
    throw error
  }
}

const fetchAttendanceReport = async (params: any = {}): Promise<AttendanceReportData> => {
  try {
    const response = await apiClient.get('/api/reports/attendance', { params })
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching attendance report:', error)
    throw error
  }
}

const AllReportsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore().auth
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filterType, setFilterType] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')
  
  // Check if user has access to reports
  const userHasAccess = user ? hasAccess(user, 'reports') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'reports') : false
  const isMobile = useIsMobile()
  
  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])
  
  // Fetch all reports data
  const { 
    data: salesData, 
    isLoading: salesLoading, 
    isError: salesError,
    refetch: refetchSales
  } = useQuery({
    queryKey: ['sales-report', dateRange, filterType],
    queryFn: () => fetchSalesReport({ 
      startDate: dateRange.start, 
      endDate: dateRange.end, 
      filter: filterType 
    }),
    enabled: userHasAccess
  })
  
  const { 
    data: deliveriesData, 
    isLoading: deliveriesLoading, 
    isError: deliveriesError,
    refetch: refetchDeliveries
  } = useQuery({
    queryKey: ['deliveries-report', dateRange, filterType],
    queryFn: () => fetchDeliveriesReport({ 
      startDate: dateRange.start, 
      endDate: dateRange.end, 
      filter: filterType 
    }),
    enabled: userHasAccess
  })
  
  const { 
    data: depositsData, 
    isLoading: depositsLoading, 
    isError: depositsError,
    refetch: refetchDeposits
  } = useQuery({
    queryKey: ['deposits-report', dateRange, filterType],
    queryFn: () => fetchDepositsReport({ 
      startDate: dateRange.start, 
      endDate: dateRange.end, 
      filter: filterType 
    }),
    enabled: userHasAccess
  })
  
  const { 
    data: attendanceData, 
    isLoading: attendanceLoading, 
    isError: attendanceError,
    refetch: refetchAttendance
  } = useQuery({
    queryKey: ['attendance-report', dateRange, filterType],
    queryFn: () => fetchAttendanceReport({ 
      startDate: dateRange.start, 
      endDate: dateRange.end, 
      filter: filterType 
    }),
    enabled: userHasAccess
  })
  
  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }
  
  const isLoading = salesLoading || deliveriesLoading || depositsLoading || attendanceLoading
  const isError = salesError || deliveriesError || depositsError || attendanceError
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading reports...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Reports</div>
          <div className="text-gray-600 mb-4">Failed to load reports data. Please try again later.</div>
          <Button onClick={() => {
            refetchSales()
            refetchDeliveries()
            refetchDeposits()
            refetchAttendance()
          }}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
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
    return new Date(dateString).toLocaleDateString('id-ID')
  }
  
  const refetchAll = () => {
    refetchSales()
    refetchDeliveries()
    refetchDeposits()
    refetchAttendance()
  }
  
  // Mobile view
  if (isMobile) {
    return (
      <MobileAllReports
        salesData={salesData}
        deliveriesData={deliveriesData}
        depositsData={depositsData}
        attendanceData={attendanceData}
        dateRange={dateRange}
        filterType={filterType}
        isLoading={isLoading}
        isError={isError}
        onDateRangeChange={(field, value) => setDateRange(prev => ({ ...prev, [field]: value }))}
        onFilterTypeChange={setFilterType}
        onRefetchAll={refetchAll}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of all business metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter all reports by date range and type
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="filter-type">Filter By</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="recent">Recent Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={refetchAll}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sales</CardDescription>
            <CardTitle className="text-2xl">
              {salesData?.data ? salesData.data.length : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <BarChartIcon className="mr-1 h-4 w-4" />
              Transactions
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Deliveries</CardDescription>
            <CardTitle className="text-2xl">
              {deliveriesData?.data ? deliveriesData.data.length : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TruckIcon className="mr-1 h-4 w-4" />
              Shipments
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Deposits</CardDescription>
            <CardTitle className="text-2xl">
              {depositsData?.data ? depositsData.data.length : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <LandmarkIcon className="mr-1 h-4 w-4" />
              Transactions
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Attendance</CardDescription>
            <CardTitle className="text-2xl">
              {attendanceData?.data ? attendanceData.data.length : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-1 h-4 w-4" />
              Records
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Visualization</CardTitle>
            <CardDescription>
              Sales trends and distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsVisualization reportType="sales" data={salesData?.data || []} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Deliveries Visualization</CardTitle>
            <CardDescription>
              Delivery status and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsVisualization reportType="deliveries" data={deliveriesData?.data || []} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Deposits Visualization</CardTitle>
            <CardDescription>
              Deposit methods and amounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsVisualization reportType="deposits" data={depositsData?.data || []} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Attendance Visualization</CardTitle>
            <CardDescription>
              Attendance patterns and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsVisualization reportType="attendance" data={attendanceData?.data || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AllReportsPage