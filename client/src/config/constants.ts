import { env } from './env';
/**
 * Application Constants
 * Centralized constant values used across the app
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    ME: '/auth/me',
    GOOGLE: '/auth/google',
    LOGOUT: '/auth/logout',
  },
  CATEGORIES: '/categories',
  ROLES: '/roles',
  USERS: '/users',
  ACTIVITY_LOGS: '/activity-logs',
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
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
  CATEGORIES_VIEW_MODE: 'categories_view_mode',
  CATEGORIES_SORT: 'categories_sort',
  USERS_VIEW_MODE: 'users_view_mode',
  USERS_SORT: 'users_sort',
  ROLES_VIEW_MODE: 'roles_view_mode',
  ROLES_SORT: 'roles_sort',
  ACTIVITY_LOGS_SORT: 'activity_logs_sort',
  LAYOUT_MODE: 'layout_mode',
} as const;

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: env.DEFAULT_PAGE_SIZE,
  MAX_LIMIT: env.MAX_PAGE_SIZE,
} as const;

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints (px) - matches Tailwind defaults
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// RBAC Constants
export const PERMISSIONS = {
  RESOURCES: ['categories', 'users', 'roles', 'activity_logs', 'dashboard', 'all'] as const,
  ACTIONS: ['view', 'create', 'update', 'delete', 'manage'] as const,
} as const;
