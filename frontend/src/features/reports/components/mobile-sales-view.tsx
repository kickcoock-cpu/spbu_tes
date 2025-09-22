import React from 'react'
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
  BarChartIcon, 
  DownloadIcon, 
  ChevronLeft, 
  ChevronRight, 
  FilterIcon,
  Receipt,
  Fuel,
  DollarSign,
  Users
} from 'lucide-react'
import { MultiOperatorFilter } from './multi-operator-filter'
import { useAuthStore } from '@/stores/auth-store'
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

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

interface MobileSalesViewProps {
  reportData: SalesReportItem[]
  uniqueOperators: string[]
  availableOperators: string[] // New prop for fetched operators
  isSuperAdminOrAdmin: boolean // New prop to identify user role
  dateRange: { start: string; end: string }
  filterType: string
  selectedOperators: string[]
  setDateRange: (range: { start: string; end: string }) => void
  setFilterType: (type: string) => void
  setSelectedOperators: (operators: string[]) => void
  onApplyFilters: () => void
  onExport: () => void
  formatCurrency: (amount: number) => string
  currentPage: number
  itemsPerPage: number
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  totalSales: number
  totalLiters: number
  totalAmount: number
}

export const MobileSalesView: React.FC<MobileSalesViewProps> = ({
  reportData,
  uniqueOperators,
  availableOperators,
  isSuperAdminOrAdmin,
  dateRange,
  filterType,
  selectedOperators,
  setDateRange,
  setFilterType,
  setSelectedOperators,
  onApplyFilters,
  onExport,
  formatCurrency,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  totalSales,
  totalLiters,
  totalAmount
}) => {
  const { user } = useAuthStore().auth
  const isOperator = user?.role.includes('Operator')
  
  // Log all props for debugging
  console.log('MobileSalesView props:', {
    reportDataLength: reportData?.length,
    reportDataSample: reportData?.slice(0, 2),
    uniqueOperators,
    availableOperators,
    isSuperAdminOrAdmin,
    isOperator,
    user
  });
  
  // Validate data structure
  if (reportData && reportData.length > 0) {
    const firstItem = reportData[0];
    console.log('First item structure:', {
      hasId: 'id' in firstItem,
      hasDate: 'date' in firstItem,
      hasSpbu: 'spbu' in firstItem,
      hasFuelType: 'fuelType' in firstItem,
      hasQuantity: 'quantity' in firstItem,
      hasAmount: 'amount' in firstItem,
      hasOperator: 'operator' in firstItem,
      item: firstItem
    });
    
    // Log the operator value specifically
    console.log('First item operator value:', firstItem.operator, 'Type:', typeof firstItem.operator);
  }
  
  // Log user data specifically
  console.log('User data:', user);
  if (user) {
    console.log('User username:', user.username, 'Type:', typeof user.username);
    console.log('User name:', user.name, 'Type:', typeof user.name);
    console.log('User accountNo:', user.accountNo, 'Type:', typeof user.accountNo);
  }
  
  // Use available operators for Super Admin and Admin, otherwise use unique operators from report data
  const operatorsToDisplay = isSuperAdminOrAdmin ? availableOperators : uniqueOperators;
  
  // Log data for debugging
  console.log('MobileSalesView - operatorsToDisplay:', operatorsToDisplay);
  
  // Filter data based on user role
  const filteredData = reportData.filter(item => {
    console.log('Filtering item:', item);
    if (isOperator) {
      // For operators, check if the item's operator matches the user's identifier
      console.log('Operator filter - item:', item, 'user:', user);
      console.log('Comparing item.operator:', item.operator, 'with user identifiers');
      
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
      
      console.log('Operator filter - Match result:', match);
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
    console.log('Non-operator filter - returning all items');
    return true;
  });
  
  // Log sample of filtered data for debugging
  console.log('MobileSalesView - filteredData sample:', filteredData.slice(0, 3));
  console.log('MobileSalesView - filteredData length:', filteredData.length);
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  // Paginate data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Log pagination info for debugging
  console.log('MobileSalesView - pagination info:', {
    filteredDataLength: filteredData.length,
    paginatedDataLength: paginatedData.length,
    currentPage,
    itemsPerPage,
    totalPages
  });
  console.log('MobileSalesView - paginatedData sample:', paginatedData.slice(0, 2));

  return (
    <div className="flex flex-col gap-4 pb-4 pt-1">
      {/* Header */}
      <div className="px-4">
        <h1 className="text-2xl font-bold">Sales Report</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Detailed sales transactions and revenue reports
        </p>
      </div>

      {/* Summary Cards */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="shadow-md border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
              <div className="bg-blue-100 p-2 rounded-full">
                <Receipt className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-1">
            <div className="text-2xl font-bold">{totalSales.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Sales transactions</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
              <div className="bg-green-100 p-2 rounded-full">
                <Fuel className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-1">
            <div className="text-2xl font-bold">{totalLiters.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</div>
            <p className="text-xs text-muted-foreground mt-1">Fuel sold</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="bg-purple-100 p-2 rounded-full">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-1">
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Indonesian Rupiah</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <div className="px-4">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <FilterIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription className="text-sm">
                  Refine your sales report
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="py-3 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="endDate" className="text-sm">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="py-3 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="filterType" className="text-sm">Filter By</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="py-3 text-sm">
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sales</SelectItem>
                    <SelectItem value="fuel">Fuel Sales</SelectItem>
                    <SelectItem value="non-fuel">Non-Fuel Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Only show operator filter for non-operators */}
              {!isOperator && (
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Operators</Label>
                  <MultiOperatorFilter
                    operators={operatorsToDisplay}
                    selectedOperators={selectedOperators}
                    onOperatorChange={setSelectedOperators}
                    placeholder="Select Operators"
                  />
                </div>
              )}

              {isOperator && (
                <div className="text-sm text-muted-foreground py-2 bg-muted/50 rounded-lg px-3">
                  Showing sales for operator: <span className="font-medium">{user?.name || user?.username || user?.accountNo || 'N/A'}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={onApplyFilters}
                  className="flex-1 py-3 text-sm"
                >
                  Apply Filters
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onExport}
                  className="flex-1 py-3 text-sm"
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Data Table */}
      <div className="px-4">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Sales Transactions</CardTitle>
                <CardDescription className="text-sm">
                  Detailed list of sales transactions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Show:</Label>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="h-9 w-20 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            
            {paginatedData.length > 0 ? (
              <div className="space-y-3">
                {paginatedData.map((item) => (
                  <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base">
                            {new Date(item.date).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(item.date).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <div className="font-bold text-lg">{formatCurrency(item.amount)}</div>
                          <div className="text-sm text-muted-foreground">
                            {(item.quantity || 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })} L
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {item.transactionId && (
                          <div className="flex items-center gap-2">
                            <div className="bg-muted p-1.5 rounded-full">
                              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className="truncate">
                              <span className="text-muted-foreground">ID: </span>
                              <span className="font-mono text-xs bg-muted/50 px-1.5 py-0.5 rounded">{item.transactionId}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="bg-muted p-1.5 rounded-full">
                            <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="truncate">
                            <span className="text-muted-foreground">Fuel: </span>
                            <span className="font-medium">{item.fuelType}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-muted p-1.5 rounded-full">
                            <BarChartIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="truncate">
                            <span className="text-muted-foreground">SPBU: </span>
                            <span className="font-medium">{item.spbu}</span>
                          </div>
                        </div>
                        {!isOperator && (
                          <div className="flex items-center gap-2">
                            <div className="bg-muted p-1.5 rounded-full">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className="truncate">
                              <span className="text-muted-foreground">Operator: </span>
                              <span className="font-medium">{item.operator || 'N/A'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChartIcon className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-base">
                  No sales data found
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-10 px-4 text-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1">Prev</span>
                  </Button>
                  
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
                          className={`mx-1 h-10 w-10 p-0 text-sm rounded-full ${pageNum === currentPage ? 'bg-primary text-primary-foreground' : ''}`}
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
                    className="h-10 px-4 text-sm"
                  >
                    <span className="mr-1">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}