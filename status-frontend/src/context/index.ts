// Export context providers (e.g., AuthContext, StatusContext) from this file.
import AuthContext from './AuthContext';
export { AuthProvider } from './AuthContext';
export { default as AuthContext } from './AuthContext';
// Import useAuth from the hooks directory
export { useAuth } from '../hooks/useAuth';
