import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { BarChartIcon, DownloadIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { MultiOperatorFilter } from './multi-operator-filter'
import { useAuthStore } from '@/stores/auth-store'

interface SalesReportItem {
  id: number
  date: string
  spbu: string
  fuelType: string
  quantity: number
  amount: number
  operator: string
}

interface SalesReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: SalesReportItem[]
}

interface MobileSalesReportProps {
  reportData: SalesReportData
  spbuOptions: Array<{ id: number; name: string; code: string }>
  selectedSpbu: string
  dateRange: { from: string; to: string }
  operatorFilter: string
  onSpbuChange: (value: string) => void
  onDateChange: (field: string, value: string) => void
  onOperatorChange: (value: string) => void
  onGenerateReport: () => void
  onExportReport: () => void
  isLoading: boolean
  isError: boolean
  refetch: () => void
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string) => string
}

export const MobileSalesReport: React.FC<MobileSalesReportProps> = ({
  reportData,
  spbuOptions,
  selectedSpbu,
  dateRange,
  operatorFilter,
  onSpbuChange,
  onDateChange,
  onOperatorChange,
  onGenerateReport,
  onExportReport,
  isLoading,
  isError,
  refetch,
  formatCurrency,
  formatDate
}) => {
  const { user } = useAuthStore().auth
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Check if user is an operator
  const isOperator = user?.role.includes('Operator')
  
  // Filter data based on user role
  const filteredData = reportData.data ? 
    reportData.data.filter(item => {
      // If user is an operator, only show their own sales
      if (isOperator) {
        return item.operator === user.accountNo
      }
      // If user is not an operator, apply operator filter if set
      return operatorFilter ? item.operator === operatorFilter : true
    }) : []
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-base">Loading sales report...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-bold mb-2">Error Loading Report</div>
          <div className="text-gray-600 mb-4 text-sm">
            Failed to load sales report data. Please try again later.
          </div>
          <Button onClick={refetch}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Enhanced header with better visual balance */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">Sales Report</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Detailed sales transactions and revenue reports
        </p>
      </div>

      {/* Filters section */}
      <div className="px-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <BarChartIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Report Filters</CardTitle>
                <CardDescription className="text-sm">
                  Select filters to generate report
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="spbu">SPBU</Label>
                <Select value={selectedSpbu} onValueChange={onSpbuChange}>
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Select SPBU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All SPBUs</SelectItem>
                    {spbuOptions.map((spbu) => (
                      <SelectItem key={spbu.id} value={spbu.id.toString()}>
                        {spbu.name} ({spbu.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => onDateChange('from', e.target.value)}
                    className="py-5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="toDate">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => onDateChange('to', e.target.value)}
                    className="py-5"
                  />
                </div>
              </div>

              {/* Only show operator filter for non-operators */}
              {!isOperator && (
                <MultiOperatorFilter
                  operators={[...new Set(reportData.data.map(item => item.operator).filter(Boolean))]}
                  selectedOperators={operatorFilter ? [operatorFilter] : []}
                  onOperatorChange={(operators) => onOperatorChange(operators[0] || '')}
                  placeholder="All Operators"
                />
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={onGenerateReport}
                  className="flex-1 py-5"
                >
                  Generate Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onExportReport}
                  className="flex-1 py-5"
                  disabled={!reportData.data || reportData.data.length === 0}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report data table */}
      {reportData.data && reportData.data.length > 0 && (
        <div className="px-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle>Sales Transactions</CardTitle>
                  <CardDescription>
                    Detailed list of sales transactions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Show:</Label>
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
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-4">
                {[...(filteredData || [])]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((item) => (
                    <Card key={item.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{formatDate(item.date)}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {item.spbu}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="font-medium">{formatCurrency(item.amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              {(item.quantity || 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })} L
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-muted-foreground">Fuel:</span>
                            <span className="truncate">{item.fuelType}</span>
                          </div>
                          {!isOperator && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-muted-foreground">Operator:</span>
                              <span className="truncate">{item.operator}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              
              {/* Pagination */}
              {filteredData.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-2 mt-4 gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
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
                            className={`mx-0.5 ${pageNum === currentPage ? 'bg-primary text-primary-foreground' : ''}`}
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
      )}

      {/* Empty state */}
      {reportData.data && filteredData.length === 0 && (
        <div className="px-4">
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChartIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                No sales data found for the selected filters
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}