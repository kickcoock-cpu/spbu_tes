import axios from 'axios'

// Utility function to construct proper API URLs
export function constructApiUrl(endpoint: string): string {
  // Get the base API URL from environment variables
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
  // Remove trailing slash from base URL if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  
  // Ensure endpoint starts with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  // Construct the full URL
  const fullUrl = `${cleanBaseUrl}${cleanEndpoint}`
  
  console.log(`Constructing API URL: ${fullUrl}`)
  return fullUrl
}

// Create a properly configured axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add request interceptor to log URLs
apiClient.interceptors.request.use(
  (config) => {
    console.log('=== API REQUEST ===')
    console.log('Method:', config.method?.toUpperCase())
    console.log('URL:', config.url)
    console.log('Full URL:', config.baseURL + (config.url || ''))
    console.log('Request data:', config.data)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)