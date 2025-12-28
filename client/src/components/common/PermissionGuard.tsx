import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface PermissionGuardProps {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGuard = ({ 
  resource, 
  action, 
  children, 
  fallback = null 
}: PermissionGuardProps) => {
  const { checkPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  if (checkPermission(resource, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
