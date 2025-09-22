import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess } from '@/lib/rbac'
import { apiClient } from '@/lib/api'

// Types
interface PredictionData {
  predictionType: string
  generatedAt: string
  spbu_id?: number
  predictions: any[]
}

interface SalesPrediction {
  period: string
  expectedRevenue: number
  expectedVolume: number
  confidence: number
}

interface DeliveryPrediction {
  fuelType: string
  recommendedVolume: number
  deliveryDate: string
  confidence: number
  urgency: string
  currentStock: number
  tankCapacity: number
  avgDailyConsumption: number
  safetyStock: number
  daysUntilStockout: number
  lastDeliveryDate: string
  lastDeliveryVolume: number
  supplierLeadTime: number
  recommendedOrderDate: string
  deliveryWindow: {
    earliest: string
    latest: string
  }
}

interface DemandPrediction {
  date: string
  day: string
  pertamax: {
    predictedVolume: number
    confidence: number
    trend: string
    seasonalFactor: number
    lastYearVolume: number
    variance: number
  }
  pertalite: {
    predictedVolume: number
    confidence: number
    trend: string
    seasonalFactor: number
    lastYearVolume: number
    variance: number
  }
  solar: {
    predictedVolume: number
    confidence: number
    trend: string
    seasonalFactor: number
    lastYearVolume: number
    variance: number
  }
}

interface StockoutPrediction {
  fuelType: string
  currentStock: number
  avgDailyConsumption: number
  daysUntilStockout: number
  predictedStockoutDate: string
  recommendedOrderVolume: number
}

// API functions
const fetchSalesPrediction = async (): Promise<{data: PredictionData & {predictions: SalesPrediction[]}}> => {
  const response = await apiClient.get('/api/prediction/sales')
  return response.data
}

const fetchDeliveriesPrediction = async (): Promise<{data: PredictionData & {predictions: DeliveryPrediction[]}}> => {
  const response = await apiClient.get('/api/prediction/deliveries')
  return response.data
}

const fetchDemandPrediction = async (): Promise<{data: PredictionData & {predictions: DemandPrediction[]}}> => {
  const response = await apiClient.get('/api/prediction/demand')
  return response.data
}

const fetchStockoutPrediction = async (): Promise<{data: PredictionData & {predictions: StockoutPrediction[]}}> => {
  const response = await apiClient.get('/api/prediction/stockout')
  return response.data
}

const PredictionsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore().auth
  
  const userHasAccess = user ? hasAccess(user, 'prediction') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'prediction') : false
  const isReadOnly = !userHasFullAccess

  // Redirect if not authorized
  useEffect(() => {
    if (user && !userHasAccess) {
      navigate({ to: '/403' })
    }
  }, [user, userHasAccess, navigate])

  // Fetch data
  const { data: salesData, isLoading: salesLoading, isError: salesError, refetch: refetchSales } = useQuery({
    queryKey: ['salesPrediction'],
    queryFn: fetchSalesPrediction,
    enabled: userHasAccess
  })

  const { data: deliveriesData, isLoading: deliveriesLoading, isError: deliveriesError, refetch: refetchDeliveries } = useQuery({
    queryKey: ['deliveriesPrediction'],
    queryFn: fetchDeliveriesPrediction,
    enabled: userHasAccess
  })

  const { data: demandData, isLoading: demandLoading, isError: demandError, refetch: refetchDemand } = useQuery({
    queryKey: ['demandPrediction'],
    queryFn: fetchDemandPrediction,
    enabled: userHasAccess
  })

  const { data: stockoutData, isLoading: stockoutLoading, isError: stockoutError, refetch: refetchStockout } = useQuery({
    queryKey: ['stockoutPrediction'],
    queryFn: fetchStockoutPrediction,
    enabled: userHasAccess
  })

  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Predictions</h1>
        <p className="text-muted-foreground">
          {isReadOnly 
            ? 'View predictions for your SPBU' 
            : 'View and manage predictions'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Sales Prediction Card */}
        <Card>
          <CardHeader>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Prediction</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchSales()}
                disabled={salesLoading}
              >
                {salesLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardDescription>Predicted sales for the upcoming period</CardDescription>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : salesError ? (
              <div className="flex items-center justify-center h-20 text-red-500">
                Error loading data
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  Rp {salesData?.data.predictions[0]?.expectedRevenue.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {salesData?.data.predictions[0]?.period} ({salesData?.data.predictions[0]?.confidence}% confidence)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deliveries Prediction Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deliveries Prediction</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetchDeliveries()}
              disabled={deliveriesLoading}
            >
              {deliveriesLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardDescription>Predicted deliveries for the upcoming period</CardDescription>
          <CardContent>
            {deliveriesLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : deliveriesError ? (
              <div className="flex items-center justify-center h-20 text-red-500">
                Error loading data
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {deliveriesData?.data.predictions.length || '0'} Deliveries
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended volumes for next delivery
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {deliveriesData?.data.predictions.map((item: DeliveryPrediction) => (
                    <div 
                      key={item.fuelType} 
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.urgency === 'critical' ? "bg-red-100 text-red-800" :
                        item.urgency === 'high' ? "bg-orange-100 text-orange-800" :
                        item.urgency === 'medium' ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.fuelType}: {item.recommendedVolume.toLocaleString()}L
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stockout Prediction Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stockout Prediction</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetchStockout()}
              disabled={stockoutLoading}
            >
              {stockoutLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardDescription>Predicted dates when stocks will run out</CardDescription>
          <CardContent>
            {stockoutLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : stockoutError ? (
              <div className="flex items-center justify-center h-20 text-red-500">
                Error loading data
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {stockoutData?.data.predictions.reduce((min, item) => 
                    item.daysUntilStockout < min ? item.daysUntilStockout : min, 
                    stockoutData?.data.predictions[0]?.daysUntilStockout || 999
                  )} days
                </div>
                <p className="text-xs text-muted-foreground">
                  Soonest stockout prediction
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stockout Prediction Section */}
      <Card>
        <CardHeader>
          <CardTitle>Stockout Predictions</CardTitle>
          <CardDescription>Predicted dates when fuel stocks will run out and recommended order volumes</CardDescription>
        </CardHeader>
        <CardContent>
          {stockoutLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : stockoutError ? (
            <div className="flex items-center justify-center h-32 text-red-500">
              Error loading stockout prediction
            </div>
          ) : (
            <>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stockoutData?.data.predictions || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fuelType" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} days`, 'Days Until Stockout']}
                      labelFormatter={(value) => `Fuel Type: ${value}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="daysUntilStockout" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="Days Until Stockout"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Current Stock (L)</TableHead>
                    <TableHead>Daily Consumption (L)</TableHead>
                    <TableHead>Days Until Stockout</TableHead>
                    <TableHead>Predicted Stockout Date</TableHead>
                    <TableHead>Recommended Order (L)</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockoutData?.data.predictions.map((item: StockoutPrediction, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.fuelType}</TableCell>
                      <TableCell>{item.currentStock.toLocaleString()}</TableCell>
                      <TableCell>{(item.avgDailyConsumption || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={item.daysUntilStockout <= 5 ? "text-red-500 font-bold" : "text-orange-500"}>
                          {item.daysUntilStockout} days
                        </span>
                      </TableCell>
                      <TableCell>{new Date(item.predictedStockoutDate).toLocaleDateString()}</TableCell>
                      <TableCell>{item.recommendedOrderVolume.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => {
                          // Navigate to deliveries page with pre-filled form
                          navigate({ to: '/deliveries' });
                        }}>
                          Create DO
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Visualization Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Prediction Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend Prediction</CardTitle>
            <CardDescription>Predicted sales revenue and volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : salesError ? (
              <div className="flex items-center justify-center h-80 text-red-500">
                Error loading sales prediction data
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesData?.data.predictions || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'expectedRevenue') {
                          return [`Rp ${parseInt(value.toString()).toLocaleString()}`, 'Expected Revenue'];
                        }
                        return [`${value} L`, 'Expected Volume'];
                      }}
                    />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="expectedRevenue" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Expected Revenue (Rp)"
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="expectedVolume" 
                      stroke="#82ca9d" 
                      name="Expected Volume (L)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deliveries Prediction Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Deliveries Volume Prediction</CardTitle>
            <CardDescription>Predicted delivery volumes by fuel type</CardDescription>
          </CardHeader>
          <CardContent>
            {deliveriesLoading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : deliveriesError ? (
              <div className="flex items-center justify-center h-80 text-red-500">
                Error loading deliveries prediction data
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deliveriesData?.data.predictions || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ fuelType, recommendedVolume }) => `${fuelType}: ${recommendedVolume.toLocaleString()}L`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="recommendedVolume"
                      nameKey="fuelType"
                    >
                      {deliveriesData?.data.predictions.map((entry: DeliveryPrediction, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${parseInt(value.toString()).toLocaleString()} L`, 'Recommended Volume']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Predictions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Predictions</CardTitle>
          <CardDescription>View detailed prediction data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Sales Predictions</h3>
              {salesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : salesError ? (
                <div className="flex items-center justify-center h-32 text-red-500">
                  Error loading sales prediction data
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Expected Revenue (Rp)</TableHead>
                      <TableHead>Expected Volume (L)</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData?.data.predictions.map((item: SalesPrediction, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.period}</TableCell>
                        <TableCell>Rp {item.expectedRevenue.toLocaleString()}</TableCell>
                        <TableCell>{item.expectedVolume.toLocaleString()}</TableCell>
                        <TableCell>{item.confidence}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Deliveries Predictions</h3>
              {deliveriesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : deliveriesError ? (
                <div className="flex items-center justify-center h-32 text-red-500">
                  Error loading deliveries prediction data
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fuel Type</TableHead>
                      <TableHead>Recommended Volume (L)</TableHead>
                      <TableHead>Current Stock (L)</TableHead>
                      <TableHead>Daily Consumption (L)</TableHead>
                      <TableHead>Days Until Stockout</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Urgency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveriesData?.data.predictions.map((item: DeliveryPrediction, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.fuelType}</TableCell>
                        <TableCell>{item.recommendedVolume.toLocaleString()}</TableCell>
                        <TableCell>{item.currentStock.toLocaleString()}</TableCell>
                        <TableCell>{item.avgDailyConsumption.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={item.daysUntilStockout <= 3 ? "text-red-500 font-bold" : 
                                        item.daysUntilStockout <= 7 ? "text-orange-500" : 
                                        "text-green-500"}>
                            {item.daysUntilStockout} days
                          </span>
                        </TableCell>
                        <TableCell>{new Date(item.deliveryDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={item.confidence >= 80 ? "text-green-500" : 
                                          item.confidence >= 60 ? "text-yellow-500" : 
                                          "text-red-500"}>
                              {item.confidence}%
                            </span>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  item.confidence >= 80 ? "bg-green-500" : 
                                  item.confidence >= 60 ? "bg-yellow-500" : 
                                  "bg-red-500"
                                }`}
                                style={{ width: `${item.confidence}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.urgency === 'critical' ? "bg-red-100 text-red-800" :
                            item.urgency === 'high' ? "bg-orange-100 text-orange-800" :
                            item.urgency === 'medium' ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Demand Predictions</h3>
              {demandLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : demandError ? (
                <div className="flex items-center justify-center h-32 text-red-500">
                  Error loading demand prediction data
                </div>
              ) : (
                <div>
                  <div className="h-80 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={demandData?.data.predictions || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => {
                            // Find the corresponding fuel data
                            const fuelData = demandData?.data.predictions.find(p => p.day === name);
                            if (fuelData) {
                              const fuelType = name.toLowerCase();
                              return [`${parseInt(value.toString()).toLocaleString()} L`, `${name} (${fuelData[fuelType].confidence * 100}% confidence)`];
                            }
                            return [`${parseInt(value.toString()).toLocaleString()} L`, name];
                          }}
                        />
                        <Bar 
                          dataKey={row => row.pertamax.predictedVolume} 
                          stackId="a" 
                          fill="#0088FE" 
                          name="Pertamax" 
                        />
                        <Bar 
                          dataKey={row => row.pertalite.predictedVolume} 
                          stackId="a" 
                          fill="#00C49F" 
                          name="Pertalite" 
                        />
                        <Bar 
                          dataKey={row => row.solar.predictedVolume} 
                          stackId="a" 
                          fill="#FFBB28" 
                          name="Solar" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Pertamax (L)</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Pertalite (L)</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Solar (L)</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demandData?.data.predictions.map((row: DemandPrediction, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{row.day}</TableCell>
                          <TableCell>{row.pertamax.predictedVolume.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className={row.pertamax.confidence >= 0.8 ? "text-green-500" : 
                                            row.pertamax.confidence >= 0.6 ? "text-yellow-500" : 
                                            "text-red-500"}>
                                {(row.pertamax.confidence * 100).toFixed(0)}%
                              </span>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    row.pertamax.confidence >= 0.8 ? "bg-green-500" : 
                                    row.pertamax.confidence >= 0.6 ? "bg-yellow-500" : 
                                    "bg-red-500"
                                  }`}
                                  style={{ width: `${row.pertamax.confidence * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.pertamax.trend === 'increasing' ? "bg-green-100 text-green-800" :
                              row.pertamax.trend === 'decreasing' ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {row.pertamax.trend}
                            </span>
                          </TableCell>
                          <TableCell>{row.pertalite.predictedVolume.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className={row.pertalite.confidence >= 0.8 ? "text-green-500" : 
                                            row.pertalite.confidence >= 0.6 ? "text-yellow-500" : 
                                            "text-red-500"}>
                                {(row.pertalite.confidence * 100).toFixed(0)}%
                              </span>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    row.pertalite.confidence >= 0.8 ? "bg-green-500" : 
                                    row.pertalite.confidence >= 0.6 ? "bg-yellow-500" : 
                                    "bg-red-500"
                                  }`}
                                  style={{ width: `${row.pertalite.confidence * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.pertalite.trend === 'increasing' ? "bg-green-100 text-green-800" :
                              row.pertalite.trend === 'decreasing' ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {row.pertalite.trend}
                            </span>
                          </TableCell>
                          <TableCell>{row.solar.predictedVolume.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className={row.solar.confidence >= 0.8 ? "text-green-500" : 
                                            row.solar.confidence >= 0.6 ? "text-yellow-500" : 
                                            "text-red-500"}>
                                {(row.solar.confidence * 100).toFixed(0)}%
                              </span>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    row.solar.confidence >= 0.8 ? "bg-green-500" : 
                                    row.solar.confidence >= 0.6 ? "bg-yellow-500" : 
                                    "bg-red-500"
                                  }`}
                                  style={{ width: `${row.solar.confidence * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.solar.trend === 'increasing' ? "bg-green-100 text-green-800" :
                              row.solar.trend === 'decreasing' ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {row.solar.trend}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PredictionsPage