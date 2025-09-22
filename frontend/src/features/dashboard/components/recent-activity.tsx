import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Clock, User, Fuel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityItem {
  id: number;
  transactionId?: string;
  type: 'sale' | 'delivery';
  fuelType: string;
  time: string;
  user?: string;
  spbu?: string;
  quantity: number;
  amount: number;
}

interface RecentActivityProps {
  sales: Array<{
    id: number;
    operatorName: string;
    totalAmount: number;
    litersSold: number;
    fuel_type: string;
    createdAt: string;
    spbu?: {
      name: string;
      code: string;
    };
  }>;
  deliveries: Array<{
    id: number;
    supplier: string;
    fuelType: string;
    liters: number;
    status: string;
    createdAt: string;
  }>;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ sales, deliveries }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Combine and sort activities
  const activities: ActivityItem[] = [
    ...sales.map(sale => ({
      id: sale.id,
      transactionId: sale.transactionId,
      type: 'sale' as const,
      fuelType: sale.fuel_type,
      time: sale.createdAt,
      user: sale.operatorName,
      spbu: sale.spbu?.name || sale.spbu?.code || '-',
      quantity: sale.litersSold,
      amount: sale.totalAmount
    })),
    ...deliveries.map(delivery => ({
      id: delivery.id,
      type: 'delivery' as const,
      fuelType: delivery.fuelType,
      time: delivery.createdAt,
      user: delivery.supplier,
      quantity: delivery.liters || 0,
      amount: 0 // Deliveries don't have amount in this context
    }))
  ]
  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  
  // Pagination
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = activities.slice(startIndex, endIndex);
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return <Fuel className="h-4 w-4 text-blue-500" />;
      case 'delivery': return <Fuel className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getActivityBg = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-blue-100';
      case 'delivery': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };
  
  // Mobile view for recent activity
  const MobileActivityItem = ({ activity }: { activity: ActivityItem }) => (
    <div className="flex items-start gap-3 p-4 border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className={`p-2.5 rounded-full ${getActivityBg(activity.type)}`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <div className="font-medium text-base truncate">{activity.fuelType}</div>
            <div className="text-sm text-muted-foreground truncate mt-1">
              {activity.user}
            </div>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {new Date(activity.time).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        <div className="mt-2 text-base font-medium">
          {activity.quantity.toLocaleString()}L {formatCurrency(activity.amount)}
        </div>
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          <span className="bg-muted px-2 py-1 rounded">{activity.spbu || '-'}</span>
          <span className="bg-muted px-2 py-1 rounded">{activity.transactionId || '-'}</span>
        </div>
      </div>
    </div>
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest sales and delivery updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile view */}
        <div className="sm:hidden">
          {activities.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {currentActivities.map((activity) => (
                  <MobileActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="flex flex-col items-center justify-center">
                <Fuel className="h-12 w-12 text-muted-foreground mb-2" />
                <div className="text-gray-400 mb-2">No recent activity</div>
                <div className="text-sm text-gray-500">
                  Recent sales and deliveries will appear here
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Desktop view */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>SPBU</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Quantity (L)</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentActivities.length > 0 ? (
                currentActivities.map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(activity.time).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{activity.fuelType}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{activity.spbu || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{activity.user || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono">{activity.transactionId || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{activity.quantity.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{formatCurrency(activity.amount)}</div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Fuel className="h-12 w-12 text-muted-foreground mb-2" />
                      <div className="text-gray-400 mb-2">No recent activity</div>
                      <div className="text-sm text-gray-500">
                        Recent sales and deliveries will appear here
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Desktop Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, activities.length)} of {activities.length} activities
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-2">Previous</span>
                </Button>
                <div className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <span className="mr-2">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};