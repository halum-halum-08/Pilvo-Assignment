import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../hooks/use-toast';

const LogoutPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Execute logout when component mounts
    logout();
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    
    // Redirect to login page
    navigate('/login');
  }, [logout, navigate]);

  // This component doesn't render anything visible
  // as it immediately redirects after logout
  return <div className="flex justify-center items-center h-screen">Logging out...</div>;
};

export default LogoutPage;