import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthModel } from 'pocketbase';
import { authService } from '@/services/auth.service';
import { Toast } from '@/components/common/Toast';

interface AuthContextType {
  user: AuthModel | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<AuthModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

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
      console.error('Failed to check auth:', err);
      if (err.status >= 500) {
        setError('Không thể kết nối đến máy chủ xác thực.');
      } else if (err.status !== 401 && err.status !== 403) {
         // Ignore 401/403 as it just means not logged in
         setError(err.message || 'Lỗi xác thực không xác định');
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
      console.error('Logout failed:', err);
      // Still clear user locally even if server logout fails
      setUser(null); 
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    loginWithGoogle,
    logout,
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
