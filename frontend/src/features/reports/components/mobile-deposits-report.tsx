import React from 'react'
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
import { LandmarkIcon, DownloadIcon } from 'lucide-react'
import { ReportsVisualization } from './reports-visualization'

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

interface DepositsReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: DepositsReportItem[]
}

interface MobileDepositsReportProps {
  reportData: DepositsReportData
  spbuOptions: Array<{ id: number; name: string; code: string }>
  selectedSpbu: string
  dateRange: { from: string; to: string }
  onSpbuChange: (value: string) => void
  onDateChange: (field: string, value: string) => void
  onGenerateReport: () => void
  onExportReport: () => void
  isLoading: boolean
  isError: boolean
  refetch: () => void
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string) => string
  getStatusColor: (status: string) => string
}

export const MobileDepositsReport: React.FC<MobileDepositsReportProps> = ({
  reportData,
  spbuOptions,
  selectedSpbu,
  dateRange,
  onSpbuChange,
  onDateChange,
  onGenerateReport,
  onExportReport,
  isLoading,
  isError,
  refetch,
  formatCurrency,
  formatDate,
  getStatusColor
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-base">Loading deposits report...</span>
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
            Failed to load deposits report data. Please try again later.
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
        <h1 className="text-2xl font-bold">Deposits Report</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor cash deposits and financial transactions
        </p>
      </div>

      {/* Filters section */}
      <div className="px-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <LandmarkIcon className="h-6 w-6 text-primary" />
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

      {/* Report visualization */}
      {reportData.data && reportData.data.length > 0 && (
        <div className="px-4">
          <ReportsVisualization 
            reportType="deposits" 
            data={reportData.data} 
          />
        </div>
      )}

      {/* Report data table */}
      {reportData.data && reportData.data.length > 0 && (
        <div className="px-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Deposit Transactions</CardTitle>
              <CardDescription>
                Detailed list of deposit transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-4">
                {reportData.data.map((item) => (
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
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium mt-1 ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-muted-foreground">Method:</span>
                          <span className="truncate">{item.paymentMethod}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-muted-foreground">Operator:</span>
                          <span className="truncate">{item.operator || '-'}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-muted-foreground">Approved:</span>
                          <span className="truncate">{item.approvedBy || '-'}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-muted-foreground">Rejected:</span>
                          <span className="truncate">{item.rejectedBy || '-'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {reportData.data && reportData.data.length === 0 && (
        <div className="px-4">
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <LandmarkIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                No deposit data found for the selected filters
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}