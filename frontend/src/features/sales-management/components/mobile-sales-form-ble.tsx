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
  ChevronLeft, 
  Save, 
  Fuel, 
  CreditCard,
  Bluetooth,
  BluetoothConnected,
  BluetoothSearching,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  Wifi
} from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface SaleFormData {
  fuel_type: string
  liters: number
  amount: number
}

interface MobileSalesFormWithBLEProps {
  formData: SaleFormData
  availableFuelTypes: string[]
  getCurrentPrice: (fuelType: string) => number
  isLoading: boolean
  onChange: (field: string, value: string | number) => void
  onSubmit: () => void
  onCancel: () => void
  isReadOnly: boolean
}

interface BluetoothDeviceStatus {
  name: string
  rssi: number
  connected: boolean
}

export const MobileSalesFormWithBLE: React.FC<MobileSalesFormWithBLEProps> = ({
  formData,
  availableFuelTypes,
  getCurrentPrice,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
  isReadOnly
}) => {
  const [displayLiters, setDisplayLiters] = useState('')
  const [autoSubmit, setAutoSubmit] = useState(false)
  
  // Bluetooth states
  const [bluetoothSupported, setBluetoothSupported] = useState(false)
  const [bluetoothConnected, setBluetoothConnected] = useState(false)
  const [bluetoothConnecting, setBluetoothConnecting] = useState(false)
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState('')
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDeviceStatus[]>([])
  const [bluetoothScanning, setBluetoothScanning] = useState(false)
  const bluetoothSocketRef = useRef<any>(null)
  const characteristicRef = useRef<any>(null)

  // Check Bluetooth support
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.bluetooth) {
      setBluetoothSupported(true)
    } else {
      setBluetoothSupported(false)
    }
  }, [])

  // Calculate amount when fuel type or liters change
  useEffect(() => {
    if (formData.fuel_type) {
      const price = getCurrentPrice(formData.fuel_type)
      const amount = price * formData.liters
      onChange('amount', parseFloat(amount.toFixed(2)))
    }
  }, [formData.fuel_type, formData.liters, getCurrentPrice])

  // Send transaction data to ESP32 when form data changes
  useEffect(() => {
    if (bluetoothConnected) {
      // Send transaction data to ESP32
      const transactionData = {
        fuel_type: formData.fuel_type,
        liters: formData.liters,
        price_per_liter: getCurrentPrice(formData.fuel_type),
        amount: formData.amount
      }
      
      // Send as JSON
      sendBluetoothCommand(`SET_TRANSACTION_DATA:${JSON.stringify(transactionData)}`)
    }
  }, [formData, bluetoothConnected, getCurrentPrice])

  // Handle liters input change with comma support
  const handleLitersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDisplayLiters(value)
    
    // Replace comma with dot for processing
    const processedValue = value.replace(',', '.')
    
    // Check if it's a valid number
    if (processedValue === '' || /^\d*\.\?\d*$/.test(processedValue)) {
      const numericValue = processedValue === '' ? 0 : parseFloat(processedValue)
      onChange('liters', isNaN(numericValue) ? 0 : numericValue)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Scan for Bluetooth devices
  const scanBluetoothDevices = async () => {
    if (!navigator.bluetooth) {
      toast.error('Bluetooth is not supported in your browser')
      return
    }

    try {
      setBluetoothScanning(true)
      
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
      
      let device
      
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

      // Connect to GATT server
      const server = await device.gatt.connect()
      
      // Get primary service
      const service = await server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb') // lowercase
      
      // Get characteristic
      const characteristic = await service.getCharacteristic('00001101-0000-1000-8000-00805f9b34fb') // lowercase
      
      // Set up event listener for incoming data
      characteristic.addEventListener('characteristicvaluechanged', handleBluetoothData)
      
      // Start notifications
      await characteristic.startNotifications()
      
      // Store reference
      bluetoothSocketRef.current = characteristic
      characteristicRef.current = characteristic
      
      // Update state
      setBluetoothConnected(true)
      setBluetoothDeviceName(device.name || 'ESP32 Device')
      
      toast.success(`🔗 Connected to ${device.name || 'ESP32 Device'}`, {
        description: 'Device is ready for transactions',
        duration: 3000
      })
      
      // Request status from device
      await sendBluetoothCommand('GET_STATUS')
    } catch (error: any) {
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
      if (bluetoothSocketRef.current) {
        await bluetoothSocketRef.current.service.device.gatt.disconnect()
        bluetoothSocketRef.current = null
        characteristicRef.current = null
      }
      
      setBluetoothConnected(false)
      setBluetoothDeviceName('')
      toast.success(`✅ Disconnected`, {
        description: 'Successfully disconnected from device',
        duration: 3000
      })
    } catch (error: any) {
      toast.error(`❌ Disconnection failed`, {
        description: `Could not disconnect from device: ${error.message || 'Unknown error'}`,
        duration: 5000
      })
    }
  }

  // Send command to Bluetooth device
  const sendBluetoothCommand = async (command: string) => {
    if (!characteristicRef.current) {
      toast.error('Not connected to device')
      return
    }

    try {
      const encoder = new TextEncoder()
      await characteristicRef.current.writeValue(encoder.encode(command + '\n'))
    } catch (error: any) {
      toast.error(`Failed to send command: ${error.message || 'Unknown error'}`)
    }
  }

  // Handle incoming data from Bluetooth device
  const handleBluetoothData = (event: any) => {
    try {
      const value = event.target.value
      const decoder = new TextDecoder()
      const data = decoder.decode(value)
      
      // Handle different types of messages
      if (data.startsWith('SALE_DATA:')) {
        try {
          const jsonData = data.substring(10) // Remove 'SALE_DATA:' prefix
          const saleData = JSON.parse(jsonData)
          
          // Update form with received data
          onChange('fuel_type', saleData.fuel_type || formData.fuel_type)
          onChange('liters', saleData.liters || 0)
          onChange('amount', saleData.amount || 0)
          
          setDisplayLiters(saleData.liters?.toString() || '')
          
          toast.info(`Received transaction data from device: ${saleData.liters}L of ${saleData.fuel_type}`)
          
          // Auto-submit if enabled
          if (autoSubmit) {
            // Small delay to ensure state is updated
            setTimeout(() => {
              onSubmit()
            }, 100)
          }
        } catch (error) {
          toast.error(`❌ Data parsing failed`, {
            description: 'Could not parse transaction data from device',
            duration: 5000
          })
        }
      } else if (data.startsWith('STATUS:')) {
        try {
          const jsonData = data.substring(7) // Remove 'STATUS:' prefix
          const statusData = JSON.parse(jsonData)
          // Device status received
        } catch (error) {
          // Error parsing status data
        }
      } else if (data.startsWith('TRANSACTION_DATA_SET:')) {
        // Confirmation that transaction data was set
      } else if (data.startsWith('ERROR:')) {
        const errorMessage = data.substring(6) // Remove 'ERROR:' prefix
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
            onChange('liters', volume);
            const price = getCurrentPrice(formData.fuel_type);
            onChange('amount', parseFloat((volume * price).toFixed(2)));
            
            setDisplayLiters(volume.toString());
            
            toast.info(`Volume received from device: ${volume}L`);
            
            // Auto-submit if enabled
            if (autoSubmit) {
              setTimeout(() => {
                onSubmit()
              }, 100)
            }
          }
        } catch (error) {
          toast.error(`❌ Volume data parsing failed`, {
            description: 'Could not parse volume data from device',
            duration: 5000
          })
        }
      }
    } catch (error) {
      // Error handling Bluetooth data
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-10 w-10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl font-bold">Create Sale</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add a new sale transaction
          </p>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Fuel className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">New Sale Transaction</CardTitle>
              <CardDescription className="text-sm">
                Enter sale details to create a new transaction
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col gap-5">
            {/* Bluetooth Connection Section with Tabs */}
            {bluetoothSupported && (
              <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bluetooth className="h-5 w-5" />
                    ESP32 Device Connection
                  </CardTitle>
                  <CardDescription>
                    Connect to your ESP32 sales transaction device
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
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
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={scanBluetoothDevices}
                            disabled={bluetoothScanning}
                            className="flex-1 py-5 text-base"
                            variant="outline"
                          >
                            {bluetoothScanning ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Scanning...
                              </>
                            ) : (
                              <>
                                <BluetoothSearching className="h-4 w-4 mr-2" />
                                Scan for Devices
                              </>
                            )}
                          </Button>
                          
                          <Button
                            onClick={() => connectBluetooth()}
                            disabled={bluetoothConnecting}
                            className="flex-1 py-5 text-base"
                          >
                            {bluetoothConnecting ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <Bluetooth className="h-4 w-4 mr-2" />
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
                      <div className="flex flex-col gap-3">
                        {bluetoothDevices.length > 0 ? (
                          <div className="mt-2">
                            <Label className="text-sm font-medium mb-2 block">Available Devices</Label>
                            <div className="space-y-2">
                              {bluetoothDevices.map((device, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                >
                                  <div className="flex items-center gap-2">
                                    <Bluetooth className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">{device.name}</span>
                                    <span className="text-xs text-gray-500">RSSI: {device.rssi}</span>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    onClick={() => connectBluetooth(device.name)}
                                    disabled={bluetoothConnecting || (bluetoothDeviceName === device.name && bluetoothConnected)}
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
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2">
                                <BluetoothConnected className="h-5 w-5 text-green-600" />
                                <span className="font-medium">Connected to {bluetoothDeviceName}</span>
                              </div>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Connected
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={requestDeviceStatus}
                                variant="outline"
                                className="py-5 text-base"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Status
                              </Button>
                              
                              <Button
                                onClick={sendTestData}
                                variant="outline"
                                className="py-5 text-base"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Test Data
                              </Button>
                              
                              <Button
                                onClick={disconnectBluetooth}
                                variant="outline"
                                className="col-span-2 py-5 text-base"
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
                        
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 mt-4">
                          <input
                            type="checkbox"
                            id="autoSubmit"
                            checked={autoSubmit}
                            onChange={(e) => setAutoSubmit(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="autoSubmit" className="text-sm">
                            Auto-submit transactions from device
                          </Label>
                        </div>
                        
                        <p className="text-sm text-gray-500">
                          {bluetoothConnected 
                            ? "Device is ready to send transaction data" 
                            : "Connect your ESP32 device to enable automatic transaction input"}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => onChange('fuel_type', value)}
                  disabled={isReadOnly || availableFuelTypes.length === 0}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFuelTypes.length > 0 ? (
                      availableFuelTypes.map(fuelType => (
                        <SelectItem key={fuelType} value={fuelType}>
                          {fuelType} (Rp {getCurrentPrice(fuelType).toFixed(2)}/L)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No fuel types available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Fuel types are based on available tanks
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="liters">Liters</Label>
                <input
                  id="liters"
                  type="text"
                  inputMode="decimal"
                  value={displayLiters}
                  onChange={handleLitersChange}
                  placeholder="Enter liters (e.g. 10,5)"
                  disabled={isReadOnly}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 py-5"
                />
                <p className="text-sm text-gray-500">
                  Enter the amount of fuel in liters (use comma or dot for decimals)
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Amount (IDR)</Label>
                <input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  value={formatCurrency(formData.amount)}
                  className="flex h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 py-5 cursor-not-allowed"
                  readOnly
                />
                <div className="text-sm text-gray-500">
                  Calculated: {formData.liters}L × Rp {getCurrentPrice(formData.fuel_type).toFixed(2)}/L
                </div>
                <p className="text-sm text-gray-500">
                  Amount is automatically calculated and locked
                </p>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="flex-1 py-5"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="flex-1 py-5"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Create Sale
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}