import { render, screen } from '../../utils/test-utils';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';

// Mock useAuth hook and the Outlet component from react-router-dom
jest.mock('../../hooks/useAuth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  NavLink: ({ children, to }: { children: React.ReactNode, to: string }) => (
    <a href={to} data-testid={`navlink-${to.replace(/\//g, '-').slice(1)}`}>{children}</a>
  )
}));

describe('DashboardLayout', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  
  beforeEach(() => {
    // Mock a regular user
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn()
    });
  });
  
  test('renders sidebar with navigation links', () => {
    render(<DashboardLayout />);
    
    // Test for main sections
    expect(screen.getByText('Status Admin')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-dashboard-services')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-dashboard-incidents')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-dashboard-maintenance')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-dashboard-settings')).toBeInTheDocument();
    
    // Teams link should not be visible to regular users
    expect(screen.queryByTestId('navlink-dashboard-teams')).toBeNull();
    
    // Main content area
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
  
  test('shows teams link for admin users', () => {
    // Mock an admin user
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn()
    });
    
    render(<DashboardLayout />);
    
    // Teams link should be visible to admin users
    expect(screen.getByTestId('navlink-dashboard-teams')).toBeInTheDocument();
  });
  
  test('renders responsive sidebar on desktop', () => {
    render(<DashboardLayout />);
    
    // Sidebar should be present with md:block class
    const sidebar = screen.getByText('Status Admin').closest('div');
    expect(sidebar).toHaveClass('hidden', 'md:block');
  });
  
  test('renders outlet content correctly', () => {
    render(<DashboardLayout />);
    
    // Check if the outlet content is rendered
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});
