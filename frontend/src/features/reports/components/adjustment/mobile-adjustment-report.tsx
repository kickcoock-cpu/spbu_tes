import { useState } from 'react'
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
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface MobileAdjustmentReportProps {
  reportData: any[]
  dateRange: { start: string; end: string }
  filterStatus: string
  filterType: string
  filterSPBU: string
  setDateRange: (range: { start: string; end: string }) => void
  setFilterStatus: (status: string) => void
  setFilterType: (type: string) => void
  setFilterSPBU: (spbu: string) => void
  onApplyFilters: () => void
  onExport: () => void
  totalAdjustments: number
  totalGain: number
  totalLoss: number
  totalValue: number
  spbuList: any[]
  isSuperAdmin: boolean
}

export const MobileAdjustmentReport = ({
  reportData = [],
  dateRange,
  filterStatus,
  filterType,
  filterSPBU,
  setDateRange,
  setFilterStatus,
  setFilterType,
  setFilterSPBU,
  onApplyFilters,
  onExport,
  totalAdjustments,
  totalGain,
  totalLoss,
  totalValue,
  spbuList,
  isSuperAdmin
}: MobileAdjustmentReportProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Filter data
  const filteredData = reportData.filter(item => {
    // Apply status filter
    if (filterStatus !== 'all' && item.status !== filterStatus) return false
    
    // Apply type filter
    if (filterType !== 'all' && item.type !== filterType) return false
    
    return true
  })
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  
  const paginatedData = [...filteredData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Adjustment Report</h1>
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-2 pt-2">
            <CardTitle className="text-xs font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent className="pb-2 pt-0">
            <div className="text-lg font-bold">{totalAdjustments}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="pb-2 pt-2">
            <CardTitle className="text-xs font-medium">Gain</CardTitle>
          </CardHeader>
          <CardContent className="pb-2 pt-0">
            <div className="text-lg font-bold">{totalGain.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="pb-2 pt-2">
            <CardTitle className="text-xs font-medium">Loss</CardTitle>
          </CardHeader>
          <CardContent className="pb-2 pt-0">
            <div className="text-lg font-bold">{totalLoss.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="pb-2 pt-2">
            <CardTitle className="text-xs font-medium">Net</CardTitle>
          </CardHeader>
          <CardContent className="pb-2 pt-0">
            <div className="text-lg font-bold">{totalValue.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-2 pt-2">
          <CardTitle className="flex items-center gap-1 text-sm">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </CardTitle>
          <CardDescription className="text-xs">
            Filter adjustment requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="mobile-start-date" className="text-xs">Start</Label>
              <Input
                id="mobile-start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mobile-end-date" className="text-xs">End</Label>
              <Input
                id="mobile-end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="mobile-filter-status" className="text-xs">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="mobile-filter-type" className="text-xs">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isSuperAdmin && (
            <div className="space-y-1">
              <Label htmlFor="mobile-filter-spbu" className="text-xs">SPBU</Label>
              <Select value={filterSPBU} onValueChange={setFilterSPBU}>
                <SelectTrigger className="h-8 text-xs">
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
          
          <Button className="w-full h-8 text-xs" onClick={onApplyFilters}>
            Apply Filters
          </Button>
        </CardContent>
      </Card>
      
      {/* Data Table */}
      <Card>
        <CardHeader className="pb-2 pt-2">
          <CardTitle>Adjustment Requests</CardTitle>
          <CardDescription className="text-xs">
            {filteredData.length} requests found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2 text-xs py-2">Details</TableHead>
                  <TableHead className="w-1/2 text-right text-xs py-2">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData && paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="py-2">
                        <div className="font-medium text-xs">
                          {format(new Date(item.date), 'dd MMM yyyy', { locale: id })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.spbu}
                        </div>
                        <div className="text-xs">
                          <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : item.status === 'rejected' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status}
                          </span>
                          <span className="ml-1 capitalize">{item.type}</span>
                        </div>
                        {item.tank && (
                          <div className="text-xs text-muted-foreground">
                            {item.tank}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-2">
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
                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                      No adjustment requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/20 rounded-b gap-2">
              <div className="text-xs text-muted-foreground">
                {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
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