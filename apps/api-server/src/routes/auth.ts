/**
 * Auth Routes
 * 
 * Handles authentication-related endpoints.
 */
import { Router } from 'express';
import { asyncHandler, standardRateLimit } from '../middleware/index.js';
import { authController } from '../controllers/index.js';

export const authRouter: Router = Router();

// =============================================================================
// Google OAuth
// =============================================================================

/** Initiate Google OAuth flow */
authRouter.get('/google', standardRateLimit, asyncHandler(authController.initGoogleAuth));

/** Handle Google OAuth callback */
authRouter.get('/google/callback', standardRateLimit, asyncHandler(authController.handleGoogleCallback));

// =============================================================================
// User Session
// =============================================================================

/** Get current authenticated user */
authRouter.get('/me', asyncHandler(authController.getMe));

/** Logout user */
authRouter.post('/logout', standardRateLimit, authController.logout);
