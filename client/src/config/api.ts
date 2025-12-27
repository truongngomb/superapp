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
}

/**
 * Custom error class for API errors
 */
export class ApiException extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
  }
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * HTTP client with type safety
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

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.message;
    } catch {
      errorMessage = response.statusText;
    }
    throw new ApiException(errorMessage, response.status);
  }

  return response.json() as Promise<T>;
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
