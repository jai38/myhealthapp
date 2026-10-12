import { z, ZodSchema } from 'zod';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => Promise<string | null>;
  onUnauthorized?: () => void;
}

export class ApiClient {
  private baseUrl: string;
  private getToken?: () => Promise<string | null>;
  private onUnauthorized?: () => void;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.getToken = config.getToken;
    this.onUnauthorized = config.onUnauthorized;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { schema?: ZodSchema<T> } = {}
  ): Promise<T> {
    const { schema, headers: customHeaders, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((customHeaders as Record<string, string>) || {}),
    };

    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    } catch (err) {
      throw new ApiError(0, 'NETWORK_ERROR', 'Network connection unavailable or failed', err);
    }

    if (response.status === 401) {
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }
      throw new ApiError(401, 'UNAUTHORIZED', 'Session expired or unauthorized');
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      if (!response.ok) {
        throw new ApiError(response.status, 'HTTP_ERROR', `HTTP ${response.status} Error`);
      }
      json = null;
    }

    if (!response.ok) {
      const errorPayload = json as { error?: { code?: string; message?: string; details?: unknown } };
      const code = errorPayload?.error?.code || 'UNKNOWN_ERROR';
      const message = errorPayload?.error?.message || `Request failed with status ${response.status}`;
      throw new ApiError(response.status, code, message, errorPayload?.error?.details);
    }

    if (schema) {
      const parsed = schema.safeParse(json);
      if (!parsed.success) {
        throw new ApiError(
          422,
          'SCHEMA_VALIDATION_ERROR',
          'API response did not match expected schema',
          parsed.error.format()
        );
      }
      return parsed.data;
    }

    return json as T;
  }

  get<T>(endpoint: string, schema?: ZodSchema<T>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', schema });
  }

  post<T>(endpoint: string, body?: unknown, schema?: ZodSchema<T>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      schema,
    });
  }

  put<T>(endpoint: string, body?: unknown, schema?: ZodSchema<T>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      schema,
    });
  }

  patch<T>(endpoint: string, body?: unknown, schema?: ZodSchema<T>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      schema,
    });
  }

  delete<T>(endpoint: string, schema?: ZodSchema<T>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', schema });
  }
}

// Default client instance targeting local backend
export const api = new ApiClient({
  baseUrl: 'http://localhost:4000/api/v1',
});
