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

// Register common schemas
openApiRegistry.register('ErrorResponse', ErrorResponseSchema);
openApiRegistry.register('SuccessResponse', SuccessResponseSchema);

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
              service: z.string(),
              timestamp: z.string().datetime(),
              uptime: z.number(),
              environment: z.string(),
              cache: z.any().optional(),
            }),
          }),
        },
      },
    },
  },
});

// Export empty to ensure side-effects
export {};
