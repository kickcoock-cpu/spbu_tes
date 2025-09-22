import React, { useState, useEffect } from 'react';
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
import { Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

interface Sale {
  id: number;
  spbu_id: number;
  operator_id: number;
  pump_number: number;
  fuel_type: string;
  liters: number;
  amount: number;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  SPBU?: {
    name: string;
    code: string;
  };
  operator?: {
    name: string;
    email: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string[];
  spbu_id?: number;
  SPBU?: {
    name: string;
    code: string;
  };
}

interface SalesListWithFilterProps {
  sales: Sale[];
}

export const SalesListWithFilter: React.FC<SalesListWithFilterProps> = ({ sales }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<string>('all');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('all');
  const { user } = useAuthStore().auth;

  // Fetch operators (only operators, not all users)
  // Filter based on user role - Admin can only see operators from their SPBU
  const { data: operators = [], refetch: refetchOperators } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      // Only Super Admin and Admin can fetch operators list
      // Operators don't have permission to access this endpoint
      if (user?.Role?.name !== 'Super Admin' && user?.Role?.name !== 'Admin') {
        return [];
      }
      
      try {
        const response = await userApi.getOperators();
        let operatorsData = response.data.data;
        
        // If user is Admin, filter operators to only show those from their SPBU
        if (user?.Role?.name === 'Admin') {
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
    enabled: user?.Role?.name === 'Super Admin' || user?.Role?.name === 'Admin'
  });

  // Get unique fuel types
  const fuelTypes = Array.from(new Set(sales.map(sale => sale.fuel_type)));

  // Filter sales based on search term, selected operator, and fuel type
  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.fuel_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.SPBU?.name && sale.SPBU.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.SPBU?.code && sale.SPBU.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.operator?.name && sale.operator.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesOperator = 
      selectedOperator === 'all' || 
      sale.operator_id.toString() === selectedOperator;
    
    const matchesFuelType = 
      selectedFuelType === 'all' || 
      sale.fuel_type === selectedFuelType;
    
    // Filter based on user role
    let roleFilter = true;
    if (user?.Role?.name === 'Admin') {
      // Admin can only see sales from their SPBU
      roleFilter = sale.spbu_id === user.spbu_id;
    }
    
    return matchesSearch && matchesOperator && matchesFuelType && roleFilter;
  });

  // Calculate totals
  const totalSales = filteredSales.length;
  const totalLiters = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.liters.toString()), 0);
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

  // Refetch operators when component mounts
  useEffect(() => {
    refetchOperators();
  }, [refetchOperators]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CardDescription>
              Number of transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Liters</CardTitle>
            <CardDescription>
              Volume of fuel sold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLiters.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              liters
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <CardDescription>
              Revenue generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              IDR
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Filter</CardTitle>
          <CardDescription>
            Filter sales by operator, fuel type, or search term
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            {/* Only show operator filter for Super Admin and Admin */}
            {(user?.Role?.name === 'Super Admin' || user?.Role?.name === 'Admin') && (
              <div>
                <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Operators</SelectItem>
                    {operators.map((operator: User) => (
                      <SelectItem key={operator.id} value={operator.id.toString()}>
                        {operator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                <SelectTrigger>
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
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedOperator('all');
                setSelectedFuelType('all');
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
          <CardDescription>
            List of all sales transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>SPBU</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead className="text-right">Liters</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">No sales found</div>
                      {(searchTerm || selectedOperator !== 'all' || selectedFuelType !== 'all') && (
                        <div className="text-sm text-gray-500">
                          No sales match your filters
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {new Date(sale.transaction_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      {sale.SPBU ? `${sale.SPBU.name} (${sale.SPBU.code})` : '-'}
                    </TableCell>
                    <TableCell>
                      {sale.operator ? sale.operator.name : '-'}
                    </TableCell>
                    <TableCell>{sale.fuel_type}</TableCell>
                    <TableCell className="text-right">{parseFloat(sale.liters.toString()).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{formatCurrency(parseFloat(sale.amount.toString()))}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};