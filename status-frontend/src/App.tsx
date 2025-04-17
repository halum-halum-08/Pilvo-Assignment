import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StatusPage from './pages/public/StatusPage';
import PublicIncidentDetailPage from './pages/public/IncidentDetailPage';
import AuthGuard from './components/auth/AuthGuard';
import { Toaster } from './components/ui/toaster';
import DashboardLayout from './components/layouts/DashboardLayout';

import ServicesPage from './pages/dashboard/ServicesPage';
import IncidentsPage from './pages/dashboard/IncidentsPage';
import MaintenancePage from './pages/dashboard/MaintenancePage';
import TeamsPage from './pages/dashboard/TeamsPage';
import DashboardIncidentDetailPage from './pages/dashboard/IncidentDetailPage';
import ServiceStatusUpdatePage from './pages/dashboard/services/ServiceStatusUpdatePage';
import { NetworkStatusAlert } from './components/NetworkStatusAlert';
import { ApiStatusAlert } from './components/ApiStatusAlert';
import LogoutPage from './pages/LogoutPage';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <Router>
        <>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/status/incidents/:id" element={<PublicIncidentDetailPage />} />
            <Route path="/status/maintenance/:id" element={<PublicIncidentDetailPage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
              <Route index element={<DashboardPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/status/:id" element={<ServiceStatusUpdatePage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="incidents/:id" element={<DashboardIncidentDetailPage />} />
              <Route path="maintenance" element={<MaintenancePage />} />
              <Route path="maintenance/:id" element={<DashboardIncidentDetailPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Redirect root to status page */}
            <Route path="/" element={<Navigate to="/status" replace />} />
            
            {/* Catch all route - redirect to status */}
            <Route path="*" element={<Navigate to="/status" replace />} />
            <Route path="/logout" element={<LogoutPage />} />
          </Routes>
          <Toaster />
          <NetworkStatusAlert />
          <ApiStatusAlert />
        </>
      </Router>
    </ThemeProvider>
  );
};

// Create a simple Settings page component since it's missing
const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and application settings.
        </p>
      </div>
      
      <div className="border rounded-md p-6">
        <h2 className="text-xl font-medium mb-4">Account Settings</h2>
        <p className="text-muted-foreground">
          Settings page is under construction. Check back soon for more options.
        </p>
      </div>
    </div>
  );
};

export default App;
