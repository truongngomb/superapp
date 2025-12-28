import { pb, config } from '../config/index.js';
import { getUserPermissions } from './permissionService.js';

interface GoogleAuthInitResult {
  url: string;
  state: string;
  codeVerifier: string;
}

interface AuthResult {
  token: string;
  model: Record<string, unknown>;
}

interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    permissions: Record<string, string[]>;
  } | null;
  isAuthenticated: boolean;
}

export class AuthService {
  private readonly REDIRECT_URI = `${config.serverUrl}/api/auth/google/callback`;

  /**
   * Initialize Google OAuth flow
   */
  async initGoogleAuth(): Promise<GoogleAuthInitResult> {
    const authMethods = await pb.collection('users').listAuthMethods();
    const googleProvider = authMethods.authProviders.find(p => p.name === 'google');
    
    if (!googleProvider) {
      throw new Error('Google OAuth not configured in PocketBase');
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
   */
  async handleGoogleCallback(code: string, codeVerifier: string): Promise<AuthResult> {
    const authData = await pb.collection('users').authWithOAuth2Code(
      'google',
      code,
      codeVerifier,
      this.REDIRECT_URI
    );

    return {
      token: pb.authStore.token,
      model: authData.record,
    };
  }

  /**
   * clear session
   */
  logout(): void {
    pb.authStore.clear();
  }

  /**
   * Validate session and get user details
   */
  async validateSession(token: string, model: any): Promise<UserSession> {
    // Validate token
    pb.authStore.save(token, model);
    
    if (!pb.authStore.isValid) {
      return { user: null, isAuthenticated: false };
    }

    const avatarUrl = model.avatar 
      ? pb.files.getUrl(model, model.avatar)
      : null;

    const permissions = await getUserPermissions(model.id);

    return {
      user: {
        id: model.id,
        email: model.email,
        name: model.name,
        avatar: avatarUrl,
        permissions,
      },
      isAuthenticated: true,
    };
  }
}

export const authService = new AuthService();
