import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import authService from '../services/authService';

interface LayoutProps {
  hasDemoAccess: boolean;
  demoEnabled: boolean;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  hasDemoAccess,
  demoEnabled,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const userName = user ? `${user.firstName} ${user.lastName}` : undefined;

  const getCurrentView = (): string => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return 'dashboard';
    if (path.startsWith('/systems')) return 'systems';
    if (path === '/scanner') return 'scanner';
    if (path === '/demo-access') return 'demo-access';
    if (path === '/audit-tools') return 'audit-tools';
    if (path.startsWith('/audit')) return 'audit-flow';
    return 'dashboard';
  };

  const handleNavigate = (targetView: string) => {
    switch (targetView) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'systems':
        navigate('/systems');
        break;
      case 'scanner':
        navigate('/scanner');
        break;
      case 'audit-tools':
        if (!hasDemoAccess) {
          navigate('/demo-access');
        } else {
          navigate('/audit-tools');
        }
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentView={getCurrentView()}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        userName={userName}
        hasDemoAccess={hasDemoAccess}
        demoEnabled={demoEnabled}
      />
      <Outlet />
    </div>
  );
};

export default Layout;
