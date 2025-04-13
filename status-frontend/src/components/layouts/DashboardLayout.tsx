import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import UserAccountNav from '../auth/UserAccountNav';
import { ModeToggle } from '../ui/mode-toggle';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  Server, 
  AlertTriangle, 
  Users, 
  Settings, 
  CalendarDays,
  Menu, 
  X,
  BellRing,
  Search
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { label: 'Services', icon: <Server size={18} />, path: '/dashboard/services' },
    { label: 'Incidents', icon: <AlertTriangle size={18} />, path: '/dashboard/incidents', count: 3 },
    { label: 'Maintenance', icon: <CalendarDays size={18} />, path: '/dashboard/maintenance', count: 1 },
  ];

  // Only show teams section to admins
  if (user?.role === 'admin') {
    menuItems.push({ label: 'Teams', icon: <Users size={18} />, path: '/dashboard/teams' });
  }

  menuItems.push({ label: 'Settings', icon: <Settings size={18} />, path: '/dashboard/settings' });

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get the page title from the current path
  const getPageTitle = () => {
    const currentMenuItem = menuItems.find(item => location.pathname === item.path);
    return currentMenuItem?.label || 'Dashboard';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log(`Searching for: ${searchQuery}`);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        ></div>
      )}
      
      {/* Sidebar - Mobile */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-card transform transition-transform duration-200 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold">Status Admin</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleMobileMenu} aria-label="Close menu">
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => 
                  cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <div className="flex items-center">
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </div>
                {item.count && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.count}
                  </Badge>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 text-sm font-medium">
              <div>{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <Button variant="ghost" size="icon">
              <BellRing size={18} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Sidebar - Desktop */}
      <div className="w-72 border-r bg-card hidden md:block">
        <div className="h-16 border-b flex items-center px-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold">Status Admin</h1>
          </div>
        </div>
        
        <div className="py-4 px-4">
          <div className="mb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <div className="flex items-center">
                  <span className="mr-3" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </div>
                {item.count && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.count}
                  </Badge>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card/70 backdrop-blur sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
          {/* Mobile menu button */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </Button>
            
            <h1 className="font-semibold text-lg hidden md:block">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="hidden md:flex">
              <BellRing size={18} />
            </Button>
            <ModeToggle />
            <UserAccountNav />
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          <Outlet />
        </main>
        
        <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Status Page. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
