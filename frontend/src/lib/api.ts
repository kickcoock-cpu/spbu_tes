import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import { getCookie } from '@/lib/cookies'

// Buat instance axios dengan konfigurasi dasar
export const apiClient = axios.create({
  // Gunakan URL langsung ke backend dengan dukungan environment variable
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000, // 30 detik
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Add this to ensure cookies are sent with requests
})

// Tambahkan interceptor untuk menangani error 405
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 405) {
      console.error('Method Not Allowed (405) - Check API endpoint and method');
      // Bisa menambahkan logika untuk redirect ke halaman error atau mencoba ulang
    }
    return Promise.reject(error);
  }
);

// Interceptor untuk request
apiClient.interceptors.request.use(
  (config) => {
    console.log('=== API REQUEST ===');
    console.log('Method:', config.method?.toUpperCase());
    console.log('URL:', config.url);
    console.log('Request data:', config.data);
    
    // Try to get token from cookie first, then from auth store
    const cookieToken = getCookie('accessToken');
    const storeToken = useAuthStore.getState().auth.accessToken;
    
    console.log('Cookie token:', cookieToken ? 'Present' : 'Missing');
    console.log('Store token:', storeToken ? 'Present' : 'Missing');
    
    const token = cookieToken || storeToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set with token (first 20 chars):', token.substring(0, 20) + '...');
    } else {
      console.log('No token available for Authorization header');
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
)

// Interceptor untuk response
apiClient.interceptors.response.use(
  (response) => {
    console.log('=== API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('URL:', response.config.url);
    console.log('Response data:', response.data);
    // Log the structure of the response data for reports
    if (response.config.url?.includes('/api/reports/sales') && response.data.data) {
      console.log('Sales report response structure:', {
        hasData: !!response.data.data.data,
        dataLength: response.data.data.data?.length,
        firstItem: response.data.data.data?.[0],
        sampleData: response.data.data.data?.slice(0, 3)
      });
    }
    // Log the structure of the response data for dashboard
    if (response.config.url?.includes('/api/dashboard') && response.data.data) {
      console.log('Dashboard response structure:', {
        hasData: !!response.data.data,
        dataKeys: response.data.data ? Object.keys(response.data.data) : 'null/undefined',
        adjustmentMetrics: response.data.data?.adjustmentMetrics
      });
    }
    return response;
  },
  (error) => {
    console.error('=== API RESPONSE ERROR ===');
    console.error('Error:', error);
    console.error('Error config:', error.config);
    
    // Tangani error network
    if (!error.response) {
      console.error('Network Error: Could not connect to the server');
    } else {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    
    // Tangani token expired
    if (error.response?.status === 401) {
      console.log('Token expired, resetting auth');
      useAuthStore.getState().auth.reset();
      
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/sign-in')) {
        const redirect = window.location.href;
        window.location.href = `/sign-in?redirect=${encodeURIComponent(redirect)}`;
      }
    }
    
    // Jangan redirect ke halaman error untuk error 500, biarkan aplikasi menangani
    // Error 500 akan ditangani oleh query cache
    
    return Promise.reject(error);
  }
)

// API endpoints
export const userApi = {
  login: (credentials: any) => {
    console.log('Attempting login with credentials:', credentials);
    return apiClient.post('/api/users/login', credentials);
  },
  getMe: () => apiClient.get('/api/users/me'),
  register: (userData: any) => apiClient.post('/api/users/register', userData),
  getAll: () => apiClient.get('/api/users'),
  getOperators: () => apiClient.get('/api/users/operators'), // Tambahkan ini
  getById: (id: number) => apiClient.get(`/api/users/${id}`),
  update: (id: number, data: any) => apiClient.put(`/api/users/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/users/${id}`),
  updateProfile: (data: any) => apiClient.put('/api/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    apiClient.put('/api/users/me/password', data),
  changeEmail: (data: { newEmail: string; password: string }) => 
    apiClient.put('/api/users/me/email', data),
  deleteAccount: (password: string) => 
    apiClient.delete('/api/users/me', { data: { password } }),
}

export const menuApi = {
  getMenu: () => apiClient.get('/api/menu'),
}

export const authApi = {
  login: (credentials: any) => {
    console.log('Attempting login with credentials:', credentials);
    return apiClient.post('/api/users/login', credentials);
  },
  getMe: () => apiClient.get('/api/users/me'),
  register: (userData: any) => apiClient.post('/api/users/register', userData),
}

export const spbuApi = {
  getAll: () => apiClient.get('/api/spbu'),
  getById: (id: number) => apiClient.get(`/api/spbu/${id}`),
  create: (data: any) => apiClient.post('/api/spbu', data),
  update: (id: number, data: any) => apiClient.put(`/api/spbu/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/spbu/${id}`),
}

export const tankApi = {
  getAll: () => {
    console.log('tankApi.getAll called');
    return apiClient.get('/api/tanks');
  },
  getById: (id: number) => {
    console.log('tankApi.getById called with id:', id);
    return apiClient.get(`/api/tanks/${id}`);
  },
  create: (data: any) => {
    console.log('tankApi.create called with data:', data);
    return apiClient.post('/api/tanks', data);
  },
  update: (id: number, data: any) => {
    console.log('tankApi.update called with id:', id, 'and data:', data);
    return apiClient.put(`/api/tanks/${id}`, data);
  },
  delete: (id: number) => {
    console.log('tankApi.delete called with id:', id);
    return apiClient.delete(`/api/tanks/${id}`);
  },
}

export const salesApi = {
  getAll: () => apiClient.get('/api/sales'),
  getById: (id: number) => apiClient.get(`/api/sales/${id}`),
  create: (data: any) => apiClient.post('/api/sales', data),
  getByOperator: (operatorId: number) => apiClient.get(`/api/sales/by-operator/${operatorId}`),
}

export const reportsApi = {
  getSalesReport: (params: any) => {
    console.log('API call - Fetching sales report with params:', params);
    return apiClient.get('/api/reports/sales', { params });
  },
  getDeliveryReport: (params: any) => apiClient.get('/api/reports/deliveries', { params }),
  getDepositReport: (params: any) => apiClient.get('/api/reports/deposits', { params }),
  getAttendanceReport: (params: any) => apiClient.get('/api/reports/attendance', { params }),
  getAdjustmentReport: (params: any) => {
    console.log('API call - Fetching adjustment report with params:', params);
    return apiClient.get('/api/reports/adjustments', { params });
  },
  getLedgerReport: (params: any) => {
    console.log('API call - Fetching ledger report with params:', params);
    return apiClient.get('/api/reports/ledger', { params });
  },
}