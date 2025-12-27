import { AuthModel } from 'pocketbase';
import { api } from '@/config/api';

export interface AuthResponse {
  user: AuthModel | null;
  isAuthenticated: boolean;
}

export const authService = {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthResponse> {
    return api.get<AuthResponse>('/auth/me');
  },

  /**
   * Initiate Google Login
   * Note: This redirects the browser, so it doesn't return
   */
  loginWithGoogle(): void {
    window.location.href = '/api/auth/google';
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    return api.post('/auth/logout', {});
  },
};
