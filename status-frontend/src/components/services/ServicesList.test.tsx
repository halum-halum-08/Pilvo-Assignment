import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ServicesList from './ServicesList';
import { useSocket } from '../../hooks/useSocket';
import axios from 'axios';

// Mock axios and useSocket hook
jest.mock('axios');
jest.mock('../../hooks/useSocket');
jest.mock('../../hooks/use-toast', () => ({
  toast: jest.fn()
}));

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockUseSocket = useSocket as jest.MockedFunction<typeof useSocket>;

describe('ServicesList', () => {
  const mockServices = [
    { 
      id: 1, 
      name: 'API Service', 
      description: 'Main API service',
      status: 'Operational',
      teamId: 1,
      uptime: 100,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    },
    { 
      id: 2, 
      name: 'Website', 
      description: 'Company website',
      status: 'Degraded Performance',
      teamId: 1,
      uptime: 98,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the socket hooks
    mockUseSocket.mockReturnValue({
      socket: null,
      isConnected: true,
      joinServiceRoom: jest.fn(),
      joinIncidentRoom: jest.fn(),
      updateServiceStatus: jest.fn(),
      onServiceUpdated: jest.fn().mockReturnValue(jest.fn()),
      onServiceCreated: jest.fn().mockReturnValue(jest.fn()),
      onServiceDeleted: jest.fn().mockReturnValue(jest.fn()),
      onIncidentUpdated: jest.fn().mockReturnValue(jest.fn()),
      onIncidentCreated: jest.fn().mockReturnValue(jest.fn()),
      onServiceStatusChanged: jest.fn().mockReturnValue(jest.fn())
    });
    
    // Mock axios.get response
    mockAxios.get.mockResolvedValue({ data: mockServices });
  });
  
  test('renders loading state initially', () => {
    render(
      <ServicesList 
        onEdit={jest.fn()} 
        onAdd={jest.fn()} 
      />
    );
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  test('renders services after loading', async () => {
    render(
      <ServicesList 
        onEdit={jest.fn()} 
        onAdd={jest.fn()} 
      />
    );
    
    // Wait for the services to load
    await waitFor(() => {
      expect(screen.getByText('API Service')).toBeInTheDocument();
      expect(screen.getByText('Website')).toBeInTheDocument();
    });
    
    // Check for status badges
    expect(screen.getByText('Operational')).toBeInTheDocument();
    expect(screen.getByText('Degraded Performance')).toBeInTheDocument();
  });
  
  test('calls onAdd when Add button is clicked', async () => {
    const mockOnAdd = jest.fn();
    
    render(
      <ServicesList 
        onEdit={jest.fn()} 
        onAdd={mockOnAdd} 
      />
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText('Add Service')).toBeInTheDocument();
    });
    
    // Click the add button
    fireEvent.click(screen.getByText('Add Service'));
    
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });
  
  test('calls onEdit when Edit button is clicked', async () => {
    const mockOnEdit = jest.fn();
    
    render(
      <ServicesList 
        onEdit={mockOnEdit} 
        onAdd={jest.fn()} 
      />
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getAllByRole('button')[1]).toBeInTheDocument();
    });
    
    // Click the first edit button
    fireEvent.click(screen.getAllByRole('button')[1]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockServices[0]);
  });
  
  test('shows message when no services are found', async () => {
    // Mock empty services response
    mockAxios.get.mockResolvedValue({ data: [] });
    
    render(
      <ServicesList 
        onEdit={jest.fn()} 
        onAdd={jest.fn()} 
      />
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText('No services found. Create your first service to get started.')).toBeInTheDocument();
    });
  });
});
