import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, Calendar, CreditCard, Fuel, DollarSign, Download, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { DatePicker } from '@/components/date-picker';
import { hasFullAccess, hasReadOnlyAccess } from '@/lib/rbac';

interface SalesReportItem {
  id: number;
  date: string;
  spbu: string;
  fuelType: string;
  quantity: number;
  amount: number;
  operator: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string[];
  spbu_id?: number;
}

interface SalesFilterComponentProps {
  sales: SalesReportItem[];
  onFilterChange: (filters: {
    searchTerm: string;
    selectedOperators: string[];
    selectedFuelType: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

export const SalesFilterComponent: React.FC<SalesFilterComponentProps> = ({ sales, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [selectedFuelType, setSelectedFuelType] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user } = useAuthStore().auth;

  // Check if user has access to sales management
  const userHasAccess = user ? hasReadOnlyAccess(user, 'sales') : false;
  const userHasFullAccess = user ? hasFullAccess(user, 'sales') : false;

  // Fetch operators (only operators, not all users)
  // Filter based on user role - Admin can only see operators from their SPBU
  const { data: operators = [], refetch: refetchOperators } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      // Only Super Admin and Admin can fetch operators list
      // Operators don't have permission to access this endpoint
      const userRole = Array.isArray(user?.role) ? user.role : [];
      const isSuperAdmin = userRole.includes('Super Admin');
      const isAdmin = userRole.includes('Admin');
      
      if (!isSuperAdmin && !isAdmin) {
        return [];
      }
      
      try {
        const response = await userApi.getOperators();
        let operatorsData = response.data.data;
        
        // If user is Admin, filter operators to only show those from their SPBU
        if (isAdmin && user?.spbu_id) {
          operatorsData = operatorsData.filter((operator: User) => 
            operator.spbu_id === user.spbu_id
          );
        }
        
        return operatorsData;
      } catch (error: any) {
        // Handle 403 errors gracefully for roles that don't have access
        if (error.response?.status === 403) {
          console.log('User does not have permission to fetch operators list');
          return [];
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Only enable query for users with appropriate permissions
    enabled: userHasAccess && (Array.isArray(user?.role) ? (user.role.includes('Super Admin') || user.role.includes('Admin')) : false)
  });

  // Get unique fuel types
  const fuelTypes = Array.from(new Set(sales.map(sale => sale.fuelType)));

  // Call onFilterChange when filters change
  useEffect(() => {
    // Convert dates to string format for API
    const startDateStr = startDate ? startDate.toISOString().split('T')[0] : undefined;
    const endDateStr = endDate ? endDate.toISOString().split('T')[0] : undefined;
    
    onFilterChange({
      searchTerm,
      selectedOperators,
      selectedFuelType,
      startDate: startDateStr,
      endDate: endDateStr
    });
  }, [searchTerm, selectedOperators, selectedFuelType, startDate, endDate, onFilterChange]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOperators, selectedFuelType, startDate, endDate]);

  // Refetch operators when component mounts
  useEffect(() => {
    if (userHasAccess) {
      refetchOperators();
    }
  }, [refetchOperators, userHasAccess]);

  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null;
  }

  // For now, we'll display all sales as they are already filtered by the backend
  // In a future implementation, we might add frontend filtering as well
  const filteredSales = sales;

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = useMemo(() => {
    return filteredSales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSales, currentPage, itemsPerPage]);

  // Calculate totals
  const totalSales = filteredSales.length;
  const totalLiters = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.quantity.toString()), 0);
  const totalAmount = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.amount.toString()), 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number for CSV
  const formatNumberForCSV = (number: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  // Refetch operators when component mounts
  useEffect(() => {
    if (userHasAccess) {
      refetchOperators();
    }
  }, [refetchOperators, userHasAccess]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOperators, selectedFuelType, startDate, endDate]);

  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null;
  }

  // Download CSV
  const handleDownloadCSV = () => {
    try {
      if (filteredSales.length === 0) {
        alert('No data to export. Please adjust your filters.');
        return;
      }

      const headers = ['Date', 'SPBU', 'Operator', 'Fuel Type', 'Liters', 'Amount (IDR)'];
      const csvContent = [
        headers.join(','),
        ...filteredSales.map(sale => [
          new Date(sale.date).toLocaleDateString('id-ID'),
          sale.spbu,
          sale.operator,
          sale.fuelType,
          formatNumberForCSV(parseFloat(sale.quantity.toString())),
          parseFloat(sale.amount.toString()).toFixed(2)
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  // Download PDF (simplified version)
  const handleDownloadPDF = () => {
    try {
      if (filteredSales.length === 0) {
        alert('No data to export. Please adjust your filters.');
        return;
      }

      // In a real application, you would use a library like jsPDF
      // For now, we'll create a simple text version
      let pdfContent = `Sales Report\n\n`;
      pdfContent += `Generated on: ${new Date().toLocaleDateString('id-ID')}\n\n`;
      pdfContent += `Filters applied:\n`;
      pdfContent += `- Search term: ${searchTerm || 'None'}\n`;
      pdfContent += `- Selected operators: ${selectedOperators.length > 0 ? selectedOperators.map(name => name).join(', ') : 'All'}\n`;
      pdfContent += `- Fuel type: ${selectedFuelType === 'all' ? 'All' : selectedFuelType}\n`;
      if (user && (user.role.includes('Super Admin') || user.role.includes('Admin'))) {
        pdfContent += `- Date range: ${startDate ? startDate.toLocaleDateString('id-ID') : 'Any'} to ${endDate ? endDate.toLocaleDateString('id-ID') : 'Any'}\n`;
      }
      pdfContent += `\n\n`;
      
      pdfContent += `Date\t\t\tSPBU\t\t\t\tOperator\t\t\tFuel Type\tLiters\t\tAmount (IDR)\n`;
      pdfContent += `----\t\t\t----\t\t\t\t--------\t\t\t---------\t------\t\t-----------\n`;
      
      filteredSales.forEach(sale => {
        pdfContent += `${new Date(sale.date).toLocaleDateString('id-ID')}\t\t`;
        pdfContent += `${sale.spbu}\t\t\t`;
        pdfContent += `${sale.operator}\t\t\t`;
        pdfContent += `${sale.fuelType}\t\t`;
        pdfContent += `${parseFloat(sale.quantity.toString()).toFixed(2)}\t\t`;
        pdfContent += `${parseFloat(sale.amount.toString()).toFixed(2)}\n`;
      });
      
      pdfContent += `\n\nSummary:\n`;
      pdfContent += `Total Sales: ${totalSales}\n`;
      pdfContent += `Total Liters: ${totalLiters.toLocaleString('id-ID', { minimumFractionDigits: 2 })}\n`;
      pdfContent += `Total Amount: ${formatCurrency(totalAmount)}\n`;
      
      const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-blue-800">Total Sales</CardTitle>
              <div className="p-2 bg-blue-200 rounded-full">
                <CreditCard className="h-4 w-4 text-blue-700" />
              </div>
            </div>
            <CardDescription className="text-blue-600 text-xs">
              Number of transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalSales}</div>
            <p className="text-xs text-blue-700 mt-1">
              transactions
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-green-800">Total Liters</CardTitle>
              <div className="p-2 bg-green-200 rounded-full">
                <Fuel className="h-4 w-4 text-green-700" />
              </div>
            </div>
            <CardDescription className="text-green-600 text-xs">
              Volume of fuel sold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{totalLiters.toLocaleString()}</div>
            <p className="text-xs text-green-700 mt-1">
              liters
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-purple-800">Total Amount</CardTitle>
              <div className="p-2 bg-purple-200 rounded-full">
                <DollarSign className="h-4 w-4 text-purple-700" />
              </div>
            </div>
            <CardDescription className="text-purple-600 text-xs">
              Revenue generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-purple-700 mt-1">
              IDR
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Sales Data</CardTitle>
              <CardDescription className="text-gray-600">
                List of sales transactions based on applied filters
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={handleDownloadCSV}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download CSV</span>
                <span className="sm:hidden">CSV</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by fuel type, SPBU, or operator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2"
                />
              </div>
            </div>
          </div>

          {/* Main Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Operators Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Operators</label>
              <div className="space-y-2">
                <Select 
                  onValueChange={(value) => {
                    if (value === 'all') {
                      setSelectedOperators([]);
                    } else if (!selectedOperators.includes(value)) {
                      setSelectedOperators([...selectedOperators, value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select operators" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Operators</SelectItem>
                    {operators.map((operator: User) => (
                      <SelectItem 
                        key={operator.id} 
                        value={operator.name}
                        disabled={selectedOperators.includes(operator.name)}
                      >
                        {operator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Display selected operators as tags */}
                {selectedOperators.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedOperators.map((operatorName) => {
                      return (
                        <div 
                          key={operatorName} 
                          className="flex items-center bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200"
                        >
                          <span className="truncate max-w-[120px]">{operatorName}</span>
                          <button 
                            type="button" 
                            className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                            onClick={() => setSelectedOperators(selectedOperators.filter(name => name !== operatorName))}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Fuel Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Fuel Type</label>
              <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fuel Types</SelectItem>
                  {fuelTypes.map(fuelType => (
                    <SelectItem key={fuelType} value={fuelType}>
                      {fuelType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filters - Visible only for Super Admin and Admin */}
            {user && (user.role.includes('Super Admin') || user.role.includes('Admin')) ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <DatePicker 
                    selected={startDate} 
                    onSelect={setStartDate}
                    placeholder="Select start date"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <DatePicker 
                    selected={endDate} 
                    onSelect={setEndDate}
                    placeholder="Select end date"
                  />
                </div>
              </>
            ) : (
              <div className="md:col-span-2 flex items-center justify-center bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 text-center">
                  <Calendar className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                  Date filtering available for Super Admin and Admin only
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                setSearchTerm('');
                setSelectedOperators([]);
                setSelectedFuelType('all');
                // Clear date filters only for Super Admin and Admin
                if (user && (user.role.includes('Super Admin') || user.role.includes('Admin'))) {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }
              }}
            >
              <Filter className="h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Sales Transactions</CardTitle>
              <CardDescription className="text-gray-600">
                List of all sales transactions
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSales.length)} of {filteredSales.length} transactions
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleDownloadCSV}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">CSV</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleDownloadPDF}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700 py-3">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3">SPBU</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3">Operator</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3">Fuel Type</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right py-3">Liters</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right py-3">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                          <CreditCard className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="text-gray-500 font-medium mb-1">No sales found</div>
                        {(searchTerm || selectedOperators.length > 0 || selectedFuelType !== 'all' || 
                          (user && (user.role.includes('Super Admin') || user.role.includes('Admin')) && (startDate || endDate))) && (
                          <div className="text-sm text-gray-400">
                            No sales match your filters. Try adjusting your search criteria.
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSales.map((sale) => (
                    <TableRow 
                      key={sale.id} 
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <TableCell className="font-medium py-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(sale.date).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        {sale.spbu}
                      </TableCell>
                      <TableCell className="py-3">
                        {sale.operator}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {sale.fuelType}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono py-3">{parseFloat(sale.quantity.toString()).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-green-600 py-3">{formatCurrency(parseFloat(sale.amount.toString()))}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 px-4 py-3 sm:px-6 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Rows per page:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredSales.length)}</span> of{' '}
                    <span className="font-medium">{filteredSales.length}</span> results
                  </p>
                </div>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === pageNum 
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                        ...
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(totalPages)}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </nav>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};