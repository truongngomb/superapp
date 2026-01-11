/**
 * Authentication Controller
 * 
 * Handles OAuth authentication and session management endpoints.
 */
import { Request, Response } from 'express';
import { config } from '../config/index.js';
import { authService } from '../services/index.js';
import { InternalServerError } from '../middleware/index.js';
import { createLogger } from '../utils/index.js';

// =============================================================================
// Constants
// =============================================================================

const log = createLogger('AuthController');

const COOKIE_NAME = 'pb_auth';
/**
 * Cookie security options:
 * - httpOnly: Prevents XSS attacks from accessing the cookie via JavaScript
 * - secure: Only send cookie over HTTPS (enabled in production only to allow local HTTP dev)
 * - sameSite: Prevents CSRF attacks by restricting cross-site cookie sending
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction, // HTTPS required in production
  sameSite: 'lax' as const,
};

// =============================================================================
// Handlers
// =============================================================================

/**
 * GET /auth/google - Initiate Google OAuth flow
 */
export const initGoogleAuth = async (_req: Request, res: Response) => {
  try {
    const { url, state, codeVerifier } = await authService.initGoogleAuth();

    // Store state and verifier in cookie for callback
    res.cookie('oauth_state', JSON.stringify({ state, codeVerifier }), {
      ...COOKIE_OPTIONS,
      maxAge: config.auth.oauthStateMaxAge,
    });

    res.redirect(url);
  } catch (error) {
    log.error('Google OAuth init error', error);
    throw new InternalServerError('Failed to initiate OAuth');
  }
};

/**
 * GET /auth/google/callback - Handle Google OAuth callback
 */
export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query as { code: string; state: string };
    const oauthState = req.cookies['oauth_state'] as string | undefined;

    if (!code || !state || !oauthState) {
      res.redirect(`${config.clientUrl}/login?error=invalid_callback`); return;
    }

    const { state: savedState, codeVerifier } = JSON.parse(oauthState) as { state: string; codeVerifier: string };

    if (state !== savedState) {
      res.redirect(`${config.clientUrl}/login?error=state_mismatch`); return;
    }

    const { token } = await authService.handleGoogleCallback(code, codeVerifier);

    // Clear OAuth state cookie
    res.clearCookie('oauth_state');

    // Set auth cookie with token only (optimized)
    res.cookie(COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: config.auth.sessionMaxAge,
    });

    res.redirect(config.clientUrl);
  } catch (error) {
    log.error('Google callback error', error);
    res.redirect(`${config.clientUrl}/login?error=auth_failed`);
  }
};

/**
 * GET /auth/me - Get current authenticated user session
 * 
 * For guest users (no token), returns permissions from "Public" role if available.
 * This allows frontend to check permissions before requiring login.
 */
export const getMe = async (req: Request, res: Response) => {
  // If req.user exists and is a guest user (assigned by authenticate middleware)
  if (req.user?.isGuest) {
    return res.json({
      success: true,
      data: {
        user: {
          id: 'guest',
          email: '',
          name: 'Guest',
          avatar: null,
          permissions: req.user.permissions,
          isGuest: true,
        },
        isAuthenticated: false,
      },
    });
  }

  const token = req.cookies[COOKIE_NAME] as string | undefined;

  if (!token) {
    return res.json({ 
      success: true, 
      data: { user: null, isAuthenticated: false } 
    });
  }

  try {
    const session = await authService.validateSession(token);
    res.json({ success: true, data: session });
  } catch (error) {
    log.warn('Session validation failed', error);
    res.json({ 
      success: true, 
      data: { user: null, isAuthenticated: false } 
    });
  }
};

/**
 * POST /auth/logout - Logout user
 */
export const logout = (_req: Request, res: Response) => {
  authService.logout();
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true, message: 'Logged out successfully' });
};
