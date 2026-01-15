/**
 * OpenAPI Path Registry
 * 
 * Registers all API endpoints with their OpenAPI metadata.
 * This file imports the global registry and adds path definitions.
 */
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { openApiRegistry } from '../config/openapi.js';

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

// =============================================================================
// Common Response Schemas
// =============================================================================

const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  code: z.string().optional(),
}).openapi('ErrorResponse');

const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
}).openapi('SuccessResponse');

const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
}).openapi('Pagination');

// Register common schemas
openApiRegistry.register('ErrorResponse', ErrorResponseSchema);
openApiRegistry.register('SuccessResponse', SuccessResponseSchema);
openApiRegistry.register('Pagination', PaginationSchema);

// =============================================================================
// Auth Endpoints
// =============================================================================

openApiRegistry.registerPath({
  method: 'post',
  path: '/api/auth/google',
  tags: ['Auth'],
  summary: 'Login with Google OAuth',
  description: 'Authenticates user with Google OAuth token and creates a session.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            token: z.string().describe('Google OAuth ID token'),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              user: z.object({
                id: z.string(),
                email: z.string().email(),
                name: z.string(),
                avatar: z.string().url().optional(),
              }),
            }),
          }),
        },
      },
    },
    401: {
      description: 'Invalid token',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/api/auth/me',
  tags: ['Auth'],
  summary: 'Get current user',
  description: 'Returns the currently authenticated user information.',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    200: {
      description: 'Current user data',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              email: z.string().email(),
              name: z.string(),
              avatar: z.string().url().optional(),
              roles: z.array(z.string()),
              permissions: z.record(z.string(), z.array(z.string())),
            }),
          }),
        },
      },
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/api/auth/logout',
  tags: ['Auth'],
  summary: 'Logout',
  description: 'Clears the authentication session.',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    200: {
      description: 'Logout successful',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
          }),
        },
      },
    },
  },
});

// =============================================================================
// Categories Endpoints
// =============================================================================

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string(),
  icon: z.string(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  created: z.string().datetime(),
  updated: z.string().datetime(),
}).openapi('Category');

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
}).openapi('CreateCategoryInput');

openApiRegistry.register('Category', CategorySchema);
openApiRegistry.register('CreateCategoryInput', CreateCategorySchema);

openApiRegistry.registerPath({
  method: 'get',
  path: '/api/categories',
  tags: ['Categories'],
  summary: 'List categories',
  description: 'Returns paginated list of categories with optional filters.',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  request: {
    query: z.object({
      page: z.string().optional().describe('Page number (default: 1)'),
      limit: z.string().optional().describe('Items per page (default: 10)'),
      sort: z.string().optional().describe('Sort field'),
      order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
      search: z.string().optional().describe('Search in name/description'),
      isActive: z.string().optional().describe('Filter by active status'),
      isDeleted: z.string().optional().describe('Filter by deleted status (admin only)'),
    }),
  },
  responses: {
    200: {
      description: 'Paginated categories',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              items: z.array(CategorySchema),
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/api/categories',
  tags: ['Categories'],
  summary: 'Create category',
  description: 'Creates a new category.',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateCategorySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Category created',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: CategorySchema,
          }),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/api/categories/{id}',
  tags: ['Categories'],
  summary: 'Get category by ID',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe('Category ID'),
    }),
  },
  responses: {
    200: {
      description: 'Category details',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: CategorySchema,
          }),
        },
      },
    },
    404: {
      description: 'Category not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'put',
  path: '/api/categories/{id}',
  tags: ['Categories'],
  summary: 'Update category',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe('Category ID'),
    }),
    body: {
      content: {
        'application/json': {
          schema: CreateCategorySchema.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Category updated',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: CategorySchema,
          }),
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'delete',
  path: '/api/categories/{id}',
  tags: ['Categories'],
  summary: 'Delete category',
  description: 'Soft deletes a category. If already soft-deleted, permanently deletes it.',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe('Category ID'),
    }),
  },
  responses: {
    204: {
      description: 'Category deleted',
    },
  },
});

// =============================================================================
// Users Endpoints (Summary)
// =============================================================================

openApiRegistry.registerPath({
  method: 'get',
  path: '/api/users',
  tags: ['Users'],
  summary: 'List users',
  description: 'Returns paginated list of users. Requires users:view permission.',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    200: {
      description: 'Paginated users',
    },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/api/users',
  tags: ['Users'],
  summary: 'Create user',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    201: {
      description: 'User created',
    },
  },
});

// =============================================================================
// Roles Endpoints (Summary)
// =============================================================================

openApiRegistry.registerPath({
  method: 'get',
  path: '/api/roles',
  tags: ['Roles'],
  summary: 'List roles',
  description: 'Returns paginated list of roles. Requires roles:view permission.',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    200: {
      description: 'Paginated roles',
    },
  },
});

// =============================================================================
// Activity Logs Endpoints
// =============================================================================

openApiRegistry.registerPath({
  method: 'get',
  path: '/api/activity-logs',
  tags: ['Activity Logs'],
  summary: 'List activity logs',
  description: 'Returns paginated list of activity logs. Requires activity_logs:view permission.',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    200: {
      description: 'Paginated activity logs',
    },
  },
});

// =============================================================================
// Settings Endpoints
// =============================================================================

openApiRegistry.registerPath({
  method: 'get',
  path: '/api/settings',
  tags: ['Settings'],
  summary: 'Get all settings',
  description: 'Returns all application settings. Requires admin privileges.',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    200: {
      description: 'Settings object',
    },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/api/settings/public',
  tags: ['Settings'],
  summary: 'Get public settings',
  description: 'Returns public application settings. No authentication required.',
  responses: {
    200: {
      description: 'Public settings',
    },
  },
});

// =============================================================================
// System Endpoints
// =============================================================================

openApiRegistry.registerPath({
  method: 'get',
  path: '/api/health',
  tags: ['System'],
  summary: 'Health check',
  description: 'Returns server health status.',
  responses: {
    200: {
      description: 'Server is healthy',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              status: z.literal('ok'),
              timestamp: z.string().datetime(),
              uptime: z.number(),
              environment: z.string(),
            }),
          }),
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/api/system/info',
  tags: ['System'],
  summary: 'System information',
  description: 'Returns detailed system information. Requires dashboard:view permission.',
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    200: {
      description: 'System info',
    },
  },
});

// =============================================================================
// Export (ensure this file is imported to register paths)
// =============================================================================

export {};
