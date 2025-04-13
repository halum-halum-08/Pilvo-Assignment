import { useContext } from 'react';
import AuthContext, { AuthContextType, RegisterData } from '../context/AuthContext';

// Re-export the RegisterData type so components can import it from the hook
export type { RegisterData };

/**
 * Hook to use the auth context
 * @returns Auth context values
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
