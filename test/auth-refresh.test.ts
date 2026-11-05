import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

import { authService, UserSession } from '../services/auth/auth-service';
import { ApiClient } from '../services/api/client';
import { setNotificationsModuleForTesting } from '../services/notifications/notification-service';

const ok = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body, text: async () => '' }) as unknown as Response;
const status = (code: number) =>
  ({ ok: false, status: code, json: async () => ({}), text: async () => '' }) as unknown as Response;

const refreshBody = (n: number) =>
  ok({
    data: {
      session: {
        userId: 'usr_r_1',
        patientProfileId: 'pat_r_1',
        accessToken: `access-${n}`,
        refreshToken: `refresh-${n}`,
        expiresAt: Date.now() + 900_000,
      },
    },
  });

async function signIn(): Promise<UserSession> {
  global.fetch = vi.fn().mockResolvedValue(
    ok({
      data: {
        user: { id: 'usr_r_1', email: 'r@example.com' },
        session: {
          accessToken: 'access-0',
          refreshToken: 'refresh-0',
          patientProfileId: 'pat_r_1',
          expiresAt: Date.now() + 900_000,
        },
      },
    })
  );
  return authService.login('r@example.com', 'synthetic-password');
}

function makeClient() {
  return new ApiClient({
    baseUrl: 'http://localhost/api',
    getToken: () => authService.getToken(),
    refreshSession: (t) => authService.refreshSession(t),
  });
}

describe('session refresh', () => {
  beforeEach(async () => {
    setNotificationsModuleForTesting(null);
    await authService.logout();
  });

  it('a successful refresh stores the new access token, refresh token and expiry', async () => {
    await signIn();
    global.fetch = vi.fn().mockResolvedValue(refreshBody(1));
    expect(await authService.refreshSession(null)).toBe('retry');
    const s = authService.getSession()!;
    expect(s.accessToken).toBe('access-1');
    expect(s.refreshToken).toBe('refresh-1');
    expect(s.expiresAt!).toBeGreaterThan(Date.now());
    expect(s.email).toBe('r@example.com');
    expect(authService.getEndReason()).toBeNull();
  });

  it('concurrent 401s trigger one refresh and each request is retried once', async () => {
    await signIn();
    let refreshCalls = 0;
    const seenAuth: string[] = [];
    global.fetch = vi.fn(async (url: any, init: any) => {
      if (String(url).endsWith('/auth/refresh')) {
        refreshCalls++;
        await new Promise((r) => setTimeout(r, 5));
        return refreshBody(1);
      }
      const auth = init.headers.Authorization as string;
      seenAuth.push(auth);
      return auth === 'Bearer access-1' ? ok({ data: { fine: true } }) : status(401);
    }) as any;

    const client = makeClient();
    const results = await Promise.all([client.get('/a'), client.get('/b'), client.get('/c')]);
    expect(results).toHaveLength(3);
    expect(refreshCalls).toBe(1);
    expect(seenAuth.filter((a) => a === 'Bearer access-1')).toHaveLength(3);
  });

  it('a refresh the server rejects ends the session as expired', async () => {
    await signIn();
    global.fetch = vi.fn().mockResolvedValue(status(401));
    expect(await authService.refreshSession(null)).toBe('rejected');
    expect(authService.getSession()).toBeNull();
    expect(authService.getEndReason()).toBe('expired');
  });

  it('no refresh token ends the session as expired', async () => {
    await signIn();
    (authService.getSession() as UserSession).refreshToken = undefined;
    expect(await authService.refreshSession(null)).toBe('rejected');
    expect(authService.getEndReason()).toBe('expired');
  });

  it('a network failure during refresh keeps the session, and the request fails as a network error', async () => {
    await signIn();
    global.fetch = vi.fn(async (url: any) => {
      if (String(url).endsWith('/auth/refresh')) throw new TypeError('Network request failed');
      return status(401);
    }) as any;

    await expect(makeClient().get('/a')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    expect(authService.getSession()?.accessToken).toBe('access-0');
    expect(authService.getEndReason()).toBeNull();
    // A later attempt can still succeed.
    global.fetch = vi.fn().mockResolvedValue(refreshBody(1));
    expect(await authService.refreshSession(null)).toBe('retry');
  });

  it('a server error during refresh keeps the session', async () => {
    await signIn();
    global.fetch = vi.fn().mockResolvedValue(status(503));
    expect(await authService.refreshSession(null)).toBe('unreachable');
    expect(authService.getSession()).not.toBeNull();
  });

  it('a 401 for a token that is no longer current does not expire the newer session', async () => {
    await signIn();
    global.fetch = vi.fn().mockResolvedValue(refreshBody(1));
    await authService.refreshSession(null);

    // A request sent with the old token comes back 401 after the refresh.
    const fetchMock = vi.fn().mockResolvedValue(status(401));
    global.fetch = fetchMock;
    expect(await authService.refreshSession('access-0')).toBe('retry');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(authService.getSession()?.accessToken).toBe('access-1');
    expect(authService.getEndReason()).toBeNull();
  });
});

describe('startup with an old cached session', () => {
  it('a past expiresAt while offline keeps the session', async () => {
    vi.resetModules();
    const stored = JSON.stringify({
      userId: 'usr_r_2',
      email: 'old@example.com',
      patientProfileId: 'pat_r_2',
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
      expiresAt: Date.now() - 3_600_000,
    });
    vi.doMock('@react-native-async-storage/async-storage', () => ({
      default: {
        getItem: vi.fn(async (key: string) => (key.endsWith('user_session') ? stored : null)),
        setItem: vi.fn(async () => undefined),
        removeItem: vi.fn(async () => undefined),
      },
    }));
    const fetchMock = vi.fn(async () => {
      throw new TypeError('Network request failed');
    });
    global.fetch = fetchMock as any;

    const mod = await import('../services/auth/auth-service');
    await mod.authService.waitForInitialization();
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchMock).toHaveBeenCalled(); // tried to refresh
    expect(mod.authService.getSession()?.userId).toBe('usr_r_2');
    expect(mod.authService.getEndReason()).toBeNull();
  });
});

