import PocketBase from 'pocketbase';
import NodeCache from 'node-cache';

const tokenCache = new NodeCache({ stdTTL: 300 }); // 5 min cache

export interface VerifyTokenOptions {
  pocketbaseUrl: string;
  cacheEnabled?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role?: unknown;
}

/**
 * Verify authentication token with PocketBase
 * @param token - JWT token to verify
 * @param options - Verification options including PocketBase URL
 * @returns Authenticated user information
 */
export async function verifyToken(
  token: string,
  options: VerifyTokenOptions
): Promise<AuthUser> {
  // Check cache first
  if (options.cacheEnabled !== false) {
    const cached = tokenCache.get<AuthUser>(token);
    if (cached) return cached;
  }

  try {
    const pb = new PocketBase(options.pocketbaseUrl);
    pb.authStore.save(token);
    
    const authData = await pb.collection('users').authRefresh();
    
    const user: AuthUser = {
      id: authData.record.id,
      email: authData.record.email,
      role: authData.record.expand?.role,
    };

    // Cache the result
    if (options.cacheEnabled !== false) {
      tokenCache.set(token, user);
    }

    return user;
  } catch {
    throw new Error('Invalid token');
  }
}
