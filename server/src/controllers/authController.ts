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
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
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
      maxAge: 5 * 60 * 1000, // 5 minutes
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
    const { code, state } = req.query;
    const oauthState = req.cookies['oauth_state'];

    if (!code || !state || !oauthState) {
      return res.redirect(`${config.clientUrl}/login?error=invalid_callback`);
    }

    const { state: savedState, codeVerifier } = JSON.parse(oauthState);

    if (state !== savedState) {
      return res.redirect(`${config.clientUrl}/login?error=state_mismatch`);
    }

    const { token } = await authService.handleGoogleCallback(code as string, codeVerifier);

    // Clear OAuth state cookie
    res.clearCookie('oauth_state');

    // Set auth cookie with token only (optimized)
    res.cookie(COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(config.clientUrl);
  } catch (error) {
    log.error('Google callback error', error);
    res.redirect(`${config.clientUrl}/login?error=auth_failed`);
  }
};

/**
 * GET /auth/me - Get current authenticated user session
 */
export const getMe = async (req: Request, res: Response) => {
  const token = req.cookies[COOKIE_NAME];

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
