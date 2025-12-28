import { Request, Response } from 'express';
import { config } from '../config/env.js';
import { authService } from '../services/authService.js';
import { logger } from '../utils/index.js';

const COOKIE_NAME = 'pb_auth';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Initiate Google OAuth flow
 */
export const initGoogleAuth = async (_req: Request, res: Response) => {
  try {
    const { url, state, codeVerifier } = await authService.initGoogleAuth();

    // Store state and verifier in cookie for callback
    res.cookie('oauth_state', JSON.stringify({ state, codeVerifier }), {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: 5 * 60 * 1000, // 5 minutes
      sameSite: 'lax',
    });

    res.redirect(url);
  } catch (error) {
    logger.error('AuthController', 'Google OAuth init error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate OAuth' });
  }
};

/**
 * Handle Google OAuth callback
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

    const { token, model } = await authService.handleGoogleCallback(code as string, codeVerifier);

    // Clear OAuth state cookie
    res.clearCookie('oauth_state');

    // Set auth cookie with token
    res.cookie(COOKIE_NAME, JSON.stringify({ token, model }), {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
    });

    res.redirect(config.clientUrl);
  } catch (error) {
    logger.error('AuthController', 'Google callback error:', error);
    res.redirect(`${config.clientUrl}/login?error=auth_failed`);
  }
};

/**
 * Get current authenticated user session
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const authCookie = req.cookies[COOKIE_NAME];
    
    if (!authCookie) {
      return res.json({ user: null, isAuthenticated: false });
    }

    const { token, model } = JSON.parse(authCookie);
    const session = await authService.validateSession(token, model);

    res.json(session);
  } catch (error) {
    logger.error('AuthController', 'Get user error:', error);
    res.json({ user: null, isAuthenticated: false });
  }
};

/**
 * Logout user
 */
export const logout = (_req: Request, res: Response) => {
  authService.logout();
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true, message: 'Logged out successfully' });
};
