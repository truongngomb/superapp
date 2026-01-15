/**
 * OpenAPI Configuration
 * 
 * Defines base metadata for OpenAPI 3.1 specification.
 * Used by Scalar UI for API documentation.
 */
import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';

// =============================================================================
// Registry (Singleton)
// =============================================================================

/**
 * Global OpenAPI registry for registering schemas and paths.
 * Import this in route files to register endpoints.
 */
export const openApiRegistry = new OpenAPIRegistry();

// =============================================================================
// Security Schemes
// =============================================================================

// Register Bearer Auth security scheme
openApiRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT token obtained from /api/auth/google login flow',
});

// Register Cookie Auth security scheme (alternative)
openApiRegistry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'pb_auth',
  description: 'Session cookie set after authentication',
});

// =============================================================================
// Generator Function
// =============================================================================

/**
 * Generate OpenAPI document from registered schemas and paths.
 * 
 * @param serverUrl - Base URL of the API server
 * @returns OpenAPI 3.1 document object
 */
export function generateOpenApiDocument(serverUrl: string) {
  const generator = new OpenApiGeneratorV31(openApiRegistry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'SuperApp API',
      version: '1.0.0',
      description: `
# SuperApp REST API Documentation

This API provides endpoints for managing the SuperApp platform.

## Authentication

Most endpoints require authentication via JWT token. After logging in with Google OAuth,
the token is stored in a cookie (\`pb_auth\`) and automatically included in requests.

For testing in Scalar UI, you can:
1. Login to the app first (sets cookie)
2. Or manually add the Bearer token in the Authorization header

## Rate Limiting

Batch operations are rate-limited to prevent abuse.

## Pagination

List endpoints support pagination with \`page\` and \`limit\` query parameters.
      `.trim(),
      contact: {
        name: 'SuperApp Team',
      },
      license: {
        name: 'Internal Use Only',
      },
    },
    servers: [
      {
        url: serverUrl,
        description: 'Current Server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Roles', description: 'Role and permission management' },
      { name: 'Categories', description: 'Category management (SSoT reference)' },
      { name: 'Activity Logs', description: 'Audit trail' },
      { name: 'Settings', description: 'Application settings' },
      { name: 'System', description: 'System health and info' },
    ],
    security: [
      { bearerAuth: [] },
      { cookieAuth: [] },
    ],
  });
}
