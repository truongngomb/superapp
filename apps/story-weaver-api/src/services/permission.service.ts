/**
 * Permission Service
 * 
 * Handles permission fetching from the central API Server.
 * This ensures Single Source of Truth for RBAC.
 */
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import type { User } from '../types/index.js';

interface UserWithPermissions extends User {
  permissions: Record<string, string[]>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Fetch authenticated user profile and permissions from API Server
 */
export async function getUserPermissions(token: string): Promise<UserWithPermissions> {
  const url = `${config.apiServerUrl}/api/auth/me`;
  try {    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pb_auth=${token}`, 
      },
      signal: AbortSignal.timeout(5000), 
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Server responded with ${response.status} ${response.statusText}: ${text}`);
    }

    const json = await response.json() as ApiResponse<{ user: UserWithPermissions; isAuthenticated: boolean }>;
    
    if (!json.success || !json.data || !json.data.user) {
        throw new Error(`Invalid response format from API Server: ${JSON.stringify(json)}`);
    }

    return json.data.user;
  } catch (error) {
    logger.error('PermissionService', `Error fetching user from API Server (${url}):`, error);
    throw error;
  }
}

/**
 * Get permissions for the Public role (guest)
 */
export async function getPublicRolePermissions(): Promise<Record<string, string[]>> {
    return {};
}
