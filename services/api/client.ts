import { z, ZodSchema } from 'zod';
import { t } from '../../design/strings';

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
  // On a 401, renews the session. 'retry' sends the request once more with the current token;
  // 'rejected' means the session ended; 'unreachable' means it could not be renewed right now.
  refreshSession?: (failedToken: string | null) => Promise<'retry' | 'rejected' | 'unreachable'>;
}

export class ApiClient {
  private baseUrl: string;
  private getToken?: () => Promise<string | null>;
  private onUnauthorized?: () => void;
  private refreshSession?: ApiClientConfig['refreshSession'];

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.getToken = config.getToken;
    this.onUnauthorized = config.onUnauthorized;
    this.refreshSession = config.refreshSession;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { schema?: ZodSchema<T> } = {},
    retried = false
  ): Promise<T> {
    const { schema, headers: customHeaders, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Timezone-Offset': String(new Date().getTimezoneOffset()),
      ...((customHeaders as Record<string, string>) || {}),
    };

    let sentToken: string | null = null;
    if (this.getToken) {
      const token = await this.getToken();
      sentToken = token;
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
      throw new ApiError(0, 'NETWORK_ERROR', t('api.networkError'), err);
    }

    if (response.status === 401) {
      if (this.refreshSession && !retried) {
        const outcome = await this.refreshSession(sentToken);
        if (outcome === 'retry') return this.request<T>(endpoint, options, true);
        if (outcome === 'unreachable') {
          throw new ApiError(0, 'NETWORK_ERROR', t('api.networkError'));
        }
      } else if (this.onUnauthorized) {
        this.onUnauthorized();
      }
      throw new ApiError(401, 'UNAUTHORIZED', t('api.sessionExpired'));
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      if (!response.ok) {
        throw new ApiError(response.status, 'HTTP_ERROR', t('api.httpError', { status: response.status }));
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

import { authService } from '../auth/auth-service';
import { resolveApiBaseUrl } from '../config/environment';

/** prod, dev or local, picked by EXPO_PUBLIC_APP_ENV (services/config/environment.ts). */
export const getApiBaseUrl = (): string => resolveApiBaseUrl();

// Default production-ready client instance with dynamic URL and persisted token
export const api = new ApiClient({
  baseUrl: getApiBaseUrl(),
  getToken: () => authService.getToken(),
  // A 401 renews the session once and retries; only a server-rejected refresh ends it.
  refreshSession: (failedToken) => authService.refreshSession(failedToken),
});

