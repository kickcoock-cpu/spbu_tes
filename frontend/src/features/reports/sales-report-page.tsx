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
import { BarChart, Download, DollarSign, Fuel, Receipt, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { reportsApi, salesApi, userApi } from '@/lib/api'
import { MultiOperatorFilter } from './components/multi-operator-filter'
import { MobileSalesView } from './components/mobile-sales-view'
import { useIsMobile } from '@/hooks/use-mobile'

// Types
interface SalesReportItem {
  id: number
  transactionId?: string
  date: string
  spbu: string
  fuelType: string
  quantity: number
  amount: number
  operator: string
  pump_number?: number
}

interface SalesReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: SalesReportItem[]
}

interface Sale {
  id: number
  spbu_id: number
  operator_id: number
  pump_number: number
  fuel_type: string
  liters: number
  amount: number
  transaction_date: string
  created_at: string
  updated_at: string
  SPBU?: {
    name: string
    code: string
  }
  operator?: {
    name: string
    email: string
  }
}

// API functions
const fetchSalesReport = async (params: any = {}): Promise<SalesReportData> => {
  try {
    // Clean up params to remove empty values
    const cleanParams: any = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== undefined && params[key] !== null) {
        if (key === 'operators' && Array.isArray(params[key]) && params[key].length > 0) {
          // For operators array, join them with comma
          cleanParams['operator'] = params[key].join(',');
        } else {
          cleanParams[key] = params[key];
        }
      }
    });
    
    console.log('Fetching sales report with params:', cleanParams);
    const response = await reportsApi.getSalesReport(cleanParams);
    console.log('Sales report response:', response.data);
    // Log the structure of the response data
    if (response.data.data && response.data.data.data) {
      console.log('Response data structure:', {
        hasData: !!response.data.data.data,
        dataLength: response.data.data.data.length,
        firstItem: response.data.data.data[0],
        sampleData: response.data.data.data.slice(0, 3)
      });
    }
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching sales report:', error);
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

// Sales Chart Component
export const SalesChart = ({ data, formatCurrency }: { data: SalesReportItem[], formatCurrency: (amount: number) => string }) => {
  // Aggregate data by date for chart
  const aggregatedData = data.reduce((acc, item) => {
    const date = new Date(item.date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short'
    });
    
    if (!acc[date]) {
      acc[date] = { date, totalAmount: 0, totalQuantity: 0 };
    }
    
    acc[date].totalAmount += item.amount;
    acc[date].totalQuantity += item.quantity;
    
    return acc;
  }, {} as Record<string, { date: string; totalAmount: number; totalQuantity: number }>);
  
  const chartData = Object.values(aggregatedData);
  
  // Find max value for scaling
  const maxAmount = Math.max(...chartData.map(item => item.totalAmount), 1);
  
  return (
    <div className="h-full w-full">
      <div className="flex items-end justify-between gap-1 h-40 p-1">
        {chartData.slice(0, 8).map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 h-full">
            <div className="text-[8px] text-muted-foreground mb-1">
              {formatCurrency(item.totalAmount).replace('Rp', '')}
            </div>
            <div className="flex flex-col items-center justify-end h-full w-full">
              <div 
                className="w-full bg-gradient-to-t from-primary to-primary/80 rounded-t hover:from-primary/90 hover:to-primary/70 transition-all"
                style={{ 
                  height: `${(item.totalAmount / maxAmount) * 90}%` 
                }}
              />
            </div>
            <div className="text-[8px] text-muted-foreground mt-1 text-center truncate w-full">
              {item.date}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-xs text-muted-foreground mt-2">
        Daily Sales Trend (Last 8 Days)
      </div>
    </div>
  );
};

const SalesReportPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore().auth
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filterType, setFilterType] = useState('all')
  const [selectedOperators, setSelectedOperators] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Check if user has access to reports
  const userHasAccess = user ? hasAccess(user, 'reports') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'reports') : false
  
  // Check if user is Super Admin or Admin
  const isSuperAdminOrAdmin = user?.role.includes('Super Admin') || user?.role.includes('Admin');
  
  // Fetch operators for Super Admin and Admin roles
  const { data: operatorsData, isLoading: isOperatorsLoading } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      if (!isSuperAdminOrAdmin) return [];
      try {
        const response = await userApi.getOperators();
        // Filter operators based on user role
        let operators = response.data.data;
        if (user?.role.includes('Admin') && user?.spbu_id) {
          // Admin only sees operators from their SPBU
          operators = operators.filter((operator: any) => operator.spbu_id === user.spbu_id);
        }
        // Return usernames for filtering
        return operators.map((operator: any) => operator.username);
      } catch (error) {
        console.error('Error fetching operators:', error);
        return [];
      }
    },
    enabled: isSuperAdminOrAdmin && userHasAccess,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])
  
  // Fetch data
  const { data: reportData, isLoading, isError, refetch } = useQuery({
    queryKey: ['sales-report', dateRange, filterType, selectedOperators],
    queryFn: () => {
      const params = { 
        startDate: dateRange.start || undefined, 
        endDate: dateRange.end || undefined, 
        filter: filterType !== 'all' ? filterType : undefined,
        operators: selectedOperators.length > 0 ? selectedOperators : undefined
      };
      
      console.log('useQuery - fetch params:', params);
      return fetchSalesReport(params);
    },
    enabled: userHasAccess
  })
  
  // Log query results for debugging
  console.log('Sales report query result:', { reportData, isLoading, isError });
  console.log('User info:', user);
  
  // Log data structure
  if (reportData) {
    console.log('Report data structure:', {
      hasData: !!reportData.data,
      dataLength: reportData.data?.length,
      firstItem: reportData.data?.[0],
      sampleData: reportData.data?.slice(0, 3)
    });
  }
  
  // Log first few items for inspection
  if (reportData?.data && reportData.data.length > 0) {
    console.log('First 3 report items:', reportData.data.slice(0, 3));
  }
  
  // Calculate summary statistics
  const calculateSummary = () => {
    if (!reportData?.data) return { totalSales: 0, totalLiters: 0, totalAmount: 0 }
    
    // Filter data based on user role and selected operators
    const filteredData = reportData.data.filter(item => {
      // If user is an operator, only show their own sales
      if (user?.role.includes('Operator')) {
        console.log('Summary filter - item.operator:', item.operator, 'user:', user);
        
        // Check various possible user identifier fields
        const userUsername = user.username ? String(user.username).trim() : '';
        const userAccountNo = user.accountNo ? String(user.accountNo).trim() : '';
        const userName = user.name ? String(user.name).trim() : '';
        const itemOperator = item.operator ? String(item.operator).trim() : '';
        
        console.log('Values for comparison:', {
          itemOperator,
          userUsername,
          userAccountNo,
          userName
        });
        
        // Check if any of the user identifiers match the item operator
        const match = itemOperator === userUsername || 
                     itemOperator === userAccountNo || 
                     itemOperator === userName;
        
        console.log('Summary filter - Match result:', match);
        console.log('Match details:', {
          itemOperator,
          userUsername,
          userAccountNo,
          userName,
          usernameMatch: itemOperator === userUsername,
          accountNoMatch: itemOperator === userAccountNo,
          nameMatch: itemOperator === userName
        });
        
        return match;
      }
      // If user is not an operator, apply operator filter if set
      // For Super Admin and Admin, we've fetched usernames, so we need to make sure
      // we're comparing the right things. The report data contains operator names,
      // but we're filtering by usernames. We should rely on backend filtering for this.
      return true; // Let backend handle the filtering
    })
    
    const totalSales = filteredData.length
    const totalLiters = filteredData.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0)
    
    console.log('Summary calculation:', { totalSales, totalLiters, totalAmount, filteredDataLength: filteredData.length });
    
    return { totalSales, totalLiters, totalAmount }
  }
  
  const { totalSales, totalLiters, totalAmount } = calculateSummary()
  
  // Filter data for table and pagination
  const filteredData = reportData?.data 
    ? reportData.data.filter(item => {
        // If user is an operator, only show their own sales
        if (user?.role.includes('Operator')) {
          console.log('Desktop filter - item.operator:', item.operator, 'user:', user);
          
          // Check various possible user identifier fields
          const userUsername = user.username ? String(user.username).trim() : '';
          const userAccountNo = user.accountNo ? String(user.accountNo).trim() : '';
          const userName = user.name ? String(user.name).trim() : '';
          const itemOperator = item.operator ? String(item.operator).trim() : '';
          
          console.log('Values for comparison:', {
            itemOperator,
            userUsername,
            userAccountNo,
            userName
          });
          
          // Check if any of the user identifiers match the item operator
          const match = itemOperator === userUsername || 
                       itemOperator === userAccountNo || 
                       itemOperator === userName;
          
          console.log('Desktop filter - Match result:', match);
          console.log('Match details:', {
            itemOperator,
            userUsername,
            userAccountNo,
            userName,
            usernameMatch: itemOperator === userUsername,
            accountNoMatch: itemOperator === userAccountNo,
            nameMatch: itemOperator === userName
          });
          
          return match;
        }
        // For Super Admin and Admin, let backend handle the filtering
        // The report data is already filtered by the backend
        return true;
      })
    : []
  
  console.log('Filtered data for table:', { filteredData, dataLength: reportData?.data?.length || 0, selectedOperators });
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  
  // Get unique operators from report data or fetched operators
  const getUniqueOperators = () => {
    // For Super Admin and Admin, use fetched operators (usernames)
    if (isSuperAdminOrAdmin && operatorsData && operatorsData.length > 0) {
      return operatorsData;
    }
    
    // For other roles, get operators from report data
    if (!reportData?.data) return []
    return [...new Set(reportData.data.map(item => item.operator).filter(Boolean))]
  }
  
  const uniqueOperators = getUniqueOperators()
  
  // Check if user is an operator
  const isOperator = user?.role.includes('Operator')
  
  // Log user data for debugging
  console.log('SalesReportPage - user data:', user);
  
  // Check if device is mobile
  const isMobile = useIsMobile()
  
  // Log mobile detection
  console.log('Device detection - isMobile:', isMobile);
  
  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    console.log('User access check:', { user, userHasAccess });
    return null
  }
  
  if (isLoading || (isSuperAdminOrAdmin && isOperatorsLoading)) {
    console.log('Sales report loading:', { isLoading, isOperatorsLoading, isSuperAdminOrAdmin });
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading sales report...</span>
      </div>
    )
  }
  
  if (isError) {
    console.log('Sales report error:', isError);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Report</div>
          <div className="text-gray-600 mb-4">Failed to load sales report data. Please try again later.</div>
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
      uniqueOperators,
      operatorsData,
      isSuperAdminOrAdmin,
      isMobile
    });
    
    // Debug info
    if (reportData?.data) {
      console.log('Mobile view - reportData.data length:', reportData.data.length);
      console.log('Mobile view - first few items:', reportData.data.slice(0, 2));
    }
    
    return (
      <MobileSalesView
        reportData={reportData?.data || []}
        uniqueOperators={uniqueOperators}
        availableOperators={operatorsData || []}
        isSuperAdminOrAdmin={isSuperAdminOrAdmin}
        dateRange={dateRange}
        filterType={filterType}
        selectedOperators={selectedOperators}
        setDateRange={setDateRange}
        setFilterType={setFilterType}
        setSelectedOperators={setSelectedOperators}
        onApplyFilters={() => refetch()}
        onExport={() => toast.info('Export functionality would be implemented here')}
        formatCurrency={formatCurrency}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        totalSales={totalSales}
        totalLiters={totalLiters}
        totalAmount={totalAmount}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <BarChart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Sales Report</h1>
            <p className="text-muted-foreground">
              Detailed report of sales transactions
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
              <Receipt className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSales.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sales transactions
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-l-4 border-l-green-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
              <Fuel className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLiters.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fuel sold
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-l-4 border-l-purple-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Indonesian Rupiah
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
            Filter the sales report by date range, type, and operators
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
              <Label htmlFor="filter-type" className="text-xs">Filter By</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sales</SelectItem>
                  <SelectItem value="fuel">Fuel Sales</SelectItem>
                  <SelectItem value="non-fuel">Non-Fuel Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()} className="w-full h-9">
                Apply Filters
              </Button>
            </div>
          </div>
          <div className="mt-4">
            {!isOperator && (
              <>
                <Label className="text-xs flex items-center gap-1 mb-2">
                  <Users className="h-3 w-3" />
                  Operators
                </Label>
                <MultiOperatorFilter
                  operators={uniqueOperators}
                  selectedOperators={selectedOperators}
                  onOperatorChange={setSelectedOperators}
                  placeholder="Select Operators"
                />
              </>
            )}
            {isOperator && (
              <div className="text-sm text-muted-foreground py-2">
                Showing sales for operator: <span className="font-medium">{user?.name || user?.username || user?.accountNo}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Sales Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>
            Visualization of sales performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportData?.data && reportData.data.length > 0 ? (
            <div className="h-80">
              <SalesChart 
                data={reportData.data.filter(item => {
                  // If user is an operator, only show their own sales
                  if (user?.role.includes('Operator')) {
                    console.log('Chart filter - item.operator:', item.operator, 'user.username:', user.username, 'Match:', item.operator === user.username);
                    // Also log the types to ensure they are strings
                    console.log('Types - item.operator:', typeof item.operator, 'user.username:', typeof user.username);
                    return item.operator === user.username;
                  }
                  // If user is not an operator, apply operator filter if set
                  return selectedOperators.length === 0 || selectedOperators.includes(item.operator);
                })} 
                formatCurrency={formatCurrency}
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No data available for chart
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Sales Transactions Table */}
      <Card className="shadow-lg border rounded-lg">
        <CardHeader className="border-b bg-muted/30 rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Sales Transactions</CardTitle>
              <CardDescription>
                Detailed list of all sales transactions
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
                  <TableHead className="font-semibold w-1/6 py-3 px-4">Date & Time</TableHead>
                  <TableHead className="font-semibold w-1/6 py-3 px-4">Transaction ID</TableHead>
                  <TableHead className="font-semibold w-1/6 py-3 px-4">SPBU</TableHead>
                  <TableHead className="font-semibold w-1/6 py-3 px-4">Operator</TableHead>
                  <TableHead className="font-semibold w-1/6 py-3 px-4">Fuel Type</TableHead>
                  <TableHead className="font-semibold text-right w-1/6 py-3 px-4">Liters</TableHead>
                  <TableHead className="font-semibold text-right w-1/6 py-3 px-4">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData && filteredData.length > 0 ? (
                  [...filteredData]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
                          <div className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">
                            {item.transactionId || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="font-medium">{item.spbu}</div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="font-medium">{item.operator || 'N/A'}</div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="font-medium">{item.fuelType}</div>
                        </TableCell>
                        <TableCell className="text-right py-3 px-4">
                          <div className="font-medium">{item.quantity.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</div>
                          <div className="text-xs text-muted-foreground">Avg: {(item.amount / item.quantity).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/L</div>
                        </TableCell>
                        <TableCell className="text-right font-medium py-3 px-4">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-4xl mb-4">📊</div>
                        <div className="text-xl font-medium mb-2">No sales transactions found</div>
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

export default SalesReportPage