/**
 * Authentication Service
 * 
 * Handles OAuth authentication and session management.
 */
import { pb, config, Collections } from '../config/index.js';
import { permissionService } from './permissionService.js';
import type { UserSession } from '../types/index.js';
import { createLogger } from '../utils/index.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Google OAuth initialization result
 */
export interface GoogleAuthInitResult {
  url: string;
  state: string;
  codeVerifier: string;
}

/**
 * OAuth authentication result
 */
export interface OAuthResult {
  token: string;
  userId: string;
}

// =============================================================================
// Service Implementation
// =============================================================================

const log = createLogger('AuthService');

/**
 * Service for handling authentication
 */
class AuthService {
  private readonly REDIRECT_URI = `${config.serverUrl}/api/auth/google/callback`;

  /**
   * Initialize Google OAuth flow
   * 
   * @returns OAuth URL, state, and code verifier
   */
  async initGoogleAuth(): Promise<GoogleAuthInitResult> {
    const authMethods = await pb.collection(Collections.USERS).listAuthMethods();
    const googleProvider = authMethods.authProviders.find((p) => p.name === 'google');

    if (!googleProvider) {
      log.error('Google OAuth not configured in PocketBase');
      throw new Error('Google OAuth not configured');
    }

    const url = new URL(googleProvider.authUrl);
    url.searchParams.set('redirect_uri', this.REDIRECT_URI);

    return {
      url: url.toString(),
      state: googleProvider.state,
      codeVerifier: googleProvider.codeVerifier,
    };
  }

  /**
   * Handle Google OAuth callback
   * 
   * @param code - Authorization code from Google
   * @param codeVerifier - Code verifier from init
   * @returns Token and user ID
   */
  async handleGoogleCallback(code: string, codeVerifier: string): Promise<OAuthResult> {
    const authData = await pb.collection(Collections.USERS).authWithOAuth2Code(
      'google',
      code,
      codeVerifier,
      this.REDIRECT_URI
    );

    log.info('User authenticated via Google OAuth', { userId: authData.record.id });

    return {
      token: pb.authStore.token,
      userId: authData.record.id,
    };
  }

  /**
   * Clear current session
   */
  logout(): void {
    pb.authStore.clear();
    log.info('User logged out');
  }

  /**
   * Validate session and get user details
   * 
   * Token-only validation - fetches fresh user data from PocketBase
   * 
   * @param token - JWT token to validate
   * @returns User session with permissions
   */
  async validateSession(token: string): Promise<UserSession> {
    try {
      // Load token and verify with PocketBase
      pb.authStore.save(token, null);

      if (!pb.authStore.isValid) {
        return { user: null, isAuthenticated: false };
      }

      // Fetch fresh user data from PocketBase
      const authData = await pb.collection(Collections.USERS).authRefresh();
      const user = authData.record;

      const avatarUrl = user.avatar
        ? pb.files.getUrl(user, user.avatar)
        : null;

      const permissions = await permissionService.getUserPermissions(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: avatarUrl,
          permissions,
        },
        isAuthenticated: true,
      };
    } catch (error) {
      log.warn('Session validation failed', error);
      return { user: null, isAuthenticated: false };
    }
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const authService = new AuthService();
