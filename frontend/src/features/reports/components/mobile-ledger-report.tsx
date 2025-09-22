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
import { BookOpen, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { MultiOperatorFilter } from './multi-operator-filter'

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

interface MobileLedgerViewProps {
  reportData: LedgerReportItem[]
  dateRange: { start: string; end: string }
  filterType: string
  setDateRange: (range: { start: string; end: string }) => void
  setFilterType: (type: string) => void
  onApplyFilters: () => void
  onExport: () => void
  formatCurrency: (amount: number) => string
  currentPage: number
  itemsPerPage: number
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  totalDebit: number
  totalCredit: number
  finalBalance: number
}

export const MobileLedgerView = ({
  reportData,
  dateRange,
  filterType,
  setDateRange,
  setFilterType,
  onApplyFilters,
  onExport,
  formatCurrency,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  totalDebit,
  totalCredit,
  finalBalance
}: MobileLedgerViewProps) => {
  const totalPages = Math.ceil(reportData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = reportData.slice(startIndex, endIndex)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Ledger Report</h1>
          <p className="text-sm text-muted-foreground">
            Financial ledger transactions
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="shadow">
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Debit</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-sm font-bold text-red-500">{formatCurrency(totalDebit)}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow">
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Credit</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-sm font-bold text-green-500">{formatCurrency(totalCredit)}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow">
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className={`text-sm font-bold ${finalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(finalBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow">
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Filter ledger transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mobile-start-date" className="text-xs">Start Date</Label>
              <Input
                id="mobile-start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile-end-date" className="text-xs">End Date</Label>
              <Input
                id="mobile-end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mobile-filter-type" className="text-xs">Transaction Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 text-xs">
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
          
          <Button onClick={onApplyFilters} className="w-full h-9">
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="shadow">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Transactions</CardTitle>
              <CardDescription>
                {reportData.length} entries
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {currentData.length > 0 ? (
            <div className="divide-y">
              {currentData.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {new Date(item.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {item.transactionType}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${item.debit > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {item.debit > 0 ? `-${formatCurrency(item.debit)}` : formatCurrency(item.credit)}
                      </div>
                      <div className={`text-sm ${item.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(item.balance)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-muted-foreground text-xs">
                      {item.spbu}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No transactions found</p>
            </div>
          )}
          
          {/* Pagination */}
          {reportData.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(endIndex, reportData.length)} of {reportData.length}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
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