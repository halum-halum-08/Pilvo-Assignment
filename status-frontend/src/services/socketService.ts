import { io, Socket } from 'socket.io-client';
import { toast } from '../hooks/use-toast';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  socket: Socket | null = null;
  reconnectAttempts = 0;
  maxReconnectAttempts = 5;
  
  connect() {
    try {
      if (!this.socket) {
        this.socket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000
        });
        
        this.setupEventListeners();
      }
      
      return this.socket;
    } catch (error) {
      console.error('Socket connection error:', error);
      return null;
    }
  }
  
  private setupEventListeners() {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts === 1) {
        toast({
          title: 'Connection Issue',
          description: 'Having trouble connecting to real-time updates',
          variant: 'destructive',
        });
      }
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      toast({
        title: 'Reconnected',
        description: 'Real-time updates have been restored',
      });
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      toast({
        title: 'Connection Failed',
        description: 'Unable to establish real-time connection. Please reload the page.',
        variant: 'destructive',
      });
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      
      if (reason === 'io server disconnect' && this.socket) {
        // The server has forcefully disconnected the socket
        this.socket.connect();
      }
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
  
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
  
  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
