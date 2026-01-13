/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import { api, createAbortController, API_ENDPOINTS, env } from '@/config';
import type { AuthStatusResponse, AuthUser, OAuthConfigResponse } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface ServiceConfig {
  /** Request timeout in ms (default: env.API_REQUEST_TIMEOUT) */
  timeout?: number;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

// ============================================================================
// Service
// ============================================================================

export const authService = {
  /**
   * Get current authenticated user
   * @returns Auth status with user data if authenticated
   */
  async getCurrentUser(config?: ServiceConfig): Promise<AuthStatusResponse> {
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      return await api.get<AuthStatusResponse>(
        API_ENDPOINTS.AUTH.ME,
        { signal: config?.signal ?? controller.signal }
      );
    } finally {
      clear();
    }
  },

  /**
   * Initiate Google OAuth login
   * Redirects browser to Google OAuth flow
   */
  loginWithGoogle(): void {
    window.location.href = `/api${API_ENDPOINTS.AUTH.GOOGLE}`;
  },

  /**
   * Get Google OAuth client configuration
   */
  async getGoogleConfig(): Promise<OAuthConfigResponse> {
    return api.get<OAuthConfigResponse>(`${API_ENDPOINTS.AUTH.GOOGLE}/config`);
  },

  /**
   * Logout current user
   * Clears session cookie on server
   */
  async logout(): Promise<void> {
    return api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Refresh current session
   * Used to extend session without re-authentication
   */
  async refreshSession(): Promise<AuthUser | null> {
    const response = await this.getCurrentUser();
    return response.isAuthenticated ? response.user : null;
  },
};
