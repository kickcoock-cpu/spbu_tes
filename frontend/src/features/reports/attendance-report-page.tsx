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
import { CalendarIcon, DownloadIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { apiClient } from '@/lib/api'
import { ReportsVisualization } from './components/reports-visualization'

// Types
interface AttendanceReportItem {
  id: number
  date: string
  spbu: string
  user: string
  checkIn: string
  checkOut: string
}

interface AttendanceReportData {
  reportType: string
  generatedAt: string
  spbu_id?: number
  data: AttendanceReportItem[]
}

// API functions
const fetchAttendanceReport = async (params: any = {}): Promise<AttendanceReportData> => {
  try {
    const response = await apiClient.get('/api/reports/attendance', { params })
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching attendance report:', error)
    throw error
  }
}

const AttendanceReportPage = () => {
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
    queryKey: ['attendance-report', dateRange, filterType],
    queryFn: () => fetchAttendanceReport({ 
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
        <span className="ml-3 text-lg">Loading attendance report...</span>
      </div>
    )
  }
  
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Report</div>
          <div className="text-gray-600 mb-4">Failed to load attendance report data. Please try again later.</div>
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
          <h1 className="text-3xl font-bold">Attendance Report</h1>
          <p className="text-muted-foreground">
            Detailed report of staff attendance
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
            Filter the attendance report by date range and status
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
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
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
          <CardTitle>Attendance Data</CardTitle>
          <CardDescription>
            Staff attendance records for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>SPBU</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Check-in Time</TableHead>
                <TableHead>Check-out Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hours Worked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData?.data && reportData.data.length > 0 ? (
                reportData.data.map((item: AttendanceReportItem) => {
                  // Calculate hours worked if both check-in and check-out times are available
                  let hoursWorked = 'N/A';
                  let status = 'N/A';
                  
                  if (item.checkIn && item.checkOut) {
                    const checkInTime = new Date(item.checkIn);
                    const checkOutTime = new Date(item.checkOut);
                    const diffHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
                    hoursWorked = diffHours.toFixed(2);
                    
                    // Simple status determination (you might want to adjust this logic)
                    status = diffHours >= 8 ? 'present' : diffHours > 0 ? 'late' : 'absent';
                  } else if (item.checkIn) {
                    status = 'present';
                  } else {
                    status = 'absent';
                  }
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.spbu}</TableCell>
                      <TableCell>{item.user}</TableCell>
                      <TableCell>{item.checkIn ? new Date(item.checkIn).toLocaleTimeString() : 'N/A'}</TableCell>
                      <TableCell>{item.checkOut ? new Date(item.checkOut).toLocaleTimeString() : 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          status === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : status === 'absent' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {status}
                        </span>
                      </TableCell>
                      <TableCell>{hoursWorked}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">No attendance data found</div>
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
          <CardTitle>Attendance Chart</CardTitle>
          <CardDescription>
            Visual representation of attendance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsVisualization reportType="attendance" data={reportData?.data || []} />
        </CardContent>
      </Card>
    </div>
  )
}

export default AttendanceReportPage