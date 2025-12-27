import { Router, Request, Response } from 'express';
import { pb } from '../config/database.js';
import { config } from '../config/env.js';

export const authRouter = Router();

const REDIRECT_URI = `${config.serverUrl}/api/auth/google/callback`;

const COOKIE_NAME = 'pb_auth';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow
 */
authRouter.get('/google', async (_req: Request, res: Response) => {
  try {
    // Get OAuth2 auth methods from PocketBase
    const authMethods = await pb.collection('users').listAuthMethods();
    const googleProvider = authMethods.authProviders.find(p => p.name === 'google');
    
    if (!googleProvider) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google OAuth not configured in PocketBase' 
      });
    }

    // Store state and verifier in cookie for callback
    res.cookie('oauth_state', JSON.stringify({
      state: googleProvider.state,
      codeVerifier: googleProvider.codeVerifier,
    }), {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: 5 * 60 * 1000, // 5 minutes
      sameSite: 'lax',
    });

    // Custom authUrl with our redirect_uri
    const url = new URL(googleProvider.authUrl);
    url.searchParams.set('redirect_uri', REDIRECT_URI);

    // Redirect to Google OAuth
    res.redirect(url.toString());
  } catch (error) {
    console.error('[Auth] Google OAuth init error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate OAuth' });
  }
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth callback
 */
authRouter.get('/google/callback', async (req: Request, res: Response) => {
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

    // Exchange code for auth token
    const authData = await pb.collection('users').authWithOAuth2Code(
      'google',
      code as string,
      codeVerifier,
      REDIRECT_URI
    );

    // Clear OAuth state cookie
    res.clearCookie('oauth_state');

    // Set auth cookie with token
    res.cookie(COOKIE_NAME, JSON.stringify({
      token: pb.authStore.token,
      model: authData.record,
    }), {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
    });

    // Redirect to client
    res.redirect(config.clientUrl);
  } catch (error) {
    console.error('[Auth] Google callback error:', error);
    res.redirect(`${config.clientUrl}/login?error=auth_failed`);
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user
 */
authRouter.get('/me', (req: Request, res: Response) => {
  try {
    const authCookie = req.cookies[COOKIE_NAME];
    
    if (!authCookie) {
      return res.json({ user: null, isAuthenticated: false });
    }

    const { token, model } = JSON.parse(authCookie);
    
    // Validate token
    pb.authStore.save(token, model);
    
    if (!pb.authStore.isValid) {
      return res.json({ user: null, isAuthenticated: false });
    }

    const avatarUrl = model.avatar 
      ? pb.files.getUrl(model, model.avatar)
      : null;

    res.json({
      user: {
        id: model.id,
        email: model.email,
        name: model.name,
        avatar: avatarUrl,
      },
      isAuthenticated: true,
    });
  } catch (error) {
    console.error('[Auth] Get user error:', error);
    res.json({ user: null, isAuthenticated: false });
  }
});

/**
 * POST /api/auth/logout
 * Logs out the user
 */
authRouter.post('/logout', (_req: Request, res: Response) => {
  pb.authStore.clear();
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true, message: 'Logged out successfully' });
});
