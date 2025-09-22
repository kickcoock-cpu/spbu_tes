import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import { 
  TruckIcon, 
  DownloadIcon, 
  FuelIcon, 
  CheckCircleIcon, 
  ClockIcon,
  XCircleIcon
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { apiClient } from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileDeliveriesReport } from './components/mobile-deliveries-report'

// Types
interface DeliveriesReportItem {
  id: number
  date: string
  spbu: string
  supplier: string
  fuelType: string
  planned_liters: number
  actual_liters: number | null
  harga_beli: number | null
  status: string
  confirmedBy: string
  approvedBy: string
  totalHargaBeli: number
  pricePerLiter: number
}

interface DeliveriesReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: DeliveriesReportItem[]
}

// API functions
const fetchDeliveriesReport = async (params: any = {}): Promise<DeliveriesReportData> => {
  try {
    const response = await apiClient.get('/api/reports/deliveries', { params })
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching deliveries report:', error)
    throw error
  }
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
};

const DeliveriesReportPage = () => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { user } = useAuthStore().auth
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filterType, setFilterType] = useState('all')
  
  // Check if user has access to reports
  const userHasAccess = user ? hasAccess(user, 'reports') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'reports') : false
  
  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])
  
  // Fetch data
  const { data: reportData, isLoading, isError, refetch } = useQuery({
    queryKey: ['deliveries-report', dateRange, filterType],
    queryFn: () => fetchDeliveriesReport({ 
      startDate: dateRange.start, 
      endDate: dateRange.end, 
      filter: filterType 
    }),
    enabled: userHasAccess
  })
  
  // Calculate summary statistics
  const calculateSummary = () => {
    if (!reportData?.data) return { 
      totalDeliveries: 0, 
      totalPlanned: 0, 
      totalActual: 0, 
      pendingCount: 0, 
      doneCount: 0
    }
    
    const totalDeliveries = reportData.data.length
    const totalPlanned = reportData.data.reduce((sum, item) => sum + (item.planned_liters || 0), 0)
    const totalActual = reportData.data.reduce((sum, item) => sum + (item.actual_liters || 0), 0)
    
    const statusCounts = reportData.data.reduce((counts, item) => {
      const status = item.status.toLowerCase()
      counts[status] = (counts[status] || 0) + 1
      return counts
    }, { pending: 0, confirmed: 0, approved: 0 })
    
    // "Done" includes both confirmed and approved deliveries
    const doneCount = statusCounts.confirmed + statusCounts.approved
    
    return {
      totalDeliveries,
      totalPlanned,
      totalActual,
      pendingCount: statusCounts.pending,
      doneCount
    }
  }
  
  const { 
    totalDeliveries, 
    totalPlanned, 
    totalActual, 
    pendingCount, 
    doneCount
  } = calculateSummary()
  
  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }
  
  // Mobile view
  if (isMobile) {
    return (
      <MobileDeliveriesReport
        reportData={reportData || { reportType: 'deliveries', generatedAt: new Date().toISOString(), data: [] }}
        spbuOptions={[]}
        selectedSpbu=""
        dateRange={{ from: dateRange.start, to: dateRange.end }}
        onSpbuChange={() => {}}
        onDateChange={(field, value) => {
          if (field === 'from') {
            setDateRange(prev => ({ ...prev, start: value }))
          } else {
            setDateRange(prev => ({ ...prev, end: value }))
          }
        }}
        onGenerateReport={() => refetch()}
        onExportReport={() => toast.info('Export functionality would be implemented here')}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
      />
    )
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading deliveries report...</span>
      </div>
    )
  }
  
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Report</div>
          <div className="text-gray-600 mb-4">Failed to load deliveries report data. Please try again later.</div>
          <Button onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <TruckIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Deliveries Report</h1>
            <p className="text-muted-foreground">
              Detailed report of fuel deliveries
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('Export functionality would be implemented here')}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-md border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Deliveries</CardTitle>
              <div className="bg-blue-100 p-2 rounded-full">
                <TruckIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-1">
            <div className="text-2xl font-bold">{totalDeliveries.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Delivery transactions</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Quantity</CardTitle>
              <div className="bg-green-100 p-2 rounded-full">
                <FuelIcon className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-1">
            <div className="text-2xl font-bold">{totalPlanned.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</div>
            <p className="text-xs text-muted-foreground mt-1">Planned quantity</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Delivered</CardTitle>
              <div className="bg-purple-100 p-2 rounded-full">
                <FuelIcon className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-1">
            <div className="text-2xl font-bold">{totalActual.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</div>
            <p className="text-xs text-muted-foreground mt-1">Actual delivered</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <div className="bg-yellow-100 p-2 rounded-full">
                <ClockIcon className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-1">
            <div className="text-2xl font-bold">{pendingCount.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Done</CardTitle>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-1">
            <div className="text-2xl font-bold">{doneCount.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed deliveries</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter the deliveries report by date range and status
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
                <SelectItem value="all">All Deliveries</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => refetch()}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Delivery Data</CardTitle>
          <CardDescription>
            Fuel deliveries for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>SPBU</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead className="text-right">Planned (L)</TableHead>
                <TableHead className="text-right">Actual (L)</TableHead>
                <TableHead className="text-right">Price/Liter</TableHead>
                <TableHead className="text-right">Harga Beli</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confirmed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData?.data && reportData.data.length > 0 ? (
                reportData.data.map((item: DeliveriesReportItem) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{item.spbu}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.fuelType}</TableCell>
                    <TableCell className="text-right">{(item.planned_liters || 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">{item.actual_liters !== null ? item.actual_liters.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : '-'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.pricePerLiter)}</TableCell>
                    <TableCell className="text-right">{item.harga_beli ? formatCurrency(item.harga_beli) : '-'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalHargaBeli)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status === 'confirmed' ? 'Done' : item.status}
                      </span>
                    </TableCell>
                    <TableCell>{item.confirmedBy || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <TruckIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-gray-400 mb-2">No delivery data found</div>
                      <div className="text-sm text-gray-500">
                        Try adjusting your filters or date range
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default DeliveriesReportPage