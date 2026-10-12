import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../services/auth/auth-service';

describe('AuthService & Session Persistence', () => {
  beforeEach(async () => {
    await authService.logout();
    vi.restoreAllMocks();
  });

  it('starts unauthenticated after logout', () => {
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getSession()).toBeNull();
  });

  it('successfully logs in and caches user session', async () => {
    const mockResponse = {
      data: {
        user: { id: 'usr_test_1', email: 'test@example.com', fullName: 'Test User' },
        session: {
          accessToken: 'jwt-access-token-123',
          patientProfileId: 'pat_test_1',
          refreshToken: 'refresh-token-123',
          expiresAt: Date.now() + 3600000,
        },
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const session = await authService.login('test@example.com', 'password123');

    expect(session.userId).toBe('usr_test_1');
    expect(session.accessToken).toBe('jwt-access-token-123');
    expect(session.patientProfileId).toBe('pat_test_1');
    expect(authService.isAuthenticated()).toBe(true);

    const token = await authService.getToken();
    expect(token).toBe('jwt-access-token-123');
  });

  it('throws descriptive error when login fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Invalid credentials' } }),
    } as Response);

    await expect(authService.login('bad@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('clears session on logout', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          user: { id: 'usr_1', email: 'test@example.com' },
          session: { accessToken: 'token-abc', patientProfileId: 'pat_1' },
        },
      }),
    } as Response);

    await authService.login('test@example.com', 'password123');
    expect(authService.isAuthenticated()).toBe(true);

    await authService.logout();
    expect(authService.isAuthenticated()).toBe(false);
    expect(await authService.getToken()).toBeNull();
  });
});
