import { render, screen } from '../../utils/test-utils';
import StatusPage from './StatusPage';

// Mock the components used in StatusPage
jest.mock('../../components/public/StatusOverview', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="status-overview">Status Overview Component</div>
  };
});

jest.mock('../../components/public/ServiceStatusList', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="service-status-list">Service Status List Component</div>
  };
});

jest.mock('../../components/public/ActiveIncidentsList', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="active-incidents-list">Active Incidents List Component</div>
  };
});

jest.mock('../../components/public/StatusTimeline', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="status-timeline">Status Timeline Component</div>
  };
});

jest.mock('../../components/ui/mode-toggle', () => {
  return {
    ModeToggle: () => <div data-testid="mode-toggle">Mode Toggle Component</div>
  };
});

describe('StatusPage', () => {
  test('renders all components correctly', () => {
    render(<StatusPage />);
    
    // Check if the heading is rendered
    expect(screen.getByText('System Status')).toBeInTheDocument();
    
    // Check if all the components are rendered
    expect(screen.getByTestId('status-overview')).toBeInTheDocument();
    expect(screen.getByTestId('service-status-list')).toBeInTheDocument();
    expect(screen.getByTestId('active-incidents-list')).toBeInTheDocument();
    expect(screen.getByTestId('status-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('mode-toggle')).toBeInTheDocument();
    
    // Check for footer
    expect(screen.getByText(/all systems monitored in real-time/i)).toBeInTheDocument();
  });
});
