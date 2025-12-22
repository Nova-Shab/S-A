import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireDemo?: boolean;
  hasDemoAccess?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireDemo = false,
  hasDemoAccess = false,
}) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireDemo && !hasDemoAccess) {
    return <Navigate to="/demo-access" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
