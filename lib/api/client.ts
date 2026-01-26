/**
 * API Client
 * Reusable fetch wrapper with error handling
 */

import { createFetchOptions, getApiUrl } from "./config";

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
    status: "success" | "error" | "warning";
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
    status: "success" | "error" | "warning";
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
    status: "success" | "error" | "warning";
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
    this.name = "ApiClientError";
  }
}

/**
 * Handle API response and extract data
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    let error: ApiError;

    try {
      if (isJson) {
        const errorData = await response.json();
        error = {
          code: errorData.error?.code || "UNKNOWN_ERROR",
          message:
            errorData.error?.message ||
            errorData.meta?.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          details: errorData.error?.details || errorData,
          suggestion: errorData.error?.suggestion,
          statusCode: response.status,
        };
      } else {
        const text = await response.text();
        error = {
          code: "HTTP_ERROR",
          message: text || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        };
      }
    } catch (parseError) {
      error = {
        code: "PARSE_ERROR",
        message: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
        details: parseError,
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
    try {
      const data = await response.json();

      // If response has the standard API response structure, extract data
      if (data && typeof data === "object") {
        if (data.data !== undefined && data.meta) {
          return data.data as T;
        }
        // If response is the data directly (some endpoints return data directly)
        if (!data.meta && !data.error) {
          return data as T;
        }
        // If response has error in it even though status is OK
        if (data.error) {
          throw new ApiClientError(
            data.error.code || "API_ERROR",
            data.error.message || "An error occurred",
            response.status,
            data.error.details,
            data.error.suggestion,
          );
        }
      }
      return data as T;
    } catch (parseError) {
      if (parseError instanceof ApiClientError) {
        throw parseError;
      }
      throw new ApiClientError(
        "PARSE_ERROR",
        "Failed to parse response from server",
        response.status,
        parseError,
      );
    }
  }

  return (await response.text()) as unknown as T;
}

/**
 * API Client class with reusable methods
 */
export class ApiClient {
  /**
   * GET request
   * @param endpoint - API endpoint
   * @param options - Fetch options (can include token)
   */
  static async get<T>(
    endpoint: string,
    options: RequestInit & { token?: string | null } = {},
  ): Promise<T> {
    const url = getApiUrl(endpoint);
    const { token, ...fetchOptions } = options;
    const finalOptions = await createFetchOptions(
      {
        ...fetchOptions,
        method: "GET",
      },
      token,
    );

    const response = await fetch(url, finalOptions);
    return handleResponse<T>(response);
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Fetch options (can include token in headers or pass via options)
   */
  static async post<T>(
    endpoint: string,
    body?: unknown,
    options: RequestInit & { token?: string | null } = {},
  ): Promise<T> {
    try {
      const url = getApiUrl(endpoint);
      const { token, ...fetchOptions } = options;
      const finalOptions = await createFetchOptions(
        {
          ...fetchOptions,
          method: "POST",
          body: body ? JSON.stringify(body) : undefined,
        },
        token,
      );

      const response = await fetch(url, finalOptions);
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        "NETWORK_ERROR",
        error instanceof Error ? error.message : "Network request failed",
        0,
        error,
      );
    }
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
      method: "PATCH",
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
      method: "DELETE",
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
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });

    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response);
  }
}
