import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Service } from '../types/service';
import { Incident } from '../types/incident';

interface ServiceStatusEvent {
  serviceId: number;
  status: string;
}

interface UseSocketResult {
  socket: Socket | null;
  isConnected: boolean;
  joinServiceRoom: (serviceId: number) => void;
  joinIncidentRoom: (incidentId: number) => void;
  updateServiceStatus: (serviceId: number, status: string) => void;
  onServiceUpdated: (callback: (service: Service) => void) => () => void;
  onServiceCreated: (callback: (service: Service) => void) => () => void;
  onServiceDeleted: (callback: ({ id }: { id: number }) => void) => () => void;
  onIncidentUpdated: (callback: (incident: Incident) => void) => () => void;
  onIncidentCreated: (callback: (incident: Incident) => void) => () => void;
  onServiceStatusChanged: (callback: (data: ServiceStatusEvent) => void) => () => void;
}

export const useSocket = (): UseSocketResult => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  useEffect(() => {
    // Connect to socket server
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
    const socketInstance = io(SOCKET_URL);
    
    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    // Save socket instance
    setSocket(socketInstance);
    
    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  
  // Join a service room to receive updates
  const joinServiceRoom = useCallback((serviceId: number) => {
    if (socket && isConnected) {
      socket.emit('joinServiceRoom', serviceId);
    }
  }, [socket, isConnected]);
  
  // Join an incident room to receive updates
  const joinIncidentRoom = useCallback((incidentId: number) => {
    if (socket && isConnected) {
      socket.emit('joinIncidentRoom', incidentId);
    }
  }, [socket, isConnected]);
  
  // Update service status
  const updateServiceStatus = useCallback((serviceId: number, status: string) => {
    if (socket && isConnected) {
      socket.emit('updateServiceStatus', { serviceId, status });
    }
  }, [socket, isConnected]);
  
  // Listen for service updated events
  const onServiceUpdated = useCallback((callback: (service: Service) => void) => {
    if (socket) {
      socket.on('service:updated', callback);
      
      return () => {
        socket.off('service:updated', callback);
      };
    }
    return () => {};
  }, [socket]);
  
  // Listen for service created events
  const onServiceCreated = useCallback((callback: (service: Service) => void) => {
    if (socket) {
      socket.on('service:created', callback);
      
      return () => {
        socket.off('service:created', callback);
      };
    }
    return () => {};
  }, [socket]);
  
  // Listen for service deleted events
  const onServiceDeleted = useCallback((callback: ({ id }: { id: number }) => void) => {
    if (socket) {
      socket.on('service:deleted', callback);
      
      return () => {
        socket.off('service:deleted', callback);
      };
    }
    return () => {};
  }, [socket]);
  
  // Listen for incident updated events
  const onIncidentUpdated = useCallback((callback: (incident: Incident) => void) => {
    if (socket) {
      socket.on('incident:updated', callback);
      
      return () => {
        socket.off('incident:updated', callback);
      };
    }
    return () => {};
  }, [socket]);
  
  // Listen for incident created events
  const onIncidentCreated = useCallback((callback: (incident: Incident) => void) => {
    if (socket) {
      socket.on('incident:created', callback);
      
      return () => {
        socket.off('incident:created', callback);
      };
    }
    return () => {};
  }, [socket]);
  
  // Listen for service status changed events
  const onServiceStatusChanged = useCallback((callback: (data: ServiceStatusEvent) => void) => {
    if (socket) {
      socket.on('serviceStatusChanged', callback);
      
      return () => {
        socket.off('serviceStatusChanged', callback);
      };
    }
    return () => {};
  }, [socket]);
  
  return {
    socket,
    isConnected,
    joinServiceRoom,
    joinIncidentRoom,
    updateServiceStatus,
    onServiceUpdated,
    onServiceCreated,
    onServiceDeleted,
    onIncidentUpdated,
    onIncidentCreated,
    onServiceStatusChanged
  };
};
