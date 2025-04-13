import { render, screen } from '../../utils/test-utils';
import StatusOverview from './StatusOverview';
import { useServiceStatus } from '../../hooks/useServiceStatus';

// Mock the hook
jest.mock('../../hooks/useServiceStatus');

describe('StatusOverview', () => {
  const mockUseServiceStatus = useServiceStatus as jest.MockedFunction<typeof useServiceStatus>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('shows loading state', () => {
    mockUseServiceStatus.mockReturnValue({
      services: [],
      loading: true,
      error: null,
      fetchServices: jest.fn(),
      updateServiceStatus: jest.fn()
    });
    
    render(<StatusOverview />);
    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  test('shows all operational when all services are operational', () => {
    mockUseServiceStatus.mockReturnValue({
      services: [
        { id: 1, name: 'API', status: 'Operational', teamId: 1, uptime: 100, createdAt: '', updatedAt: '' },
        { id: 2, name: 'Website', status: 'Operational', teamId: 1, uptime: 100, createdAt: '', updatedAt: '' }
      ],
      loading: false,
      error: null,
      fetchServices: jest.fn(),
      updateServiceStatus: jest.fn()
    });
    
    render(<StatusOverview />);
    expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
  });
  
  test('shows degraded when some services are degraded', () => {
    mockUseServiceStatus.mockReturnValue({
      services: [
        { id: 1, name: 'API', status: 'Operational', teamId: 1, uptime: 100, createdAt: '', updatedAt: '' },
        { id: 2, name: 'Website', status: 'Degraded Performance', teamId: 1, uptime: 98, createdAt: '', updatedAt: '' }
      ],
      loading: false,
      error: null,
      fetchServices: jest.fn(),
      updateServiceStatus: jest.fn()
    });
    
    render(<StatusOverview />);
    expect(screen.getByText('Some Systems Degraded')).toBeInTheDocument();
  });
  
  test('shows major outage when there is a major outage', () => {
    mockUseServiceStatus.mockReturnValue({
      services: [
        { id: 1, name: 'API', status: 'Operational', teamId: 1, uptime: 100, createdAt: '', updatedAt: '' },
        { id: 2, name: 'Website', status: 'Major Outage', teamId: 1, uptime: 80, createdAt: '', updatedAt: '' }
      ],
      loading: false,
      error: null,
      fetchServices: jest.fn(),
      updateServiceStatus: jest.fn()
    });
    
    render(<StatusOverview />);
    expect(screen.getByText('Major System Outage')).toBeInTheDocument();
  });
});
