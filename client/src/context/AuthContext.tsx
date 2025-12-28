import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '@/services';
import { logger } from '@/utils/logger';
import type { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  checkPermission: (resource: string, action: string) => boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  },[]);

  const checkAuth = async () => {
    try {
      setError(null);
      const data = await authService.getCurrentUser();
      
      if (data.isAuthenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      logger.error('AuthContext', 'Failed to check auth:', err);
      // Ignore 401/403 as it just means not logged in
      if (err.status && err.status !== 401 && err.status !== 403) {
         setError(err.message || 'Unknown authentication error');
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useCallback(() => {
    authService.loginWithGoogle();
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      logger.error('AuthContext', 'Logout failed:', err);
      setUser(null); 
    }
  }, []);

  const checkPermission = useCallback((resource: string, action: string): boolean => {
    if (!user || !user.permissions) return false;

    const resourcePerms = user.permissions[resource] || [];
    const allPerms = user.permissions['all'] || [];

    if (resourcePerms.includes(action)) return true;
    if (resourcePerms.includes('manage')) return true;
    if (allPerms.includes('manage')) return true;

    return false;
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    loginWithGoogle,
    logout,
    checkPermission,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 z-50">
           <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
             <span>⚠️ {error}</span>
             <button onClick={() => setError(null)} className="ml-2 hover:bg-red-600 rounded p-1">✕</button>
           </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
