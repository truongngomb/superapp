/**
 * Auth Hook
 * Provides access to authentication context
 */

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '@/context';

/**
 * Hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
