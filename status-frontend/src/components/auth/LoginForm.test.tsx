import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import LoginForm from './LoginForm';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../hooks/use-toast';

// Mock the hooks
jest.mock('../../hooks/useAuth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));
jest.mock('../../hooks/use-toast', () => ({
  toast: jest.fn(),
}));

describe('LoginForm', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useAuth hook
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn()
    });
    
    // Mock useNavigate
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });
  
  test('renders login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });
  
  test('validates required fields', async () => {
    render(<LoginForm />);
    
    // Submit the form without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        variant: 'destructive',
      }));
    });
    
    expect(mockLogin).not.toHaveBeenCalled();
  });
  
  test('submits form with valid data', async () => {
    mockLogin.mockResolvedValue(undefined);
    
    render(<LoginForm />);
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Success',
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
  
  test('shows error message when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    
    render(<LoginForm />);
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'wrong-password' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrong-password');
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        description: 'Invalid credentials',
      }));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
  
  test('shows loading state during form submission', async () => {
    // Create a promise that never resolves to test loading state
    mockLogin.mockReturnValue(new Promise(() => {}));
    
    render(<LoginForm />);
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    });
  });
});
