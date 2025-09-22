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
import { LandmarkIcon, DownloadIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { apiClient } from '@/lib/api'
import { ReportsVisualization } from './components/reports-visualization'

// Types
interface DepositsReportItem {
  id: number
  date: string
  spbu: string
  operator: string
  amount: number
  paymentMethod: string
  status: string
  approvedBy: string
  rejectedBy: string
}

interface DepositsReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: DepositsReportItem[]
}

// API functions
const fetchDepositsReport = async (params: any = {}): Promise<DepositsReportData> => {
  try {
    const response = await apiClient.get('/api/reports/deposits', { params })
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching deposits report:', error)
    throw error
  }
}

const DepositsReportPage = () => {
  const navigate = useNavigate()
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
    queryKey: ['deposits-report', dateRange, filterType],
    queryFn: () => fetchDepositsReport({ 
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading deposits report...</span>
      </div>
    )
  }
  
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Report</div>
          <div className="text-gray-600 mb-4">Failed to load deposits report data. Please try again later.</div>
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
        <div>
          <h1 className="text-3xl font-bold">Deposits Report</h1>
          <p className="text-muted-foreground">
            Detailed report of cash deposits
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter the deposits report by date range and status
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
                <SelectItem value="all">All Deposits</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
          <CardTitle>Deposit Data</CardTitle>
          <CardDescription>
            Cash deposits for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>SPBU</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Amount (Rp)</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Rejected By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData?.data && reportData.data.length > 0 ? (
                reportData.data.map((item: DepositsReportItem) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.spbu}</TableCell>
                    <TableCell>{item.operator}</TableCell>
                    <TableCell>{item.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</TableCell>
                    <TableCell>{item.paymentMethod}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : item.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>{item.approvedBy}</TableCell>
                    <TableCell>{item.rejectedBy}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">No deposit data found</div>
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
      
      <Card>
        <CardHeader>
          <CardTitle>Deposit Chart</CardTitle>
          <CardDescription>
            Visual representation of deposit data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsVisualization reportType="deposits" data={reportData?.data || []} />
        </CardContent>
      </Card>
    </div>
  )
}

export default DepositsReportPage