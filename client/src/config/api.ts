/**
 * API Configuration and HTTP Client
 */

// Use relative path to leverage Vite proxy
const API_BASE = '/api';

interface RequestConfig {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Custom error class for API errors
 */
export class ApiException extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
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

/**
 * HTTP client with type safety
 * Automatically unwraps { success, data } response format
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  config: RequestConfig = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    // Always include credentials (cookies) for auth
    credentials: 'include',
    ...(config.signal && { signal: config.signal }),
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();

  if (!response.ok) {
    const errorData = json as ApiError;
    throw new ApiException(
      errorData.message || 'An error occurred',
      response.status,
      errorData.code
    );
  }

  // Unwrap { success, data } format from server
  // This allows services to expect the data directly
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }

  // Fallback for endpoints that don't use the wrapper format
  return json as T;
}

/**
 * API client with HTTP methods
 */
export const api = {
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { method: 'GET' }, config);
  },

  post<T>(endpoint: string, data: unknown, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }, config);
  },

  put<T>(endpoint: string, data: unknown, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }, config);
  },

  patch<T>(endpoint: string, data: unknown, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }, config);
  },

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' }, config);
  },
};
