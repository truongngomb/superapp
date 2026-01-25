/**
 * OpenAPI Configuration
 * 
 * Defines base metadata for OpenAPI 3.1 specification.
 * Used by Scalar UI for API documentation.
 */
import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { OpenAPIObject } from 'openapi3-ts/oas31';

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
  description: 'JWT token',
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
export function generateOpenApiDocument(serverUrl: string): OpenAPIObject {
  const generator = new OpenApiGeneratorV31(openApiRegistry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Story Weaver API',
      version: '1.0.0',
      description: `
# Story Weaver API Documentation

AI Video Generation Service.

## Authentication

Authenticated endpoints require a Bearer token.
      `.trim(),
    },
    servers: [
      {
        url: serverUrl,
        description: 'API Server',
      },
    ],
    tags: [
      { name: 'System', description: 'System health and info' },
      { name: 'Video Projects', description: 'Video project management' },
    ],
    security: [
      { bearerAuth: [] },
    ],
  });
}
