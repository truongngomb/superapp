/**
 * API Configuration and HTTP Client
 * Enhanced with retry logic, request interceptors, and better error handling
 */

import { env } from './env';
import { HTTP_STATUS } from './constants';

// ============================================================================
// Types
// ============================================================================

export interface RequestConfig {
  /** Additional headers */
  headers?: Record<string, string>;
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
  /** Number of retry attempts (default: 0) */
  retries?: number;
  /** Retry delay in ms (default: 1000) */
  retryDelay?: number;
  /** Skip automatic response unwrapping */
  rawResponse?: boolean;
}

export interface ApiErrorData {
  message: string;
  status: number;
  code?: string;
}

/**
 * Custom error class for API errors
 */
export class ApiException extends Error {
  readonly status: number;
  readonly code?: string;
  readonly isNetworkError: boolean;

  constructor(message: string, status: number, code?: string, isNetworkError = false) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
    this.isNetworkError = isNetworkError;
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiException);
    }
  }

  /** Check if error is unauthorized (401) */
  get isUnauthorized(): boolean {
    return this.status === HTTP_STATUS.UNAUTHORIZED;
  }

  /** Check if error is forbidden (403) */
  get isForbidden(): boolean {
    return this.status === HTTP_STATUS.FORBIDDEN;
  }

  /** Check if error is not found (404) */
  get isNotFound(): boolean {
    return this.status === HTTP_STATUS.NOT_FOUND;
  }

  /** Check if error is a server error (5xx) */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
}

/**
 * Generic API response wrapper from server
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  code?: string;
}

// ============================================================================
// Request Interceptors
// ============================================================================

type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

/**
 * Add a request interceptor
 */
export function addRequestInterceptor(interceptor: RequestInterceptor): () => void {
  requestInterceptors.push(interceptor);
  return () => {
    const index = requestInterceptors.indexOf(interceptor);
    if (index > -1) requestInterceptors.splice(index, 1);
  };
}

/**
 * Add a response interceptor
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
  responseInterceptors.push(interceptor);
  return () => {
    const index = responseInterceptors.indexOf(interceptor);
    if (index > -1) responseInterceptors.splice(index, 1);
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Delay execution
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is retryable
 */
const isRetryableError = (status: number): boolean => {
  return status === 408 || status === 429 || status >= 500;
};

// ============================================================================
// Core Request Function
// ============================================================================

/**
 * HTTP client with type safety
 * Automatically unwraps { success, data } response format
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  config: RequestConfig = {}
): Promise<T> {
  const { 
    retries = 0, 
    retryDelay = env.API_RETRY_DELAY, 
    rawResponse = false,
    ...restConfig 
  } = config;
  
  const url = `${env.API_BASE_URL}${endpoint}`;
  
  let fetchOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...restConfig.headers,
    },
    credentials: 'include',
    ...(restConfig.signal && { signal: restConfig.signal }),
  };

  // Apply request interceptors
  for (const interceptor of requestInterceptors) {
    fetchOptions = await interceptor(fetchOptions);
  }

  let lastError: ApiException | null = null;
  let attempts = 0;

  while (attempts <= retries) {
    try {
      let response = await fetch(url, fetchOptions);

      // Apply response interceptors
      for (const interceptor of responseInterceptors) {
        response = await interceptor(response);
      }

      // Handle 204 No Content
      if (response.status === HTTP_STATUS.NO_CONTENT) {
        return undefined as T;
      }

      const json: unknown = await response.json();

      if (!response.ok) {
        const errorData = json as ApiErrorData;
        throw new ApiException(
          errorData.message || 'An error occurred',
          response.status,
          errorData.code
        );
      }

      // Return raw response if requested
      if (rawResponse) {
        return json as T;
      }

      // Unwrap { success, data } format from server
      const typedJson = json as Record<string, unknown>;
      if (typeof json === 'object' && json !== null && 'success' in typedJson && 'data' in typedJson) {
        return typedJson.data as T;
      }

      return json as T;
      
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        lastError = new ApiException(
          'Network error. Please check your connection.',
          0,
          'NETWORK_ERROR',
          true
        );
      } else if (error instanceof ApiException) {
        lastError = error;
        
        // Only retry on retryable errors
        if (!isRetryableError(error.status)) {
          throw error;
        }
      } else {
        throw error;
      }

      attempts++;
      
      if (attempts <= retries) {
        await delay(retryDelay * attempts); // Exponential backoff
      }
    }
  }

  // Throw last error after all retries exhausted
  throw lastError || new ApiException('Unknown error', 0);
}

// ============================================================================
// API Client
// ============================================================================

/**
 * API client with HTTP methods
 */
export const api = {
  /**
   * GET request
   */
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { method: 'GET' }, config);
  },

  /**
   * POST request
   */
  post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>(
      endpoint,
      { method: 'POST', body: data ? JSON.stringify(data) : undefined },
      config
    );
  },

  /**
   * PUT request
   */
  put<T>(endpoint: string, data: unknown, config?: RequestConfig): Promise<T> {
    return request<T>(
      endpoint,
      { method: 'PUT', body: JSON.stringify(data) },
      config
    );
  },

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, data: unknown, config?: RequestConfig): Promise<T> {
    return request<T>(
      endpoint,
      { method: 'PATCH', body: JSON.stringify(data) },
      config
    );
  },

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' }, config);
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create an AbortController with timeout
 */
export function createAbortController(timeoutMs: number): {
  controller: AbortController;
  clear: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => { controller.abort(); }, timeoutMs);
  
  return {
    controller,
    clear: () => { clearTimeout(timeoutId); },
  };
}
