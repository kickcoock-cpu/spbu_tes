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
import { BookOpen, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { reportsApi } from '@/lib/api'
import { MultiOperatorFilter } from './components/multi-operator-filter'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileLedgerView } from './components/mobile-ledger-report'

// Types
interface LedgerReportItem {
  id: number
  date: string
  spbu: string
  transactionType: string
  referenceId?: number
  referenceType?: string
  description: string
  debit: number
  credit: number
  balance: number
  createdBy: string
}

interface LedgerReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: LedgerReportItem[]
}

// API functions
const fetchLedgerReport = async (params: any = {}): Promise<LedgerReportData> => {
  try {
    // Clean up params to remove empty values
    const cleanParams: any = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== undefined && params[key] !== null) {
        cleanParams[key] = params[key];
      }
    });
    
    console.log('Fetching ledger report with params:', cleanParams);
    const response = await reportsApi.getLedgerReport(cleanParams);
    console.log('Ledger report response:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching ledger report:', error);
    throw error;
  }
};

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const LedgerReportPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore().auth
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filterType, setFilterType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Check if user has access to reports
  const userHasAccess = user ? hasAccess(user, 'reports') : false
  
  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])
  
  // Fetch data
  const { data: reportData, isLoading, isError, refetch } = useQuery({
    queryKey: ['ledger-report', dateRange, filterType],
    queryFn: () => {
      const params = { 
        startDate: dateRange.start || undefined, 
        endDate: dateRange.end || undefined, 
        transactionType: filterType !== 'all' ? filterType : undefined
      };
      
      console.log('useQuery - fetch params:', params);
      return fetchLedgerReport(params);
    },
    enabled: userHasAccess
  })
  
  // Calculate summary statistics
  const calculateSummary = () => {
    if (!reportData?.data) return { totalDebit: 0, totalCredit: 0, finalBalance: 0 }
    
    const totalDebit = reportData.data.reduce((sum, item) => sum + item.debit, 0)
    const totalCredit = reportData.data.reduce((sum, item) => sum + item.credit, 0)
    // Menggunakan rumus yang benar: credit - debit = final balance
    const finalBalance = totalCredit - totalDebit
    
    return { totalDebit, totalCredit, finalBalance }
  }
  
  const { totalDebit, totalCredit, finalBalance } = calculateSummary()
  
  // Filter data for table and pagination
  const filteredData = reportData?.data || []
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  
  // Check if device is mobile
  const isMobile = useIsMobile()
  
  // Log mobile detection
  console.log('Device detection - isMobile:', isMobile);
  
  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    console.log('User access check:', { user, userHasAccess });
    return null
  }
  
  if (isLoading) {
    console.log('Ledger report loading:', { isLoading });
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading ledger report...</span>
      </div>
    )
  }
  
  if (isError) {
    console.log('Ledger report error:', isError);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Report</div>
          <div className="text-gray-600 mb-4">Failed to load ledger report data. Please try again later.</div>
          <Button onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }
  
  // Render mobile view if on mobile device
  if (isMobile) {
    console.log('Rendering mobile view with data:', {
      reportData: reportData?.data,
      isMobile
    });
    
    return (
      <MobileLedgerView
        reportData={reportData?.data || []}
        dateRange={dateRange}
        filterType={filterType}
        setDateRange={setDateRange}
        setFilterType={setFilterType}
        onApplyFilters={() => refetch()}
        onExport={() => toast.info('Export functionality would be implemented here')}
        formatCurrency={formatCurrency}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        totalDebit={totalDebit}
        totalCredit={totalCredit}
        finalBalance={finalBalance}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ledger Report</h1>
            <p className="text-muted-foreground">
              Detailed financial ledger report
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-lg border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Debit</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{formatCurrency(totalDebit)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total debits
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-l-4 border-l-green-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{formatCurrency(totalCredit)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total credits
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-l-4 border-l-purple-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Final Balance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${finalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(finalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current balance
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Filters</span>
            <span className="text-xs font-normal text-muted-foreground">(Apply filters to refine your report)</span>
          </CardTitle>
          <CardDescription>
            Filter the ledger report by date range and transaction type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-xs">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-xs">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-type" className="text-xs">Transaction Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="delivery">Deliveries</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="adjustment">Adjustments</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()} className="w-full h-9">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Ledger Transactions Table */}
      <Card className="shadow-lg border rounded-lg">
        <CardHeader className="border-b bg-muted/30 rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Ledger Transactions</CardTitle>
              <CardDescription>
                Detailed list of all financial transactions
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
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show entries:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> entries
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted hover:bg-muted/80 transition-colors">
                <TableRow>
                  <TableHead className="font-semibold w-1/12 py-3 px-4">Date</TableHead>
                  <TableHead className="font-semibold w-2/12 py-3 px-4">SPBU</TableHead>
                  <TableHead className="font-semibold w-1/12 py-3 px-4">Type</TableHead>
                  <TableHead className="font-semibold w-3/12 py-3 px-4">Description</TableHead>
                  <TableHead className="font-semibold text-right w-1/12 py-3 px-4">Debit</TableHead>
                  <TableHead className="font-semibold text-right w-1/12 py-3 px-4">Credit</TableHead>
                  <TableHead className="font-semibold text-right w-1/12 py-3 px-4">Balance</TableHead>
                  <TableHead className="font-semibold w-2/12 py-3 px-4">Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData && filteredData.length > 0 ? (
                  [...filteredData]
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item) => (
                      <TableRow 
                        key={item.id} 
                        className="hover:bg-muted/50 transition-colors border-b"
                      >
                        <TableCell className="font-medium py-3 px-4">
                          <div className="flex flex-col">
                            <span>{new Date(item.date).toLocaleDateString('id-ID', {
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
                        <TableCell className="py-3 px-4">
                          <div className="font-medium">{item.spbu}</div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="font-medium capitalize">{item.transactionType}</div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="font-medium">{item.description}</div>
                          {item.referenceId && (
                            <div className="text-xs text-muted-foreground">
                              Ref: {item.referenceType} #{item.referenceId}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-3 px-4">
                          <div className={`font-medium ${item.debit > 0 ? 'text-red-500' : ''}`}>
                            {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-3 px-4">
                          <div className={`font-medium ${item.credit > 0 ? 'text-green-500' : ''}`}>
                            {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium py-3 px-4">
                          <div className={item.balance >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {formatCurrency(item.balance)}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="font-medium">{item.createdBy}</div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-4xl mb-4">📚</div>
                        <div className="text-xl font-medium mb-2">No ledger transactions found</div>
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
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 mt-2 border-t bg-muted/20 rounded-b-lg gap-4">
              <div></div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="transition-colors hover:shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
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
                        className={`mx-0.5 transition-colors ${pageNum === currentPage ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:shadow-sm'}`}
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
                  className="transition-colors hover:shadow-sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LedgerReportPage