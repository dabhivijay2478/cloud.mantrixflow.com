/**
 * API Client
 * Reusable fetch wrapper with error handling
 */

import { getApiUrl, createFetchOptions } from './config';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  suggestion?: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  meta: {
    statusCode: number;
    message: string;
    status: 'success' | 'error' | 'warning';
    timestamp: string;
    requestId?: string;
    metadata?: Record<string, unknown>;
  };
  data: T;
}

export interface ApiListResponse<T> {
  meta: {
    statusCode: number;
    message: string;
    status: 'success' | 'error' | 'warning';
    timestamp: string;
    requestId?: string;
    metadata?: Record<string, unknown>;
  };
  data: T[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ApiDeleteResponse {
  meta: {
    statusCode: number;
    message: string;
    status: 'success' | 'error' | 'warning';
    timestamp: string;
  };
  deletedId: string;
}

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: unknown,
    public suggestion?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Handle API response and extract data
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let error: ApiError;

    if (isJson) {
      const errorData = await response.json();
      error = {
        code: errorData.error?.code || 'UNKNOWN_ERROR',
        message: errorData.error?.message || errorData.meta?.message || 'An error occurred',
        details: errorData.error?.details,
        suggestion: errorData.error?.suggestion,
        statusCode: response.status,
      };
    } else {
      const text = await response.text();
      error = {
        code: 'HTTP_ERROR',
        message: text || `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };
    }

    throw new ApiClientError(
      error.code,
      error.message,
      error.statusCode || response.status,
      error.details,
      error.suggestion,
    );
  }

  if (isJson) {
    const data = await response.json();
    // If response has the standard API response structure, extract data
    if (data.data !== undefined && data.meta) {
      return data.data as T;
    }
    return data as T;
  }

  return (await response.text()) as unknown as T;
}

/**
 * API Client class with reusable methods
 */
export class ApiClient {
  /**
   * GET request
   */
  static async get<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = getApiUrl(endpoint);
    const fetchOptions = await createFetchOptions({
      ...options,
      method: 'GET',
    });

    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response);
  }

  /**
   * POST request
   */
  static async post<T>(
    endpoint: string,
    body?: unknown,
    options: RequestInit = {},
  ): Promise<T> {
    const url = getApiUrl(endpoint);
    const fetchOptions = await createFetchOptions({
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });

    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  static async patch<T>(
    endpoint: string,
    body?: unknown,
    options: RequestInit = {},
  ): Promise<T> {
    const url = getApiUrl(endpoint);
    const fetchOptions = await createFetchOptions({
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });

    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  static async delete<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = getApiUrl(endpoint);
    const fetchOptions = await createFetchOptions({
      ...options,
      method: 'DELETE',
    });

    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  static async put<T>(
    endpoint: string,
    body?: unknown,
    options: RequestInit = {},
  ): Promise<T> {
    const url = getApiUrl(endpoint);
    const fetchOptions = await createFetchOptions({
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });

    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response);
  }
}
