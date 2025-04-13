import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../hooks/useAuth';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and application settings.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Email Address</h3>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Name</h3>
            <p className="text-sm text-muted-foreground mt-1">{user?.name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Role</h3>
            <p className="text-sm text-muted-foreground mt-1 capitalize">{user?.role}</p>
          </div>
          
          {user?.organization && (
            <div>
              <h3 className="text-sm font-medium">Organization</h3>
              <p className="text-sm text-muted-foreground mt-1">{user.organization}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Notification settings will be available in a future update.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Application Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Application preferences will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
