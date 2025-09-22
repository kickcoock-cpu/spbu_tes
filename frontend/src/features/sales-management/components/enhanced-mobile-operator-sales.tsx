import React, { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Fuel, 
  CreditCard, 
  Droplets, 
  Gauge, 
  Zap, 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothSearching, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Send,
  Mic,
  MicOff,
  History,
  TrendingUp,
  Check,
  X,
  Sun,
  Moon,
  Settings,
  BarChart3,
  Wifi
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { useIsMobile } from '@/hooks/use-mobile'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface Tank {
  id: number
  name: string
  fuel_type: string
  capacity: number
  current_stock: number
  spbu_id?: number
  SPBU?: {
    id: number
    name: string
    code: string
  }
  created_at?: string
  updated_at?: string
  current_price?: number
}

interface Price {
  id: number
  fuel_type: string
  price: string
  effective_date: string
  spbu_id: number | null
  created_at: string
  updated_at: string
}

interface SaleFormData {
  fuel_type: string
  liters: number
  amount: number
}

interface BluetoothDeviceStatus {
  name: string
  rssi: number
  connected: boolean
}

// API functions
const fetchTanks = async (): Promise<Tank[]> => {
  console.log('Fetching tanks...');
  const response = await apiClient.get('/api/tanks')
  console.log('Tanks response:', response.data);
  const tanksData = response.data.data
  
  // Ensure tank data has proper numeric values
  return tanksData.map(tank => ({
    ...tank,
    capacity: typeof tank.capacity === 'string' ? parseFloat(tank.capacity) : tank.capacity,
    current_stock: typeof tank.current_stock === 'string' ? parseFloat(tank.current_stock) : tank.current_stock
  }))
}

const fetchPrices = async (): Promise<Price[]> => {
  console.log('Fetching prices...');
  const response = await apiClient.get('/api/prices')
  console.log('Prices response:', response.data);
  return response.data.data
}

const createSale = async (saleData: any): Promise<any> => {
  console.log('Creating sale', saleData);
  const response = await apiClient.post('/api/sales', saleData)
  console.log('Sale created', response.data);
  return response.data.data
}

export const EnhancedMobileOperatorSales = () => {
  console.log('EnhancedMobileOperatorSales component rendering')
  const queryClient = useQueryClient()
  const { user } = useAuthStore().auth
  const isMobile = useIsMobile()
  
  const [formData, setFormData] = useState<SaleFormData>({
    fuel_type: '',
    liters: 0,
    amount: 0,
  })
  const [prices, setPrices] = useState<Price[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [displayLiters, setDisplayLiters] = useState('')
  const [autoSubmit, setAutoSubmit] = useState(false)
  
  // Voice input states
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  
  // Bluetooth states
  const [bluetoothSupported, setBluetoothSupported] = useState(false)
  const [bluetoothConnected, setBluetoothConnected] = useState(false)
  const [bluetoothConnecting, setBluetoothConnecting] = useState(false)
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState('')
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDeviceStatus[]>([])
  const [bluetoothScanning, setBluetoothScanning] = useState(false)
  const bluetoothSocketRef = useRef<any>(null)
  const characteristicRef = useRef<any>(null)
  
  // Input refs
  const litersInputRef = useRef<HTMLInputElement>(null)
  
  // Check if we're online/offline
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Offline transactions storage
  const [offlineTransactions, setOfflineTransactions] = useState<any[]>([]);
  
  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Online status changed to online');
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.log('Online status changed to offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load offline transactions from localStorage on component mount
  useEffect(() => {
    console.log('Loading offline transactions from localStorage');
    const savedTransactions = localStorage.getItem('offline-sales-transactions');
    if (savedTransactions) {
      try {
        setOfflineTransactions(JSON.parse(savedTransactions));
      } catch (error) {
        console.error('Error parsing offline transactions:', error);
        localStorage.removeItem('offline-sales-transactions');
      }
    }
  }, []);
  
  // Save offline transactions to localStorage whenever they change
  useEffect(() => {
    console.log('Saving offline transactions to localStorage', offlineTransactions.length);
    if (offlineTransactions.length > 0) {
      localStorage.setItem('offline-sales-transactions', JSON.stringify(offlineTransactions));
    } else {
      localStorage.removeItem('offline-sales-transactions');
    }
  }, [offlineTransactions]);
  
  // Try to sync offline transactions when coming back online
  useEffect(() => {
    console.log('Checking if we should sync offline transactions', { isOnline, offlineTransactions: offlineTransactions.length });
    if (isOnline && offlineTransactions.length > 0) {
      // Wrap in async IIFE to handle await
      (async () => {
        await syncOfflineTransactions();
      })();
    }
  }, [isOnline, offlineTransactions]);
  
  // Sync offline transactions with server
  const syncOfflineTransactions = async () => {
    console.log('Syncing offline transactions', offlineTransactions.length);
    if (offlineTransactions.length === 0) return;
    
    toast.info(`Syncing ${offlineTransactions.length} offline transactions...`);
    
    const syncedTransactions = [];
    const failedTransactions = [...offlineTransactions];
    
    for (const transaction of offlineTransactions) {
      try {
        await createSale(transaction);
        syncedTransactions.push(transaction);
      } catch (error) {
        console.error('Error syncing offline transaction:', error);
      }
    }
    
    // Remove synced transactions from offline storage
    if (syncedTransactions.length > 0) {
      const remainingTransactions = offlineTransactions.filter(
        t => !syncedTransactions.some(st => st.timestamp === t.timestamp)
      );
      
      setOfflineTransactions(remainingTransactions);
      
      toast.success(
        `Successfully synced ${syncedTransactions.length} offline transactions!`,
        {
          description: `${remainingTransactions.length} transactions still pending`,
        }
      );
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['tanks'] });
      await queryClient.invalidateQueries({ queryKey: ['sales'] });
    }
  };
  
  // Save transaction locally when offline
  const saveOfflineTransaction = (transactionData: any) => {
    console.log('Saving transaction offline', transactionData);
    const offlineTransaction = {
      ...transactionData,
      timestamp: new Date().toISOString(),
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setOfflineTransactions(prev => [...prev, offlineTransaction]);
    
    toast.info('Transaction saved offline', {
      description: 'Will be synced when connection is restored',
      duration: 5000,
    });
  };

  // Fetch tanks using React Query
  const { data: tanks = [], isLoading: tanksLoading } = useQuery({
    queryKey: ['tanks'],
    queryFn: fetchTanks,
    // Removed refetchInterval to prevent continuous refreshing
  })
  
  console.log('Tanks query result:', { tanks, tanksLoading });

  // Fetch prices
  const { data: pricesData = [], isLoading: pricesLoading } = useQuery({
    queryKey: ['prices'],
    queryFn: fetchPrices,
  })
  
  console.log('Prices query result:', { pricesData, pricesLoading });

  console.log('Prices query result:', { pricesData, pricesLoading });

  useEffect(() => {
    console.log('Setting prices');
    setPrices(pricesData)
  }, [pricesData])

  // Get available fuel types from tanks
  const availableFuelTypes = Array.from(
    new Set(tanks.map(tank => tank.fuel_type))
  ).filter(Boolean) as string[]
  
  console.log('Available fuel types calculated:', availableFuelTypes);

  // Calculate fill percentage
  const getFillPercentage = (current: number, capacity: number) => {
    // Ensure we have valid numbers
    const validCurrent = typeof current === 'number' ? current : parseFloat(current as any) || 0
    const validCapacity = typeof capacity === 'number' ? capacity : parseFloat(capacity as any) || 0
    
    if (validCapacity <= 0) return 0
    return Math.min(100, Math.max(0, (validCurrent / validCapacity) * 100))
  }

  // Get status text based on fill level
  const getStatusText = (percentage: number) => {
    if (percentage < 20) return 'Critical'
    if (percentage < 50) return 'Low'
    if (percentage < 80) return 'Normal'
    return 'Good'
  }

  // Get status color based on fill level
  const getStatusColor = (percentage: number) => {
    if (percentage < 20) return 'text-red-600 bg-red-100 border-red-200'
    if (percentage < 50) return 'text-yellow-600 bg-yellow-100 border-yellow-200'
    if (percentage < 80) return 'text-blue-600 bg-blue-100 border-blue-200'
    return 'text-green-600 bg-green-100 border-green-200'
  }

  // Format number properly for Indonesian locale without leading zeros
  const formatNumber = (num: number): string => {
    // Handle invalid numbers
    if (isNaN(num) || !isFinite(num)) {
      return '0';
    }
    
    // Use Indonesian locale formatting
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  }

  // Get tanks by fuel type
  const getTanksByFuelType = (fuelType: string) => {
    return tanks.filter(tank => tank.fuel_type === fuelType)
  }

  // Get total stock for a fuel type
  const getTotalStockByFuelType = (fuelType: string) => {
    const fuelTanks = getTanksByFuelType(fuelType)
    const total = fuelTanks.reduce((total, tank) => total + (tank.current_stock || 0), 0)
    return typeof total === 'number' ? total : parseFloat(total as any) || 0
  }

  // Get total capacity for a fuel type
  const getTotalCapacityByFuelType = (fuelType: string) => {
    const fuelTanks = getTanksByFuelType(fuelType)
    const total = fuelTanks.reduce((total, tank) => total + (tank.capacity || 0), 0)
    return typeof total === 'number' ? total : parseFloat(total as any) || 0
  }

  // Get current price for a fuel type
  const getCurrentPrice = (fuelType: string) => {
    // First, try to get price from tanks data if available
    const tankWithPrice = tanks.find(tank => 
      tank.fuel_type === fuelType && 
      tank.current_price !== undefined
    )
    
    if (tankWithPrice && tankWithPrice.current_price) {
      return tankWithPrice.current_price
    }
    
    // Fall back to prices data if tank price not available
    // Find the most recent price for this fuel type for the user's SPBU or global price
    const relevantPrices = prices.filter(price => 
      price.fuel_type === fuelType && 
      (price.spbu_id === null || price.spbu_id === user?.spbu_id)
    )
    
    // Sort by effective date (newest first)
    relevantPrices.sort((a, b) => 
      new Date(b.effective_date || b.created_at).getTime() - new Date(a.effective_date || a.created_at).getTime()
    )
    
    return relevantPrices.length > 0 ? parseFloat(relevantPrices[0].price) : 0
  }

  // Set initial fuel type when tanks are loaded
  useEffect(() => {
    console.log('Tanks loaded:', tanks.length, 'Current fuel type:', formData.fuel_type);
    if (tanks.length > 0 && !formData.fuel_type) {
      const availableFuelTypes = Array.from(
        new Set(tanks.map(tank => tank.fuel_type))
      ).filter(Boolean) as string[]
      console.log('Available fuel types:', availableFuelTypes);
      
      if (availableFuelTypes.length > 0) {
        setFormData(prev => ({
          ...prev,
          fuel_type: availableFuelTypes[0]
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          fuel_type: '__no_fuel_types__'
        }))
      }
    }
  }, [tanks]) // Remove formData.fuel_type from dependencies to prevent infinite loop

  // Update amount when fuel type or liters change
  useEffect(() => {
    if (formData.fuel_type) {
      const price = getCurrentPrice(formData.fuel_type)
      const amount = price * formData.liters
      setFormData(prev => ({
        ...prev,
        amount: parseFloat(amount.toFixed(2))
      }))
    }
  }, [formData.fuel_type, formData.liters])

  // Send transaction data to ESP32 when form data changes
  useEffect(() => {
    if (bluetoothConnected) {
      // Send transaction data to ESP32
      const transactionData = {
        fuel_type: formData.fuel_type,
        liters: formData.liters,
        price_per_liter: getCurrentPrice(formData.fuel_type),
        amount: formData.amount
      };
      
      // Send as JSON
      sendBluetoothCommand(`SET_TRANSACTION_DATA:${JSON.stringify(transactionData)}`);
    }
  }, [formData, bluetoothConnected, getCurrentPrice]);

  // Handle liters input change with comma support
  const handleLitersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDisplayLiters(value)
    
    // Replace comma with dot for processing
    const processedValue = value.replace(',', '.')
    
    // Check if it's a valid number
    if (processedValue === '' || /^\d*\.?\d*$/.test(processedValue)) {
      const numericValue = processedValue === '' ? 0 : parseFloat(processedValue)
      setFormData(prev => ({
        ...prev,
        liters: isNaN(numericValue) ? 0 : numericValue
      }))
    }
  }

  // Handle form changes
  const handleFormChange = (field: string, value: string | number) => {
    // Prevent manual editing of amount field
    if (field === 'amount') {
      return
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Form validation states
  const [formErrors, setFormErrors] = useState<{
    fuel_type?: string;
    liters?: string;
    amount?: string;
  }>({});

  // Validate form in real-time
  const validateForm = (field?: keyof SaleFormData) => {
    const errors: typeof formErrors = {};
    
    // Validate fuel type
    if (!formData.fuel_type || formData.fuel_type === '__no_fuel_types__') {
      errors.fuel_type = 'Please select a fuel type';
    }
    
    // Validate liters
    if (formData.liters <= 0) {
      errors.liters = 'Liters must be greater than 0';
    } else if (formData.fuel_type && formData.fuel_type !== '__no_fuel_types__') {
      const totalStock = getTotalStockByFuelType(formData.fuel_type);
      if (formData.liters > totalStock) {
        errors.liters = `Requested liters (${formatNumber(formData.liters)}L) exceed available stock (${formatNumber(totalStock)}L)`;
      }
    }
    
    // Validate amount
    if (formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    
    if (field) {
      // Only update the specific field error
      setFormErrors(prev => ({
        ...prev,
        [field]: errors[field]
      }));
    } else {
      // Update all errors
      setFormErrors(errors);
    }
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  // Validate fields when they change
  useEffect(() => {
    console.log('Validating fuel type field');
    validateForm('fuel_type');
  }, [formData.fuel_type]);

  useEffect(() => {
    console.log('Validating liters field');
    validateForm('liters');
  }, [formData.liters, formData.fuel_type]);

  useEffect(() => {
    console.log('Validating amount field');
    validateForm('amount');
  }, [formData.amount]);
  
  // Handle create sale
  const handleCreateSale = async () => {
    console.log('handleCreateSale called', { formData, isOnline });
    // Validate the entire form
    if (!validateForm()) {
      // Show toast with first error
      const firstError = Object.values(formErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }
    
    // Additional validation for available fuel types
    if (availableFuelTypes.length === 0) {
      toast.error('No fuel types available. Please check tank configuration.')
      return
    }
    
    // Prepare sale data without pump number
    const saleData = {
      fuel_type: formData.fuel_type,
      liters: formData.liters,
      amount: formData.amount
    }
    
    // If offline, save transaction locally
    if (!isOnline) {
      console.log('Saving transaction offline');
      saveOfflineTransaction(saleData);
      
      // Reset form
      setFormData({
        fuel_type: formData.fuel_type, // Keep the same fuel type
        liters: 0,
        amount: 0
      })
      setDisplayLiters('')
      
      // Clear form errors
      setFormErrors({})
      
      return;
    }
    
    console.log('Creating sale online', saleData);
    try {
      setSubmitting(true)
      
      // Create the sale (backend will handle tank stock reduction)
      const response = await createSale(saleData)
      const createdSale = response;
      
      // Reset form
      setFormData({
        fuel_type: formData.fuel_type, // Keep the same fuel type
        liters: 0,
        amount: 0
      })
      setDisplayLiters('')
      
      // Clear form errors
      setFormErrors({})
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['tanks'] })
      await queryClient.invalidateQueries({ queryKey: ['sales'] })
      
      // Enhanced success toast with more details including transaction ID
      const transactionId = createdSale.transaction_id || 'N/A';
      toast.success(`✅ Sale completed successfully!`, {
        description: (
          <div>
            <div>{formatNumber(formData.liters)}L of {formData.fuel_type} sold for Rp {formatNumber(formData.amount)}</div>
            <div className="text-xs mt-1">Transaction ID: {transactionId}</div>
          </div>
        ),
        duration: 7000,
        action: {
          label: 'View Sales',
          onClick: () => {
            // This would navigate to the sales list if needed
          }
        }
      })
      
      // Send confirmation to ESP32 device
      if (bluetoothConnected) {
        sendBluetoothCommand(`TRANSACTION_SUCCESS:${transactionId}`);
      }
      
      // Haptic feedback for successful transaction
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (error: any) {
      console.error('Error creating sale:', error)
      // Enhanced error toast with more details
      const errorMessage = error.response?.data?.message || 'Failed to create sale'
      toast.error(`❌ Sale failed`, {
        description: errorMessage,
        duration: 7000
      })
      
      // Send error to ESP32 device
      if (bluetoothConnected) {
        sendBluetoothCommand(`TRANSACTION_ERROR:${errorMessage}`);
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Check Bluetooth support
  useEffect(() => {
    console.log('Checking Bluetooth support...');
    console.log('navigator.bluetooth:', typeof navigator !== 'undefined' ? navigator.bluetooth : 'undefined');
    
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.bluetooth) {
      console.log('Bluetooth is supported');
      setBluetoothSupported(true);
    } else {
      console.log('Bluetooth is not supported');
      console.log('Window object:', typeof window !== 'undefined' ? 'available' : 'not available');
      console.log('Navigator object:', typeof navigator !== 'undefined' ? 'available' : 'not available');
      console.log('Navigator.bluetooth:', typeof navigator !== 'undefined' && navigator.bluetooth ? 'available' : 'not available');
      setBluetoothSupported(false);
    }
  }, []);

  // Log Bluetooth state changes
  useEffect(() => {
    console.log('Bluetooth state changed:', { bluetoothSupported, bluetoothConnected });
  }, [bluetoothSupported, bluetoothConnected]);

  // Scan for Bluetooth devices
  const scanBluetoothDevices = async () => {
    if (!navigator.bluetooth) {
      toast.error('Bluetooth is not supported in your browser')
      return
    }

    try {
      setBluetoothScanning(true)
      console.log('Scanning for Bluetooth devices...')
      
      // Clear previous scan results
      setBluetoothDevices([])
      
      // Set timeout for scanning
      const scanTimeout = setTimeout(() => {
        setBluetoothScanning(false)
        if (bluetoothDevices.length === 0) {
          toast.info('No devices found. Please ensure your device is discoverable and try again.')
        }
      }, 15000) // 15 seconds timeout

      // Request device with better filtering options
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['00001101-0000-1000-8000-00805f9b34fb'] // Serial Port Service (lowercase)
      })

      // Clear timeout since we found a device
      clearTimeout(scanTimeout)

      console.log('Device found:', device.name)
      
      // Add to devices list with better handling
      setBluetoothDevices(prev => {
        const exists = prev.some(d => d.name === device.name)
        if (!exists) {
          return [...prev, {
            name: device.name || 'Unknown Device',
            rssi: device.rssi || 0,
            connected: false
          }]
        }
        return prev
      })

      toast.success(`Found device: ${device.name || 'ESP32 Device'}`)
    } catch (error: any) {
      console.error('Bluetooth scan error:', error)
      if (error.name !== 'NotFoundError') {
        toast.error(`❌ Scan failed`, {
          description: `Could not scan for devices: ${error.message || 'Unknown error'}`,
          duration: 5000
        })
      } else {
        // User cancelled the scan
        if (bluetoothDevices.length === 0) {
          toast.info('No devices found or scan cancelled.')
        }
      }
    } finally {
      setBluetoothScanning(false)
    }
  }

  // Connect to Bluetooth device
  const connectBluetooth = async (deviceName?: string) => {
    if (!navigator.bluetooth) {
      toast.error('Bluetooth is not supported in your browser')
      return
    }

    try {
      setBluetoothConnecting(true)
      console.log('Attempting to connect to Bluetooth device...')
      
      let device;
      
      if (deviceName) {
        // Connect to specific device
        device = await navigator.bluetooth.requestDevice({
          filters: [{ name: deviceName }],
          optionalServices: ['00001101-0000-1000-8000-00805f9b34fb'] // Serial Port Service (lowercase)
        })
      } else {
        // Connect to any device
        device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['00001101-0000-1000-8000-00805f9b34fb'] // Serial Port Service (lowercase)
        })
      }

      console.log('Device found:', device.name)

      // Connect to GATT server
      const server = await device.gatt.connect()
      console.log('GATT server connected')
      
      // Get primary service
      const service = await server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb') // lowercase
      console.log('Primary service obtained')
      
      // Get characteristic
      const characteristic = await service.getCharacteristic('00001101-0000-1000-8000-00805f9b34fb') // lowercase
      console.log('Characteristic obtained')
      
      // Set up event listener for incoming data
      characteristic.addEventListener('characteristicvaluechanged', handleBluetoothData)
      console.log('Event listener added')
      
      // Start notifications
      await characteristic.startNotifications()
      console.log('Notifications started')
      
      // Store reference
      bluetoothSocketRef.current = characteristic
      characteristicRef.current = characteristic
      
      // Update state
      setBluetoothConnected(true)
      setBluetoothDeviceName(device.name || 'ESP32 Device')
      console.log('Bluetooth connected to:', device.name || 'ESP32 Device')
      
      toast.success(`🔗 Connected to ${device.name || 'ESP32 Device'}`, {
        description: 'Device is ready for transactions',
        duration: 3000
      })
      
      // Request status from device
      await sendBluetoothCommand('GET_STATUS')
    } catch (error: any) {
      console.error('Bluetooth connection error:', error)
      setBluetoothConnecting(false)
      toast.error(`❌ Connection failed`, {
        description: `Could not connect to device: ${error.message || 'Unknown error'}`,
        duration: 5000
      })
    } finally {
      setBluetoothConnecting(false)
    }
  }

  // Disconnect from Bluetooth device
  const disconnectBluetooth = async () => {
    try {
      console.log('Attempting to disconnect from Bluetooth device...')
      if (bluetoothSocketRef.current) {
        await bluetoothSocketRef.current.service.device.gatt.disconnect()
        bluetoothSocketRef.current = null
        characteristicRef.current = null
        console.log('Bluetooth device disconnected')
      }
      
      setBluetoothConnected(false)
      setBluetoothDeviceName('')
      console.log('Bluetooth disconnected')
      toast.success(`✅ Disconnected`, {
        description: 'Successfully disconnected from device',
        duration: 3000
      })
    } catch (error: any) {
      console.error('Bluetooth disconnection error:', error)
      toast.error(`❌ Disconnection failed`, {
        description: `Could not disconnect from device: ${error.message || 'Unknown error'}`,
        duration: 5000
      })
    }
  }

  // Send command to Bluetooth device
  const sendBluetoothCommand = async (command: string) => {
    if (!characteristicRef.current) {
      console.warn('Not connected to device, cannot send command:', command)
      toast.error('Not connected to device')
      return
    }

    try {
      console.log('Sending Bluetooth command:', command)
      const encoder = new TextEncoder()
      await characteristicRef.current.writeValue(encoder.encode(command + '\n'))
      console.log('Bluetooth command sent successfully')
    } catch (error: any) {
      console.error('Error sending Bluetooth command:', error)
      toast.error(`Failed to send command: ${error.message || 'Unknown error'}`)
    }
  }

  // Handle incoming data from Bluetooth device
  const handleBluetoothData = (event: any) => {
    try {
      const value = event.target.value
      const decoder = new TextDecoder()
      const data = decoder.decode(value)
      
      console.log('Received from Bluetooth device:', data)
      
      // Handle different types of messages
      if (data.startsWith('SALE_DATA:')) {
        try {
          const jsonData = data.substring(10) // Remove 'SALE_DATA:' prefix
          const saleData = JSON.parse(jsonData)
          
          console.log('Parsed sale data:', saleData)
          
          // Update form with received data
          setFormData({
            fuel_type: saleData.fuel_type || formData.fuel_type,
            liters: saleData.liters || 0,
            amount: saleData.amount || 0
          })
          
          setDisplayLiters(saleData.liters?.toString() || '')
          
          toast.info(`Received transaction data from device: ${saleData.liters}L of ${saleData.fuel_type}`)
          
          // Auto-submit if enabled
          if (autoSubmit) {
            console.log('Auto-submit enabled, processing transaction...')
            // Small delay to ensure state is updated
            setTimeout(() => {
              handleCreateSale()
            }, 100)
          }
        } catch (error) {
          console.error('Error parsing sale data:', error)
          toast.error(`❌ Data parsing failed`, {
            description: 'Could not parse transaction data from device',
            duration: 5000
          })
        }
      } else if (data.startsWith('STATUS:')) {
        try {
          const jsonData = data.substring(7) // Remove 'STATUS:' prefix
          const statusData = JSON.parse(jsonData)
          console.log('Device status:', statusData)
          // You can update UI based on status if needed
        } catch (error) {
          console.error('Error parsing status data:', error)
        }
      } else if (data.startsWith('TRANSACTION_DATA_SET:')) {
        console.log('Transaction data successfully set on device')
        // Confirmation that transaction data was set
      } else if (data.startsWith('ERROR:')) {
        const errorMessage = data.substring(6) // Remove 'ERROR:' prefix
        console.error('Device error:', errorMessage)
        toast.error(`⚠️ Device Error`, {
          description: errorMessage,
          duration: 7000
        })
      } else if (data.startsWith('bufvolume:')) {
        // Handle volume data from ESP32 device
        try {
          const volumeData = data.substring(10); // Remove 'bufvolume:' prefix
          const volume = parseFloat(volumeData);
          
          if (!isNaN(volume) && volume > 0) {
            // Update form with volume data
            setFormData(prev => ({
              ...prev,
              liters: volume,
              amount: parseFloat((volume * getCurrentPrice(prev.fuel_type)).toFixed(2))
            }));
            
            setDisplayLiters(volume.toString());
            
            toast.info(`Volume received from device: ${volume}L`);
            
            // Auto-submit if enabled
            if (autoSubmit) {
              console.log('Auto-submit enabled, processing transaction...')
              setTimeout(() => {
                handleCreateSale()
              }, 100)
            }
          }
        } catch (error) {
          console.error('Error parsing volume data:', error)
          toast.error(`❌ Volume data parsing failed`, {
            description: 'Could not parse volume data from device',
            duration: 5000
          })
        }
      } else {
        console.log('Received unknown data type:', data)
      }
    } catch (error) {
      console.error('Error handling Bluetooth data:', error)
    }
  }

  // Request device status
  const requestDeviceStatus = () => {
    sendBluetoothCommand('GET_STATUS')
  }

  // Send test data
  const sendTestData = () => {
    const testData = {
      fuel_type: formData.fuel_type || 'Pertamax',
      liters: 10.5,
      amount: 15750
    }
    sendBluetoothCommand(`TEST_DATA:${JSON.stringify(testData)}`)
    
    // Also send volume data as separate command
    sendBluetoothCommand(`bufvolume:10.5`)
  }

  // Voice input functions
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setVoiceError('Speech recognition is not supported in your browser')
      toast.error('Speech recognition is not supported in your browser')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'id-ID' // Indonesian language

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceError(null)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log('Voice input result:', transcript)
      
      // Try to parse the transcript as a number
      const number = parseFloat(transcript.replace(/[^0-9.,]/g, '').replace(',', '.'))
      
      if (!isNaN(number) && number > 0) {
        setDisplayLiters(number.toString())
        setFormData(prev => ({
          ...prev,
          liters: number
        }))
        toast.success(`Voice input recognized: ${number}L`)
      } else {
        toast.error('Could not recognize a valid number from voice input')
        setVoiceError('Could not recognize a valid number')
      }
      
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error('Voice input error:', event.error)
      setVoiceError(`Voice input error: ${event.error}`)
      setIsListening(false)
      toast.error(`Voice input error: ${event.error}`)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('Error starting voice recognition:', error)
      setVoiceError('Error starting voice recognition')
      setIsListening(false)
      toast.error('Error starting voice recognition')
    }
  }

  const stopVoiceInput = () => {
    setIsListening(false)
  }

  // Quick action buttons for common amounts
  const handleQuickAmount = (liters: number) => {
    setDisplayLiters(liters.toString())
    setFormData(prev => ({
      ...prev,
      liters
    }))
  }

  if (tanksLoading || pricesLoading) {
    console.log('Loading data...', { tanksLoading, pricesLoading });
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-base">Loading data...</span>
        </div>
      </div>
    )
  }

  // If we get here, the component should render
  console.log('Rendering main component', { 
    tanks: tanks.length, 
    prices: prices.length, 
    formData, 
    availableFuelTypes: availableFuelTypes.length 
  });

  return (
    <div className="flex flex-col gap-6 pb-20 w-full max-w-full">
      {/* Bluetooth Connection Section with Tabs */}
      {bluetoothSupported && (
        <Card className="shadow-sm mx-0 rounded-none sm:mx-4 sm:rounded-lg border-2 border-transparent hover:border-blue-200 transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-3">
              <Bluetooth className="h-6 w-6" />
              ESP32 Device Connection
            </CardTitle>
            <CardDescription className="text-base">
              Connect to your ESP32 sales transaction device
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-5">
            {bluetoothSupported ? (
              <Tabs defaultValue="scan" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="scan" className="flex items-center gap-2">
                    <BluetoothSearching className="h-4 w-4" />
                    <span>Scan</span>
                  </TabsTrigger>
                  <TabsTrigger value="devices" className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span>Devices</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="scan" className="mt-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                      <Button
                        onClick={scanBluetoothDevices}
                        disabled={bluetoothScanning}
                        className="flex-1 h-14 text-base py-4 rounded-lg"
                        variant="outline"
                      >
                        {bluetoothScanning ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <BluetoothSearching className="h-5 w-5 mr-3" />
                            Scan for Devices
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => connectBluetooth()}
                        disabled={bluetoothConnecting}
                        className="flex-1 h-14 text-base py-4 rounded-lg"
                      >
                        {bluetoothConnecting ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Bluetooth className="h-5 w-5 mr-3" />
                            Quick Connect
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-2">
                      Scan for nearby ESP32 devices or connect directly to a previously connected device.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="devices" className="mt-4">
                  <div className="flex flex-col gap-4">
                    {bluetoothDevices.length > 0 ? (
                      <div className="mt-2">
                        <Label className="text-base font-medium mb-3 block">Available Devices</Label>
                        <div className="space-y-3">
                          {bluetoothDevices.map((device, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border"
                            >
                              <div className="flex items-center gap-3">
                                <Bluetooth className="h-5 w-5 text-blue-500" />
                                <span className="font-medium text-base">{device.name}</span>
                                <span className="text-sm text-gray-500">RSSI: {device.rssi}</span>
                              </div>
                              <Button 
                                size="lg" 
                                onClick={() => connectBluetooth(device.name)}
                                disabled={bluetoothConnecting || (bluetoothDeviceName === device.name && bluetoothConnected)}
                                className="h-10 px-4"
                              >
                                {bluetoothDeviceName === device.name && bluetoothConnected ? 'Connected' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Bluetooth className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="mt-2 text-gray-500">No devices found</p>
                        <p className="text-sm text-gray-400 mt-1">Scan for devices to populate this list</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-4">
                  <div className="flex flex-col gap-4">
                    {bluetoothConnected ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-200">
                          <div className="flex items-center gap-3">
                            <BluetoothConnected className="h-6 w-6 text-green-600" />
                            <span className="font-medium text-base">Connected to {bluetoothDeviceName}</span>
                          </div>
                          <span className="text-sm bg-green-100 text-green-800 px-3 py-2 rounded-full">
                            Connected
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={requestDeviceStatus}
                            variant="outline"
                            className="h-14 text-base py-4 rounded-lg"
                          >
                            <RefreshCw className="h-5 w-5 mr-3" />
                            Refresh Status
                          </Button>
                          
                          <Button
                            onClick={sendTestData}
                            variant="outline"
                            className="h-14 text-base py-4 rounded-lg"
                          >
                            <Send className="h-5 w-5 mr-3" />
                            Send Test Data
                          </Button>
                          
                          <Button
                            onClick={disconnectBluetooth}
                            variant="outline"
                            className="col-span-2 h-14 text-base py-4 rounded-lg"
                          >
                            Disconnect Device
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <BarChart3 className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="mt-2 text-gray-500">No device connected</p>
                        <p className="text-sm text-gray-400 mt-1">Connect to a device to access settings</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200 mt-4">
                      <input
                        type="checkbox"
                        id="autoSubmit"
                        checked={autoSubmit}
                        onChange={(e) => setAutoSubmit(e.target.checked)}
                        className="h-5 w-5"
                      />
                      <Label htmlFor="autoSubmit" className="text-base">
                        Auto-submit transactions from device
                      </Label>
                    </div>
                    
                    <p className="text-base text-gray-600">
                      {bluetoothConnected 
                        ? "Device is ready to send transaction data" 
                        : "Connect your ESP32 device to enable automatic transaction input"}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-base text-gray-600">
                <p className="mb-3">
                  Your browser does not support Web Bluetooth API. To use Bluetooth functionality, please use a browser that supports Web Bluetooth API such as:
                </p>
                <ul className="list-disc list-inside mb-3 space-y-1">
                  <li>Google Chrome (desktop or Android)</li>
                  <li>Microsoft Edge (desktop or Android)</li>
                  <li>Opera (desktop or Android)</li>
                </ul>
                <p>
                  Note: Safari and Firefox do not currently support Web Bluetooth API.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Sales Form */}
      <Card className="shadow-sm mx-0 rounded-none sm:mx-4 sm:rounded-lg border-2 border-transparent hover:border-blue-200 transition-all">
        <CardContent className="pb-6">
          <div className="flex flex-col gap-6">
            {/* Fuel Type Selection */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="fuel_type" className="text-base font-medium">Fuel Type</Label>
              <Select
                value={formData.fuel_type === '__no_fuel_types__' ? undefined : formData.fuel_type}
                onValueChange={(value) => handleFormChange('fuel_type', value)}
                disabled={availableFuelTypes.length === 0}
              >
                <SelectTrigger className="h-14 px-4 py-3 text-base rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <SelectValue placeholder={availableFuelTypes.length === 0 ? "No fuel types available" : "Select fuel type"} />
                </SelectTrigger>
                <SelectContent>
                  {availableFuelTypes.length > 0 ? (
                    availableFuelTypes.map(fuelType => {
                      const totalStock = getTotalStockByFuelType(fuelType);
                      const totalCapacity = getTotalCapacityByFuelType(fuelType);
                      const fillPercentage = totalCapacity > 0 ? getFillPercentage(totalStock, totalCapacity) : 0;
                      const statusText = getStatusText(fillPercentage);
                      
                      return (
                        <SelectItem key={fuelType} value={fuelType}>
                          <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{fuelType}</span>
                              <span className="text-xs ml-2 bg-gray-100 px-2 py-1 rounded">
                                Rp {getCurrentPrice(fuelType).toFixed(2)}/L
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                              <Droplets className="h-3 w-3" />
                              Stock: {formatNumber(totalStock)}L / {formatNumber(totalCapacity)}L ({fillPercentage.toFixed(1)}% {statusText})
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="__no_fuel_types__" disabled>
                      No fuel types available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                {availableFuelTypes.length === 0 
                  ? 'No fuel types available. Please contact administrator to configure tanks.' 
                  : 'Fuel types are based on available tanks'}
              </p>
            </div>

            {/* Liters Input with Voice Control */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="liters" className="text-base font-medium">Liters</Label>
              <div className="relative">
                <input
                  ref={litersInputRef}
                  id="liters"
                  type="text"
                  inputMode="decimal"
                  value={displayLiters}
                  onChange={handleLitersChange}
                  placeholder="Enter liters (e.g. 10,5)"
                  className="flex h-14 w-full rounded-lg border-2 border-gray-300 bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 pr-14"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-12 w-12"
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  disabled={!('webkitSpeechRecognition' in window)}
                >
                  {isListening ? (
                    <MicOff className="h-6 w-6 text-red-500" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
              </div>
              {voiceError && (
                <p className="text-sm text-red-500">{voiceError}</p>
              )}
              
              {/* Warning if liters exceed available stock */}
              {formData.fuel_type && formData.fuel_type !== '__no_fuel_types__' && formData.liters > 0 && (
                <div className={`p-4 rounded-lg border ${formData.liters > getTotalStockByFuelType(formData.fuel_type) ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                  <div className="flex items-center gap-3">
                    {formData.liters > getTotalStockByFuelType(formData.fuel_type) ? (
                      <>
                        <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                        <span className="font-medium text-base">⚠️ Requested liters exceed available stock!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-6 w-6 flex-shrink-0" />
                        <span className="font-medium text-base">✓ Sufficient stock available</span>
                      </>
                    )}
                  </div>
                  {formData.liters > getTotalStockByFuelType(formData.fuel_type) && (
                    <p className="text-sm mt-2">
                      Available stock: {formatNumber(getTotalStockByFuelType(formData.fuel_type))}L | 
                      Requested: {formatNumber(formData.liters)}L | 
                      Shortage: {formatNumber(formData.liters - getTotalStockByFuelType(formData.fuel_type))}L
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Amount Display */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="amount" className="text-base font-medium">Amount (IDR)</Label>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                value={formData.amount || ''}
                className="flex h-14 w-full rounded-lg border-2 border-gray-300 bg-gray-100 px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-not-allowed"
                readOnly
              />
              <div className="text-base text-gray-700 bg-gray-100 p-3 rounded-lg">
                Calculated: {formatNumber(formData.liters)}L × Rp {getCurrentPrice(formData.fuel_type).toFixed(2)}/L = Rp {formatNumber(formData.amount)}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleCreateSale}
              disabled={
                submitting || 
                availableFuelTypes.length === 0
              }
              className="h-14 text-base py-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-lg font-medium"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <CreditCard className="h-6 w-6 mr-3" />
                  Create Sale
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}