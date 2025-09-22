import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { SalesListWithFilter } from '@/features/sales-management/components';

// Types
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

// API functions
const fetchSales = async (): Promise<Sale[]> => {
  const response = await apiClient.get('/api/sales');
  // Ensure liters and amount are numbers
  return response.data.data.map((sale: any) => ({
    ...sale,
    liters: typeof sale.liters === 'string' ? parseFloat(sale.liters) : sale.liters,
    amount: typeof sale.amount === 'string' ? parseFloat(sale.amount) : sale.amount
  }));
};

const SalesFilterPage = () => {
  // Fetch sales data
  const { data: sales = [], isLoading, isError } = useQuery({
    queryKey: ['sales'],
    queryFn: fetchSales
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading sales...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error Loading Sales</div>
          <div className="text-gray-600 mb-4">Failed to load sales data. Please try again later.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales Report</h1>
        <p className="text-muted-foreground">
          Filter and view sales transactions
        </p>
      </div>
      
      <SalesListWithFilter sales={sales} />
    </div>
  );
};

export default SalesFilterPage;