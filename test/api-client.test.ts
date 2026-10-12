import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { ApiClient, ApiError } from '../services/api/client';

describe('ApiClient', () => {
  const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
  });

  it('successfully parses valid responses with Zod schema', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'usr_1', email: 'test@example.com' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const client = new ApiClient({ baseUrl: 'http://api.test' });
    const data = await client.get('/user', UserSchema);

    expect(data.id).toBe('usr_1');
    expect(data.email).toBe('test@example.com');
  });

  it('throws ApiError with 422 when response fails Zod schema', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'usr_1', email: 'not-an-email' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const client = new ApiClient({ baseUrl: 'http://api.test' });
    await expect(client.get('/user', UserSchema)).rejects.toThrow(ApiError);
  });

  it('triggers onUnauthorized and throws ApiError on 401 status', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Token expired' } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const onUnauthorized = vi.fn();
    const client = new ApiClient({ baseUrl: 'http://api.test', onUnauthorized });

    await expect(client.get('/protected')).rejects.toThrow(ApiError);
    expect(onUnauthorized).toHaveBeenCalled();
  });
});
