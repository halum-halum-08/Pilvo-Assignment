import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../components/theme-provider';
import { AuthProvider } from '../context/AuthContext';

// Create a custom render function that includes our providers
function render(ui: React.ReactElement, { route = '/', ...options } = {}) {
  window.history.pushState({}, 'Test page', route);
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" attribute="class">
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  };
  
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from RTL
export * from '@testing-library/react';

// Override the render method
export { render };
