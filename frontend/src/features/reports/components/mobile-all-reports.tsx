import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChartIcon, 
  TruckIcon, 
  LandmarkIcon, 
  CalendarIcon,
  DownloadIcon,
  RefreshCw
} from 'lucide-react';
import { ReportsVisualization } from './reports-visualization';

interface SalesReportItem {
  id: number;
  date: string;
  spbu: string;
  fuelType: string;
  quantity: number;
  amount: number;
  operator: string;
}

interface DeliveriesReportItem {
  id: number;
  date: string;
  spbu: string;
  supplier: string;
  fuelType: string;
  quantity: number;
  status: string;
  confirmedBy: string;
  approvedBy: string;
}

interface DepositsReportItem {
  id: number;
  date: string;
  spbu: string;
  amount: number;
  paymentMethod: string;
  status: string;
  operator: string;
  approvedBy: string;
  rejectedBy: string;
}

interface AttendanceReportItem {
  id: number;
  date: string;
  spbu: string;
  user: string;
  checkIn: string;
  checkOut: string;
}

interface SalesReportData {
  reportType: string;
  generatedAt: string;
  spbu_id?: number;
  data: SalesReportItem[];
}

interface DeliveriesReportData {
  reportType: string;
  generatedAt: string;
  spbu_id?: number;
  data: DeliveriesReportItem[];
}

interface DepositsReportData {
  reportType: string;
  generatedAt: string;
  spbu_id?: number;
  data: DepositsReportItem[];
}

interface AttendanceReportData {
  reportType: string;
  generatedAt: string;
  spbu_id?: number;
  data: AttendanceReportItem[];
}

interface MobileAllReportsProps {
  salesData: SalesReportData | undefined;
  deliveriesData: DeliveriesReportData | undefined;
  depositsData: DepositsReportData | undefined;
  attendanceData: AttendanceReportData | undefined;
  dateRange: { start: string; end: string };
  filterType: string;
  isLoading: boolean;
  isError: boolean;
  onDateRangeChange: (field: string, value: string) => void;
  onFilterTypeChange: (value: string) => void;
  onRefetchAll: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

export const MobileAllReports: React.FC<MobileAllReportsProps> = ({
  salesData,
  deliveriesData,
  depositsData,
  attendanceData,
  dateRange,
  filterType,
  isLoading,
  isError,
  onDateRangeChange,
  onFilterTypeChange,
  onRefetchAll,
  formatCurrency,
  formatDate
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-base">Loading reports...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-bold mb-2">Error Loading Reports</div>
          <div className="text-gray-600 mb-4 text-sm">
            Failed to load reports data. Please try again later.
          </div>
          <Button onClick={onRefetchAll}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Enhanced header with better visual balance */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">All Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Comprehensive overview of all business metrics
        </p>
      </div>

      {/* Filters section */}
      <div className="px-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <BarChartIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Report Filters</CardTitle>
                <CardDescription className="text-sm">
                  Select filters to generate reports
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => onDateRangeChange('start', e.target.value)}
                    className="py-5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="toDate">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => onDateRangeChange('end', e.target.value)}
                    className="py-5"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="filterType">Filter By</Label>
                <Select value={filterType} onValueChange={onFilterTypeChange}>
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Data</SelectItem>
                    <SelectItem value="recent">Recent Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={onRefetchAll}
                  className="flex-1 py-5"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 py-5"
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary cards */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Sales</CardDescription>
              <CardTitle className="text-xl">
                {salesData?.data ? salesData.data.length : 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground">
                <BarChartIcon className="mr-1 h-3 w-3" />
                Transactions
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Deliveries</CardDescription>
              <CardTitle className="text-xl">
                {deliveriesData?.data ? deliveriesData.data.length : 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground">
                <TruckIcon className="mr-1 h-3 w-3" />
                Shipments
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Deposits</CardDescription>
              <CardTitle className="text-xl">
                {depositsData?.data ? depositsData.data.length : 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground">
                <LandmarkIcon className="mr-1 h-3 w-3" />
                Transactions
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Attendance</CardDescription>
              <CardTitle className="text-xl">
                {attendanceData?.data ? attendanceData.data.length : 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarIcon className="mr-1 h-3 w-3" />
                Records
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Visualizations */}
      <div className="px-4 space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Sales Visualization</CardTitle>
            <CardDescription>
              Sales trends and distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsVisualization reportType="sales" data={salesData?.data || []} />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Deliveries Visualization</CardTitle>
            <CardDescription>
              Delivery status and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsVisualization reportType="deliveries" data={deliveriesData?.data || []} />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Deposits Visualization</CardTitle>
            <CardDescription>
              Deposit methods and amounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsVisualization reportType="deposits" data={depositsData?.data || []} />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Attendance Visualization</CardTitle>
            <CardDescription>
              Attendance patterns and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsVisualization reportType="attendance" data={attendanceData?.data || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};