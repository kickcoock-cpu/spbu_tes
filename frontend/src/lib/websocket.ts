import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Initialize WebSocket connection
  public connect() {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    // Get base URL from environment or default to localhost:3000
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    console.log('WebSocket baseURL:', baseURL);
    
    // Create socket connection
    this.socket = io(baseURL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000,
      withCredentials: true
    });

    // Event listeners
    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, attempt to reconnect
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnect();
    });

    this.socket.on('dashboardDataUpdate', (data) => {
      console.log('Received dashboard data update:', data);
      // Instead of directly using the data, dispatch event to trigger refetch
      window.dispatchEvent(new CustomEvent('dashboardDataRefresh'));
    });

    this.socket.on('dashboardDataError', (error) => {
      console.error('Dashboard data error:', error);
      // Dispatch custom event for error handling
      window.dispatchEvent(new CustomEvent('dashboardDataError', { detail: error }));
    });

    console.log('WebSocket connection initialized');
  }

  // Request dashboard data
  public requestDashboardData() {
    if (this.socket?.connected) {
      console.log('Requesting dashboard data via WebSocket');
      this.socket.emit('requestDashboardData');
    } else {
      console.warn('Cannot request dashboard data: WebSocket not connected');
    }
  }

  // Disconnect WebSocket
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket disconnected');
    }
  }

  // Reconnect with exponential backoff
  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Check if connected
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();