/**
 * OpenAPI Documentation Module
 * 
 * Exports the OpenAPI document generator and registry.
 */

// Import registry to ensure all paths are registered
import './registry.js';

// Re-export utilities
export { openApiRegistry, generateOpenApiDocument } from '../config/openapi.js';
