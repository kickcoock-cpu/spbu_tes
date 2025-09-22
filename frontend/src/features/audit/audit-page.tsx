import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
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
import { AlertTriangleIcon, RefreshCw, CalendarIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { apiClient } from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'

// Types
interface SuspiciousTransaction {
  id: number
  type: 'Sale' | 'Deposit' | 'Delivery'
  amount?: number
  liters?: number
  fuelType?: string
  paymentMethod?: string
  supplier?: string
  operator?: string
  spbu: string
  timestamp: string
  flags: string[]
}

interface SuspiciousTransactionsData {
  transactions: SuspiciousTransaction[]
  summary: {
    totalSuspicious: number
    suspiciousSales: number
    suspiciousDeposits: number
    suspiciousDeliveries: number
  }
}

// API functions
const fetchSuspiciousTransactions = async (params: any = {}): Promise<SuspiciousTransactionsData> => {
  try {
    const response = await apiClient.get('/api/suspicious/suspicious', { params })
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching suspicious transactions:', error)
    throw error
  }
}

const AuditPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore().auth
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filterType, setFilterType] = useState('all')
  const isMobile = useIsMobile()
  
  // Check if user has access to audit
  const userHasAccess = user ? hasAccess(user, 'audit') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'audit') : false
  
  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])
  
  // Fetch suspicious transactions data
  const { 
    data: transactionsData, 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: ['suspicious-transactions', dateRange, filterType],
    queryFn: () => fetchSuspiciousTransactions({ 
      startDate: dateRange.start, 
      endDate: dateRange.end, 
      filter: filterType 
    }),
    enabled: userHasAccess
  })
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }
  
  // Format liters
  const formatLiters = (liters: number) => {
    return `${liters.toLocaleString()} L`
  }
  
  // Get badge color based on flag
  const getFlagColor = (flag: string) => {
    if (flag.includes('Large')) return 'bg-red-100 text-red-800'
    if (flag.includes('Small')) return 'bg-yellow-100 text-yellow-800'
    if (flag.includes('Rapid')) return 'bg-orange-100 text-orange-800'
    if (flag.includes('Outside')) return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }
  
  // Filter transactions based on type
  const filteredTransactions = transactionsData?.transactions.filter(transaction => {
    if (filterType === 'all') return true
    return transaction.type.toLowerCase() === filterType
  }) || []
  
  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }
  
  // Mobile view
  if (isMobile) {
    return (
      <div className="space-y-6 p-4">
        <div>
          <h1 className="text-2xl font-bold">Audit - Suspicious Transactions</h1>
          <p className="text-muted-foreground text-sm">
            Monitor transactions with suspicious patterns
          </p>
        </div>
        
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date" className="text-sm">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-sm">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="filter-type" className="text-sm">Transaction Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="delivery">Deliveries</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => refetch()} 
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardContent>
        </Card>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {transactionsData?.summary.totalSuspicious || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Suspicious</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {transactionsData?.summary.suspiciousSales || 0}
              </div>
              <div className="text-sm text-muted-foreground">Suspicious Sales</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {transactionsData?.summary.suspiciousDeposits || 0}
              </div>
              <div className="text-sm text-muted-foreground">Suspicious Deposits</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {transactionsData?.summary.suspiciousDeliveries || 0}
              </div>
              <div className="text-sm text-muted-foreground">Suspicious Deliveries</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suspicious Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : isError ? (
              <div className="text-center text-red-500 py-4">
                Error loading suspicious transactions
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No suspicious transactions found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={`${transaction.type}-${transaction.id}`} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {transaction.type}: {transaction.id}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.spbu}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.timestamp)}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      {transaction.amount && (
                        <div className="text-sm">
                          Amount: {formatCurrency(transaction.amount)}
                        </div>
                      )}
                      {transaction.liters && (
                        <div className="text-sm">
                          Liters: {formatLiters(transaction.liters)}
                        </div>
                      )}
                      {transaction.operator && (
                        <div className="text-sm">
                          Operator: {transaction.operator}
                        </div>
                      )}
                      {transaction.paymentMethod && (
                        <div className="text-sm">
                          Payment: {transaction.paymentMethod}
                        </div>
                      )}
                      {transaction.supplier && (
                        <div className="text-sm">
                          Supplier: {transaction.supplier}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      {transaction.flags.map((flag, index) => (
                        <span 
                          key={index} 
                          className={`text-xs px-2 py-1 rounded-full ${getFlagColor(flag)}`}
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Desktop view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit - Suspicious Transactions</h1>
        <p className="text-muted-foreground">
          Monitor transactions with suspicious patterns
        </p>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-40"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-40"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="filter-type">Transaction Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="filter-type" className="w-40">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">Sales</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="delivery">Deliveries</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => refetch()} 
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suspicious</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {transactionsData?.summary.totalSuspicious || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Transactions flagged as suspicious
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Sales</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactionsData?.summary.suspiciousSales || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Sales with suspicious patterns
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Deposits</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactionsData?.summary.suspiciousDeposits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deposits with suspicious patterns
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Deliveries</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactionsData?.summary.suspiciousDeliveries || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deliveries with suspicious patterns
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Suspicious Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Transactions</CardTitle>
          <CardDescription>
            Transactions flagged with suspicious patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              Error loading suspicious transactions
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>SPBU</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Liters</TableHead>
                    <TableHead>Operator/Supplier</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No suspicious transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={`${transaction.type}-${transaction.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
                            {transaction.type} #{transaction.id}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.spbu}</TableCell>
                        <TableCell>
                          {transaction.amount ? formatCurrency(transaction.amount) : '-'}
                        </TableCell>
                        <TableCell>
                          {transaction.liters ? formatLiters(transaction.liters) : '-'}
                        </TableCell>
                        <TableCell>
                          {transaction.operator || transaction.supplier || '-'}
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {transaction.flags.map((flag, index) => (
                              <span 
                                key={index} 
                                className={`text-xs px-2 py-1 rounded-full ${getFlagColor(flag)}`}
                              >
                                {flag}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AuditPage