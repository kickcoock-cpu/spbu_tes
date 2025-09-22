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
import { FileText, Download, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { reportsApi, spbuApi } from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileAdjustmentReport } from './components/adjustment/mobile-adjustment-report'

// Types
interface AdjustmentReportItem {
  id: number
  date: string
  spbu: string
  operator: string
  type: string
  description: string
  status: string
  tank?: string
  adjustmentType?: string
  quantity?: number
  approvedBy?: string
  rejectedBy?: string
}

interface AdjustmentReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: AdjustmentReportItem[]
}

// API functions
const fetchAdjustmentReport = async (params: any = {}): Promise<AdjustmentReportData> => {
  try {
    // Clean up params to remove empty values
    const cleanParams: any = {}
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== undefined && params[key] !== null) {
        cleanParams[key] = params[key]
      }
    })
    
    console.log('Fetching adjustment report with params:', cleanParams)
    const response = await reportsApi.getAdjustmentReport(cleanParams)
    console.log('Adjustment report response:', response.data)
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching adjustment report:', error.response?.data || error.message || error)
    throw error
  }
}

const AdjustmentReportPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore().auth
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterSPBU, setFilterSPBU] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [spbuList, setSpbuList] = useState([])
  
  // Check if user has access to reports
  const userHasAccess = user ? hasAccess(user, 'reports') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'reports') : false
  const isSuperAdmin = user?.role.includes('Super Admin')
  
  // Fetch SPBU list for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      spbuApi.getAll()
        .then(response => {
          setSpbuList(response.data.data || [])
        })
        .catch(error => {
          console.error('Error fetching SPBU list:', error)
          toast.error('Failed to load SPBU list')
        })
    }
  }, [isSuperAdmin])
  
  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])
  
  // Fetch data
  const { data: reportData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['adjustment-report', dateRange, filterStatus, filterType, filterSPBU],
    queryFn: () => {
      const params = { 
        startDate: dateRange.start || undefined, 
        endDate: dateRange.end || undefined, 
        status: filterStatus !== 'all' ? filterStatus : undefined,
        type: filterType !== 'all' ? filterType : undefined,
        spbu: filterSPBU !== 'all' ? filterSPBU : undefined
      }
      
      console.log('useQuery - fetch params:', params)
      return fetchAdjustmentReport(params)
    },
    enabled: userHasAccess,
    retry: false, // Disable retry to see errors immediately
    onError: (err: any) => {
      console.error('Query error:', err)
      toast.error(`Failed to load adjustment report: ${err?.response?.data?.message || err?.message || 'Unknown error'}`)
    }
  })
  
  // Calculate summary statistics
  const calculateSummary = () => {
    if (!reportData?.data) return { totalAdjustments: 0, totalGain: 0, totalLoss: 0, totalValue: 0 }
    
    const totalAdjustments = reportData.data.length
    const totalGain = reportData.data
      .filter(item => item.adjustmentType === 'gain' && item.quantity)
      .reduce((sum, item) => sum + parseFloat(item.quantity), 0)
    const totalLoss = reportData.data
      .filter(item => item.adjustmentType === 'loss' && item.quantity)
      .reduce((sum, item) => sum + parseFloat(item.quantity), 0)
    const totalValue = totalGain - totalLoss
    
    return { totalAdjustments, totalGain, totalLoss, totalValue }
  }
  
  const { totalAdjustments, totalGain, totalLoss, totalValue } = calculateSummary()
  
  // Check if user is an operator
  const isOperator = user?.role.includes('Operator')
  
  // Check if device is mobile
  const isMobile = useIsMobile()
  
  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    console.log('User access check:', { user, userHasAccess })
    return null
  }
  
  if (isLoading) {
    console.log('Adjustment report loading:', { isLoading })
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading adjustment report...</span>
      </div>
    )
  }
  
  if (isError) {
    console.log('Adjustment report error:', isError, error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Report</div>
          <div className="text-gray-600 mb-4">
            {error?.response?.data?.message || error?.message || 'Failed to load adjustment report data. Please try again later.'}
          </div>
          <Button onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }
  
  // Filter data for table and pagination
  const filteredData = reportData?.data 
    ? reportData.data.filter(item => {
        // Apply status filter
        if (filterStatus !== 'all' && item.status !== filterStatus) return false
        
        // Apply type filter
        if (filterType !== 'all' && item.type !== filterType) return false
        
        return true
      })
    : []
  
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage)
  
  // Get paginated data
  const paginatedData = [...(filteredData || [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  
  // Render mobile view if on mobile device
  if (isMobile) {
    return (
      <MobileAdjustmentReport
        reportData={reportData?.data || []}
        dateRange={dateRange}
        filterStatus={filterStatus}
        filterType={filterType}
        filterSPBU={filterSPBU}
        setDateRange={setDateRange}
        setFilterStatus={setFilterStatus}
        setFilterType={setFilterType}
        setFilterSPBU={setFilterSPBU}
        onApplyFilters={() => refetch()}
        onExport={() => toast.info('Export functionality would be implemented here')}
        totalAdjustments={totalAdjustments}
        totalGain={totalGain}
        totalLoss={totalLoss}
        totalValue={totalValue}
        spbuList={spbuList}
        isSuperAdmin={isSuperAdmin}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-1.5">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Adjustment Report</h1>
            <p className="text-sm text-muted-foreground">
              Detailed report of adjustment requests
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-md border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Adjustments</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="text-2xl font-bold">{totalAdjustments.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Adjustment requests
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Gain</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="text-2xl font-bold">{totalGain.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fuel gained
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Loss</CardTitle>
              <FileText className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="text-2xl font-bold">{totalLoss.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fuel lost
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Net Value</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="text-2xl font-bold">{totalValue.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gain - Loss
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            <span className="text-xs font-normal text-muted-foreground">(Apply filters to refine your report)</span>
          </CardTitle>
          <CardDescription>
            Filter the adjustment report by date range, status, type, and SPBU
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-date" className="text-xs">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-date" className="text-xs">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-status" className="text-xs">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-type" className="text-xs">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isSuperAdmin && (
              <div className="space-y-1.5">
                <Label htmlFor="filter-spbu" className="text-xs">SPBU</Label>
                <Select value={filterSPBU} onValueChange={setFilterSPBU}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="SPBU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All SPBUs</SelectItem>
                    {spbuList.map((spbu: any) => (
                      <SelectItem key={spbu.id} value={spbu.id.toString()}>
                        {spbu.name} ({spbu.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-end">
              <Button onClick={() => refetch()} className="w-full h-9 text-sm">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Adjustment Table */}
      <Card className="shadow-lg border rounded-lg">
        <CardHeader className="border-b bg-muted/30 rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Adjustment Requests</CardTitle>
              <CardDescription>
                Detailed list of all adjustment requests
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="transition-colors hover:shadow-sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Show entries dropdown */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Show entries:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="h-7 w-16 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> entries
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted hover:bg-muted/80 transition-colors">
                <TableRow>
                  <TableHead className="font-medium text-xs w-1/6 py-2 px-3">Date</TableHead>
                  <TableHead className="font-medium text-xs w-1/6 py-2 px-3">SPBU</TableHead>
                  <TableHead className="font-medium text-xs w-1/6 py-2 px-3">Operator</TableHead>
                  <TableHead className="font-medium text-xs w-1/6 py-2 px-3">Type</TableHead>
                  <TableHead className="font-medium text-xs w-1/6 py-2 px-3">Status</TableHead>
                  <TableHead className="font-medium text-xs w-1/6 py-2 px-3 text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData && paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="hover:bg-muted/50 transition-colors border-b"
                    >
                      <TableCell className="font-medium py-2 px-3">
                        <div className="flex flex-col">
                          <span className="text-xs">{new Date(item.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.date).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="font-medium text-xs">{item.spbu}</div>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="font-medium text-xs">{item.operator || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="font-medium text-xs capitalize">{item.type}</div>
                        {item.tank && (
                          <div className="text-xs text-muted-foreground">
                            {item.tank}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'rejected' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-3 text-right">
                        {item.quantity ? (
                          <div className="font-medium text-xs">
                            {item.adjustmentType === 'gain' ? '+' : '-'}
                            {item.quantity.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-xs">-</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-4xl mb-4">📋</div>
                        <div className="text-lg font-medium mb-2">No adjustment requests found</div>
                        <div className="text-sm">Try adjusting your filters to see more results</div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-3 py-3 mt-2 border-t bg-muted/20 rounded-b gap-3">
              <div></div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 text-xs ${
                          pageNum === currentPage 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:shadow-sm'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdjustmentReportPage