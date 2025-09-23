import { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

// Define types for our WebSocket data
export type DashboardData = {
  revenue: number
  subscriptions: number
  sales: number
  activeUsers: number
  chartData: {
    name: string
    total: number
  }[]
  recentSales: {
    id: string
    name: string
    email: string
    amount: number
    avatar: string
  }[]
}

type WebSocketMessage = {
  type: string
  data: any
}

// Default data structure
const DEFAULT_DASHBOARD_DATA: DashboardData = {
  revenue: 45231.89,
  subscriptions: 2350,
  sales: 12234,
  activeUsers: 573,
  chartData: [
    { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
  ],
  recentSales: [
    {
      id: '1',
      name: 'Olivia Martin',
      email: 'olivia.martin@email.com',
      amount: 1999.00,
      avatar: '/avatars/01.png',
    },
    {
      id: '2',
      name: 'Jackson Lee',
      email: 'jackson.lee@email.com',
      amount: 39.00,
      avatar: '/avatars/02.png',
    },
    {
      id: '3',
      name: 'Isabella Nguyen',
      email: 'isabella.nguyen@email.com',
      amount: 299.00,
      avatar: '/avatars/03.png',
    },
    {
      id: '4',
      name: 'William Kim',
      email: 'will@email.com',
      amount: 99.00,
      avatar: '/avatars/04.png',
    },
    {
      id: '5',
      name: 'Sofia Davis',
      email: 'sofia.davis@email.com',
      amount: 39.00,
      avatar: '/avatars/05.png',
    },
  ],
}

export function useDashboardWebSocket() {
  const [data, setData] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  // Function to connect to WebSocket
  const connect = useCallback(() => {
    try {
      // Disconnect existing socket if any
      if (socketRef.current) {
        socketRef.current.disconnect()
      }

      // Create new socket connection
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('Dashboard WebSocket baseURL:', baseURL);
      const socket = io(baseURL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      socketRef.current = socket

      // Handle connection
      socket.on('connect', () => {
        console.log('Connected to WebSocket server')
        setIsConnected(true)
        setError(null)
        
        // Request initial dashboard data
        socket.emit('requestDashboardData')
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server')
        setIsConnected(false)
      })

      // Handle connection error
      socket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err)
        setIsConnected(false)
        setError('Failed to connect to real-time updates')
      })

      // Handle dashboard data updates
      socket.on('dashboardDataUpdate', (dashboardData) => {
        if (dashboardData.success && dashboardData.data) {
          setData({
            revenue: dashboardData.data.totalSales || 0,
            subscriptions: 0, // Not provided in our API
            sales: dashboardData.data.totalSalesCount || 0,
            activeUsers: 0, // Not provided in our API
            chartData: dashboardData.data.stockPredictions?.map((stock: any) => ({
              name: stock.fuelType,
              total: stock.daysUntilStockout
            })) || [],
            recentSales: dashboardData.data.recentSales?.map((sale: any) => ({
              id: sale.id.toString(),
              name: sale.operatorName,
              email: '', // Not provided in our API
              amount: sale.totalAmount,
              avatar: '/avatars/01.png', // Default avatar
            })) || []
          })
        }
      })

      // Handle dashboard data errors
      socket.on('dashboardDataError', (errorData) => {
        console.error('Dashboard data error:', errorData)
        setError(errorData.message || 'Failed to fetch dashboard data')
      })
    } catch (err) {
      console.error('Error initializing WebSocket:', err)
      setError('Failed to initialize real-time connection')
    }
  }, [])

  // Function to disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
  }, [])

  // Connect when hook is first used
  useEffect(() => {
    connect()
    
    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    data,
    isConnected,
    error,
    connect,
    disconnect,
  }
}