describe('reminders on sign-out and expiry', () => {
  function mockNotifications() {
    const cancelled: string[] = [];
    setNotificationsModuleForTesting({
      getAllScheduledNotificationsAsync: async () => [
        { identifier: 'med-1-08:00' },
        { identifier: 'snooze-1-x' },
        { identifier: 'other' },
      ],
      cancelScheduledNotificationAsync: async (id: string) => {
        cancelled.push(id);
      },
      dismissAllNotificationsAsync: async () => undefined,
    });
    return cancelled;
  }

  beforeEach(async () => {
    setNotificationsModuleForTesting(null);
    await authService.logout();
  });

  it('a deliberate sign-out cancels med and snooze reminders and calls server logout with the refresh token', async () => {
    await signIn();
    const cancelled = mockNotifications();
    const fetchMock = vi.fn().mockResolvedValue(ok({ data: {} }));
    global.fetch = fetchMock;

    await authService.logout();

    expect(cancelled.sort()).toEqual(['med-1-08:00', 'snooze-1-x']);
    const call = fetchMock.mock.calls.find((c) => String(c[0]).endsWith('/auth/logout'))!;
    expect(JSON.parse((call[1] as any).body)).toEqual({ refreshToken: 'refresh-0' });
    expect(authService.getEndReason()).toBe('signedOut');
  });

  it('sign-out still completes when the server logout fails', async () => {
    await signIn();
    global.fetch = vi.fn().mockRejectedValue(new TypeError('offline'));
    await expect(authService.logout()).resolves.toBeUndefined();
    expect(authService.getSession()).toBeNull();
  });

  it('expiry does not cancel reminders', async () => {
    await signIn();
    const cancelled = mockNotifications();
    await authService.expireSession();
    expect(cancelled).toEqual([]);
    expect(authService.getEndReason()).toBe('expired');
  });
});
