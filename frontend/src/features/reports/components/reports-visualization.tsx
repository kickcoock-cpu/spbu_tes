import { useState } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

// Types
interface SalesReportItem {
  id: number
  date: string
  spbu: string
  fuelType: string
  quantity: number
  amount: number
  operator: string
}

interface DeliveriesReportItem {
  id: number
  date: string
  spbu: string
  supplier: string
  fuelType: string
  planned_liters: number
  actual_liters: number | null
  status: string
  confirmedBy: string
  approvedBy: string
}

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

interface AttendanceReportItem {
  id: number
  date: string
  spbu: string
  user: string
  checkIn: string
  checkOut: string
}

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID')
}

// Chart components
const SalesTrendChart = ({ data }: { data: SalesReportItem[] }) => {
  // Aggregate data by date
  const aggregatedData = data.reduce((acc, item) => {
    const date = formatDate(item.date)
    if (!acc[date]) {
      acc[date] = { date, totalAmount: 0, totalQuantity: 0 }
    }
    acc[date].totalAmount += item.amount
    acc[date].totalQuantity += item.quantity
    return acc
  }, {} as Record<string, { date: string; totalAmount: number; totalQuantity: number }>)
  
  const chartData = Object.values(aggregatedData)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => `Rp${value.toLocaleString()}`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Area type="monotone" dataKey="totalAmount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const FuelTypeDistributionChart = ({ data }: { data: SalesReportItem[] }) => {
  // Aggregate data by fuel type
  const aggregatedData = data.reduce((acc, item) => {
    if (!acc[item.fuelType]) {
      acc[item.fuelType] = { name: item.fuelType, value: 0 }
    }
    acc[item.fuelType].value += item.amount
    return acc
  }, {} as Record<string, { name: string; value: number }>)
  
  const chartData = Object.values(aggregatedData)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

const DeliveryStatusChart = ({ data }: { data: DeliveriesReportItem[] }) => {
  // Aggregate data by status
  const aggregatedData = data.reduce((acc, item) => {
    if (!acc[item.status]) {
      acc[item.status] = { name: item.status, value: 0 }
    }
    acc[item.status].value += 1
    return acc
  }, {} as Record<string, { name: string; value: number }>)
  
  const chartData = Object.values(aggregatedData)

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#82ca9d">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

const PaymentMethodChart = ({ data }: { data: DepositsReportItem[] }) => {
  // Aggregate data by payment method
  const aggregatedData = data.reduce((acc, item) => {
    if (!acc[item.paymentMethod]) {
      acc[item.paymentMethod] = { name: item.paymentMethod, value: 0 }
    }
    acc[item.paymentMethod].value += item.amount
    return acc
  }, {} as Record<string, { name: string; value: number }>)
  
  const chartData = Object.values(aggregatedData)

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart cx="50%" cy="50%" outerRadius="60%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis />
        <Radar name="Amount" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

const AttendanceTrendChart = ({ data }: { data: AttendanceReportItem[] }) => {
  // Aggregate data by date
  const aggregatedData = data.reduce((acc, item) => {
    const date = formatDate(item.date)
    if (!acc[date]) {
      acc[date] = { date, count: 0 }
    }
    acc[date].count += 1
    return acc
  }, {} as Record<string, { date: string; count: number }>)
  
  const chartData = Object.values(aggregatedData)

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#ff7300" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Main component
export const ReportsVisualization = ({ 
  reportType,
  data,
  operatorFilter,
  onOperatorFilterChange
}: { 
  reportType: 'sales' | 'deliveries' | 'deposits' | 'attendance'
  data: SalesReportItem[] | DeliveriesReportItem[] | DepositsReportItem[] | AttendanceReportItem[]
  operatorFilter?: string | string[]
  onOperatorFilterChange?: (operator: string | string[]) => void
}) => {
  const [chartType, setChartType] = useState('trend')
  
  // Get unique operators from data
  const getUniqueOperators = () => {
    if (reportType === 'sales') {
      const salesData = data as SalesReportItem[]
      const operators = [...new Set(salesData.map(item => item.operator).filter(Boolean))]
      return operators
    } else if (reportType === 'deposits') {
      const depositsData = data as DepositsReportItem[]
      const operators = [...new Set(depositsData.map(item => item.operator).filter(Boolean))]
      return operators
    }
    return []
  }
  
  const uniqueOperators = getUniqueOperators()
  
  // Filter data based on operator filter
  const filteredData = operatorFilter 
    ? (data as any[]).filter(item => {
        if (Array.isArray(operatorFilter)) {
          return operatorFilter.includes(item.operator)
        } else {
          return item.operator === operatorFilter
        }
      })
    : data
    
  // Render appropriate chart based on report type
  const renderChart = () => {
    switch (reportType) {
      case 'sales':
        switch (chartType) {
          case 'trend':
            return <SalesTrendChart data={filteredData as SalesReportItem[]} />
          case 'distribution':
            return <FuelTypeDistributionChart data={filteredData as SalesReportItem[]} />
          default:
            return <SalesTrendChart data={filteredData as SalesReportItem[]} />
        }
      
      case 'deliveries':
        return <DeliveryStatusChart data={filteredData as DeliveriesReportItem[]} />
      
      case 'deposits':
        return <PaymentMethodChart data={filteredData as DepositsReportItem[]} />
      
      case 'attendance':
        return <AttendanceTrendChart data={filteredData as AttendanceReportItem[]} />
      
      default:
        return null
    }
  }
  
  // Render summary statistics
  const renderSummary = () => {
    // Use filtered data for summary
    const summaryData = filteredData
    
    switch (reportType) {
      case 'sales':
        const salesData = summaryData as SalesReportItem[]
        const totalSales = salesData.reduce((sum, item) => sum + item.amount, 0)
        const totalQuantity = salesData.reduce((sum, item) => sum + (item.quantity || 0), 0)
        const avgTransaction = salesData.length > 0 ? totalSales / salesData.length : 0
        
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Total Liters</CardDescription>
                <CardTitle className="text-2xl">{totalQuantity.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Total Sales</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(totalSales)}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Avg. Transaction</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(avgTransaction)}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )
      
      case 'deliveries':
        const deliveriesData = summaryData as DeliveriesReportItem[]
        const totalDeliveries = deliveriesData.length
        const totalPlanned = deliveriesData.reduce((sum, item) => sum + (item.planned_liters || 0), 0)
        const totalActual = deliveriesData.reduce((sum, item) => sum + (item.actual_liters || 0), 0)
        const pendingDeliveries = deliveriesData.filter(item => item.status === 'pending').length
        
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Total Deliveries</CardDescription>
                <CardTitle className="text-2xl">{totalDeliveries}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Total Quantity</CardDescription>
                <CardTitle className="text-2xl">{totalPlanned.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Total Delivered</CardDescription>
                <CardTitle className="text-2xl">{totalActual.toLocaleString('id-ID', { minimumFractionDigits: 2 })} L</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Pending Deliveries</CardDescription>
                <CardTitle className="text-2xl">{pendingDeliveries}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Pending Deliveries</CardDescription>
                <CardTitle className="text-2xl">
                  <Badge variant={pendingDeliveries > 0 ? "destructive" : "secondary"}>
                    {pendingDeliveries}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )
      
      case 'deposits':
        const depositsData = summaryData as DepositsReportItem[]
        const totalDeposits = depositsData.reduce((sum, item) => sum + item.amount, 0)
        const approvedDeposits = depositsData.filter(item => item.status === 'approved').length
        const rejectedDeposits = depositsData.filter(item => item.status === 'rejected').length
        
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Total Deposits</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(totalDeposits)}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Approved Deposits</CardDescription>
                <CardTitle className="text-2xl">
                  <Badge variant="success">
                    {approvedDeposits}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Rejected Deposits</CardDescription>
                <CardTitle className="text-2xl">
                  <Badge variant={rejectedDeposits > 0 ? "destructive" : "secondary"}>
                    {rejectedDeposits}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )
      
      case 'attendance':
        const attendanceData = summaryData as AttendanceReportItem[]
        const totalRecords = attendanceData.length
        const uniqueEmployees = new Set(attendanceData.map(item => item.user)).size
        
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Total Records</CardDescription>
                <CardTitle className="text-2xl">{totalRecords}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
              <CardHeader className="pb-2">
                <CardDescription>Unique Employees</CardDescription>
                <CardTitle className="text-2xl">{uniqueEmployees}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {renderSummary()}
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Visualization</CardTitle>
              <CardDescription>Interactive charts for data analysis</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {uniqueOperators.length > 0 && (
                <div className="w-full sm:w-[180px]">
                  <Select 
                    value={Array.isArray(operatorFilter) ? operatorFilter[0] || "all" : operatorFilter || "all"} 
                    onValueChange={(value) => onOperatorFilterChange && onOperatorFilterChange(value === "all" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Operators" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Operators</SelectItem>
                      {uniqueOperators.map((operator) => (
                        <SelectItem key={operator} value={operator}>
                          {operator}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="w-full sm:w-[180px]">
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trend">Trend Analysis</SelectItem>
                    <SelectItem value="distribution">Distribution</SelectItem>
                    <SelectItem value="comparison">Comparison</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 gap-6">
        {renderChart()}
      </div>
    </div>
  )
}