import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Fuel, 
  Droplets, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Clock,
  Gauge,
  Zap
} from 'lucide-react';

export const MobileDashboardShowcase = () => {
  const [expandedSections, setExpandedSections] = React.useState({
    criticalAlerts: true,
    tankStatus: true,
    predictions: true,
    recentActivity: true
  });

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Sample data for showcase
  const stats = [
    {
      title: 'Total Liters',
      value: '12,500',
      description: 'Liters sold today',
      icon: <DollarSign className="h-4 w-4" />,
      color: 'green',
      trend: { value: 12, isUp: true }
    },
    {
      title: 'Critical Stocks',
      value: '2',
      description: 'Stocks running low',
      icon: <Fuel className="h-4 w-4" />,
      color: 'red',
      trend: { value: 3, isUp: false }
    },
    {
      title: 'Active Tanks',
      value: '4',
      description: 'Tanks monitored',
      icon: <Droplets className="h-4 w-4" />,
      color: 'blue',
      trend: { value: 0, isUp: true }
    },
    {
      title: 'Pending Deliveries',
      value: '1',
      description: 'Awaiting confirmation',
      icon: <Truck className="h-4 w-4" />,
      color: 'yellow',
      trend: { value: 8, isUp: true }
    }
  ];

  const criticalStocks = [
    { id: 1, name: 'Tank C - Solar', currentStock: '1,200L', percentage: '15%' },
    { id: 2, name: 'Tank E - Dexlite', currentStock: '800L', percentage: '18%' }
  ];

  return (
    <div className="space-y-5 pb-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Mobile Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Interactive 2-column layout with collapsible sections
        </p>
      </div>

      {/* Pull to Refresh Indicator */}
      <div className="flex justify-center pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-muted-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Pull to Refresh
        </Button>
      </div>

      {/* Summary Stats - 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full border-2 border-transparent hover:border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${
                stat.color === 'red' ? 'text-red-500 bg-red-100' :
                stat.color === 'green' ? 'text-green-500 bg-green-100' :
                stat.color === 'yellow' ? 'text-yellow-500 bg-yellow-100' :
                'text-blue-500 bg-blue-100'
              }`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold truncate">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              {stat.trend && (
                <div className={`flex items-center mt-2 text-xs ${stat.trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
                  <RefreshCw className={`h-3 w-3 mr-1 ${stat.trend.isUp ? '' : 'rotate-180'}`} />
                  {stat.trend.value}% from last month
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Stock Alerts */}
      <Card>
        <CardHeader 
          className="cursor-pointer pb-2"
          onClick={() => toggleSection('criticalAlerts')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg">Critical Alerts</CardTitle>
            </div>
            {expandedSections.criticalAlerts ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </div>
          <CardDescription>
            Immediate attention required
          </CardDescription>
        </CardHeader>
        
        {expandedSections.criticalAlerts && (
          <CardContent className="pt-2">
            <div className="space-y-3">
              {criticalStocks.map((tank) => (
                <div key={tank.id} className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{tank.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Fuel className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-muted-foreground">
                          {tank.currentStock} ({tank.percentage})
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-9 text-sm ml-2 flex-shrink-0"
                    >
                      Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tank Status */}
      <Card>
        <CardHeader 
          className="cursor-pointer pb-2"
          onClick={() => toggleSection('tankStatus')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              <CardTitle className="text-lg">Tank Status</CardTitle>
            </div>
            {expandedSections.tankStatus ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </div>
          <CardDescription>
            Real-time fuel levels
          </CardDescription>
        </CardHeader>
        
        {expandedSections.tankStatus && (
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 gap-4">
              {/* Sample tank cards using the new mobile tank status card */}
              {[1, 2, 3, 4].map((id) => (
                <Card key={id} className="hover:shadow-md transition-shadow h-full border-2 border-transparent hover:border-blue-200">
                  <CardHeader className="pb-3 pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 min-w-0">
                        <span className="text-xl flex-shrink-0">
                          {id === 3 || id === 4 ? '🛢️' : '⛽'}
                        </span>
                        <span className="truncate">Tank {String.fromCharCode(64 + id)}</span>
                      </CardTitle>
                      <span className={`text-xs px-2.5 py-1.5 rounded-full font-bold border whitespace-nowrap flex-shrink-0 ${
                        id === 3 ? 'text-red-600 bg-red-100 border-red-200' : 
                        id === 4 ? 'text-yellow-600 bg-yellow-100 border-yellow-200' : 
                        'text-green-600 bg-green-100 border-green-200'
                      }`}>
                        {id === 3 ? 'Critical' : id === 4 ? 'Low' : 'Good'} ({id === 3 ? '15' : id === 4 ? '35' : '85'}%)
                      </span>
                    </div>
                    <CardDescription className="text-sm mt-2">
                      {['Pertalite', 'Pertamax', 'Solar', 'Dexlite'][id-1]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 pt-3">
                    <div className="space-y-3">
                      <div className="relative h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100"></div>
                        <div 
                          className={`absolute bottom-0 w-full transition-all duration-1000 ease-out bg-gradient-to-t ${
                            id === 1 ? 'from-green-400 to-green-600' :
                            id === 2 ? 'from-blue-400 to-blue-600' :
                            id === 3 ? 'from-yellow-400 to-yellow-600' :
                            'from-purple-400 to-purple-600'
                          }`}
                          style={{ height: `${id === 3 ? 15 : id === 4 ? 35 : 85}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                        </div>
                        <div className="absolute top-2 left-3 text-white font-bold text-sm">
                          {id === 3 ? '1,200L' : id === 4 ? '2,800L' : `${id * 2000}L`}
                        </div>
                        <div className="absolute bottom-2 right-3 text-white text-sm opacity-90">
                          {id === 3 ? '15%' : id === 4 ? '35%' : '85%'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                          <Droplets className="text-gray-600" size={16} />
                          <div>
                            <div className="text-xs text-gray-500">Stock</div>
                            <div className="font-bold text-base">
                              {id === 3 ? '1,200' : id === 4 ? '2,800' : `${id * 2000}`} <span className="text-xs font-normal">L</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                          <Gauge className="text-gray-600" size={16} />
                          <div>
                            <div className="text-xs text-gray-500">Capacity</div>
                            <div className="font-bold text-base">
                              {id === 3 ? '8,000' : id === 4 ? '8,000' : `${id * 2500}`} <span className="text-xs font-normal">L</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-span-2 pt-2">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-1.5">
                              <Zap className="text-gray-600" size={14} />
                              <span className="text-gray-700 font-medium text-sm">Fill Level</span>
                            </div>
                            <span className="text-sm font-bold">{id === 3 ? '15' : id === 4 ? '35' : '85'}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                                id === 1 ? 'from-green-400 to-green-600' :
                                id === 2 ? 'from-blue-400 to-blue-600' :
                                id === 3 ? 'from-yellow-400 to-yellow-600' :
                                'from-purple-400 to-purple-600'
                              }`}
                              style={{ width: `${id === 3 ? 15 : id === 4 ? 35 : 85}%` }}
                            >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stock Predictions */}
      <Card>
        <CardHeader 
          className="cursor-pointer pb-2"
          onClick={() => toggleSection('predictions')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-lg">Stock Predictions</CardTitle>
            </div>
            {expandedSections.predictions ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </div>
          <CardDescription>
            Forecasted stock levels
          </CardDescription>
        </CardHeader>
        
        {expandedSections.predictions && (
          <CardContent className="pt-3">
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Prediction Legend</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">Critical (&lt;5 days)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs">Low (5-10 days)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Normal (&gt;10 days)</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Stock Prediction Chart</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Adjustment Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-blue-500" />
            Adjustment Metrics
          </CardTitle>
          <CardDescription>
            Fuel gain and loss from adjustments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <div className="text-lg font-bold text-blue-600">15</div>
              <div className="text-xs text-muted-foreground mt-1">Adjustments</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50">
              <div className="text-lg font-bold text-green-600">1,250.00 L</div>
              <div className="text-xs text-muted-foreground mt-1">Gain</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50">
              <div className="text-lg font-bold text-red-600">750.00 L</div>
              <div className="text-xs text-muted-foreground mt-1">Loss</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50">
              <div className="text-lg font-bold text-purple-600">500.00 L</div>
              <div className="text-xs text-muted-foreground mt-1">Net</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Mobile Dashboard Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-primary"></div>
              <span><strong>2-Column Layout:</strong> Optimized for mobile screens with a responsive grid</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-primary"></div>
              <span><strong>Collapsible Sections:</strong> Expand/collapse to manage content visibility</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-primary"></div>
              <span><strong>Interactive Cards:</strong> Hover effects and visual feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-primary"></div>
              <span><strong>Real-time Data:</strong> Visual indicators for critical alerts</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-primary"></div>
              <span><strong>Adjustment Metrics:</strong> Track fuel gain and loss from adjustments</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader 
          className="cursor-pointer pb-2"
          onClick={() => toggleSection('recentActivity')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </div>
            {expandedSections.recentActivity ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </div>
          <CardDescription>
            Latest sales and deliveries
          </CardDescription>
        </CardHeader>
        
        {expandedSections.recentActivity && (
          <CardContent className="pt-3">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors">
                <div className="p-2.5 rounded-full bg-blue-100">
                  <Fuel className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className="font-medium text-base truncate">New Sale</div>
                      <div className="text-sm text-muted-foreground truncate mt-1">
                        John Doe
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap ml-2">
                      <Clock className="h-3.5 w-3.5" />
                      10:30 AM
                    </div>
                  </div>
                  <div className="mt-2 text-base font-medium">150L Rp 1.500.000</div>
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors">
                <div className="p-2.5 rounded-full bg-green-100">
                  <Truck className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className="font-medium text-base truncate">Delivery Update</div>
                      <div className="text-sm text-muted-foreground truncate mt-1">
                        PT. Mitra Jaya
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap ml-2">
                      <Clock className="h-3.5 w-3.5" />
                      Yesterday
                    </div>
                  </div>
                  <div className="mt-2 text-base font-medium">5000L Solar</div>
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};