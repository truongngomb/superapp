import { Router } from 'express';
import { authController } from '../controllers/index.js';

export const authRouter = Router();

// Google OAuth
authRouter.get('/google', authController.initGoogleAuth);
authRouter.get('/google/callback', authController.handleGoogleCallback);

// User session
authRouter.get('/me', authController.getMe);
authRouter.post('/logout', authController.logout);
