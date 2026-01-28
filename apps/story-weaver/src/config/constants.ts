import { PermissionResource, PermissionAction } from '@superapp/shared-types';

/**
 * Application Constants
 * Centralized constant values used across the app
 */

export const APP_NAME = 'Story Weaver';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    ME: '/auth/me',
  },
  VIDEO_PROJECTS: '/story-weaver/video-projects',
  VIDEO_SCENES: '/story-weaver/video-scenes',
} as const;


// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  SETTINGS: 'app_settings',
  
  VIDEO_PROJECTS_VIEW_MODE: 'video_projects_view_mode',
  VIDEO_PROJECTS_SORT: 'video_projects_sort'
} as const;

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;


// RBAC Constants
export const PERMISSIONS = {
  RESOURCES: Object.values(PermissionResource),
  ACTIONS: Object.values(PermissionAction),
} as const;
