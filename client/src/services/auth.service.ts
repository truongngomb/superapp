import { api } from '@/config/api';
import type { AuthResponse } from '@/types';

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
