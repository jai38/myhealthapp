import { describe, expect, it, vi } from 'vitest';
import {
  AppStatus,
  appStatusDecision,
  applyDismissal,
  compareVersions,
  parseAppStatus,
  shouldRecheck,
} from '../services/app-status/appStatus';
import { fetchAppStatus } from '../services/app-status/appStatusClient';
import { DISMISSED_VERSION_KEY, loadDismissedVersion, saveDismissedVersion } from '../services/app-status/appStatusStorage';

const status = (over: Partial<AppStatus> = {}): AppStatus => ({
  minVersion: '0.0.0',
  latestVersion: '0.0.0',
  maintenance: { active: false },
  ...over,
});

const body = (data: unknown) => ({ data });
const okResponse = (json: unknown) => ({ ok: true, json: async () => json }) as unknown as Response;

describe('compareVersions', () => {
  it('compares numerically, not as strings', () => {
    expect(compareVersions('1.0.0', '1.0.10')).toBeLessThan(0);
    expect(compareVersions('1.0.10', '1.0.9')).toBeGreaterThan(0);
    expect(compareVersions('2.0.0', '10.0.0')).toBeLessThan(0);
  });
  it('treats missing parts as zero', () => {
    expect(compareVersions('1', '1.0.0')).toBe(0);
    expect(compareVersions('1.2', '1.2.0')).toBe(0);
    expect(compareVersions('1.2', '1.2.1')).toBeLessThan(0);
  });
  it('is zero for equal versions', () => {
    expect(compareVersions('1.4.2', '1.4.2')).toBe(0);
  });
});

describe('appStatusDecision', () => {
  it('is ok when current is up to date', () => {
    expect(appStatusDecision(status({ minVersion: '1.0.0', latestVersion: '1.0.0' }), '1.0.0')).toBe('ok');
  });
  it('requires an update below minVersion', () => {
    expect(appStatusDecision(status({ minVersion: '1.2.0', latestVersion: '1.3.0' }), '1.0.0')).toBe(
      'requiredUpdate',
    );
  });
  it('offers an optional update below latestVersion only', () => {
    expect(appStatusDecision(status({ minVersion: '1.0.0', latestVersion: '1.3.0' }), '1.0.0')).toBe(
      'optionalUpdate',
    );
  });
  it('maintenance wins over a required update', () => {
    expect(
      appStatusDecision(
        status({ minVersion: '9.0.0', maintenance: { active: true, message: 'Back soon' } }),
        '1.0.0',
      ),
    ).toBe('maintenance');
  });
  it('fails open with no status', () => {
    expect(appStatusDecision(null, '1.0.0')).toBe('ok');
    expect(appStatusDecision(undefined, '1.0.0')).toBe('ok');
  });
  it('fails open when the current version is unknown or malformed', () => {
    const s = status({ minVersion: '9.0.0', latestVersion: '9.0.0' });
    expect(appStatusDecision(s, null)).toBe('ok');
    expect(appStatusDecision(s, 'banana')).toBe('ok');
  });
  it('server defaults (0.0.0) never block', () => {
    expect(appStatusDecision(status(), '1.0.0')).toBe('ok');
  });
});

describe('parseAppStatus', () => {
  it('accepts the server shape', () => {
    expect(
      parseAppStatus(
        body({ minVersion: '1.0.0', latestVersion: '1.2.0', maintenance: { active: true, message: ' Soon ' } }),
      ),
    ).toEqual({ minVersion: '1.0.0', latestVersion: '1.2.0', maintenance: { active: true, message: 'Soon' } });
  });
  it.each([
    null,
    'x',
    {},
    body(null),
    body({ minVersion: 'x', latestVersion: '1.0.0', maintenance: { active: false } }),
    body({ minVersion: '1.0.0', latestVersion: '1.0.0' }),
    body({ minVersion: '1.0.0', latestVersion: '1.0.0', maintenance: { active: 'yes' } }),
  ])('rejects malformed body %#', (b) => {
    expect(parseAppStatus(b)).toBeNull();
  });
});

describe('fetchAppStatus', () => {
  const good = body({ minVersion: '1.5.0', latestVersion: '1.6.0', maintenance: { active: false } });

  it('returns required-update data and sends no auth header', async () => {
    const fetchImpl = vi.fn(async () => okResponse(good));
    const result = await fetchAppStatus('https://api.test/api/v1/', { fetchImpl: fetchImpl as never });
    expect(appStatusDecision(result, '1.0.0')).toBe('requiredUpdate');
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.test/api/v1/app-status');
    expect(JSON.stringify(init.headers ?? {}).toLowerCase()).not.toContain('authorization');
  });

  it('returns optional-update data', async () => {
    const fetchImpl = vi.fn(async () =>
      okResponse(body({ minVersion: '1.0.0', latestVersion: '1.1.0', maintenance: { active: false } })),
    );
    const result = await fetchAppStatus('https://api.test', { fetchImpl: fetchImpl as never });
    expect(appStatusDecision(result, '1.0.0')).toBe('optionalUpdate');
  });

  it('returns maintenance data with the message', async () => {
    const fetchImpl = vi.fn(async () =>
      okResponse(body({ minVersion: '0.0.0', latestVersion: '0.0.0', maintenance: { active: true, message: 'Back at 6' } })),
    );
    const result = await fetchAppStatus('https://api.test', { fetchImpl: fetchImpl as never });
    expect(appStatusDecision(result, '1.0.0')).toBe('maintenance');
    expect(result?.maintenance.message).toBe('Back at 6');
  });

  it('fails open when unreachable', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network down');
    });
    const result = await fetchAppStatus('https://api.test', { fetchImpl: fetchImpl as never });
    expect(result).toBeNull();
    expect(appStatusDecision(result, '1.0.0')).toBe('ok');
  });

  it('fails open on a non-200 response', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, json: async () => ({}) }) as unknown as Response);
    expect(await fetchAppStatus('https://api.test', { fetchImpl: fetchImpl as never })).toBeNull();
  });

  it('fails open on a malformed body or invalid JSON', async () => {
    const bad = vi.fn(async () => okResponse({ data: { minVersion: 5 } }));
    expect(await fetchAppStatus('https://api.test', { fetchImpl: bad as never })).toBeNull();
    const notJson = vi.fn(
      async () =>
        ({
          ok: true,
          json: async () => {
            throw new SyntaxError('bad json');
          },
        }) as unknown as Response,
    );
    expect(await fetchAppStatus('https://api.test', { fetchImpl: notJson as never })).toBeNull();
  });

  it('fails open on timeout', async () => {
    const fetchImpl = vi.fn(() => new Promise<Response>(() => {}));
    const result = await fetchAppStatus('https://api.test', { fetchImpl: fetchImpl as never, timeoutMs: 20 });
    expect(result).toBeNull();
  });
});

describe('"Not now" suppression', () => {
  const s = status({ minVersion: '1.0.0', latestVersion: '1.3.0' });

  it('hides the nudge for the dismissed latestVersion', () => {
    expect(applyDismissal('optionalUpdate', s, '1.3.0')).toBe('ok');
  });
  it('shows it again for a newer latestVersion', () => {
    expect(applyDismissal('optionalUpdate', status({ latestVersion: '1.4.0' }), '1.3.0')).toBe('optionalUpdate');
  });
  it('shows it when nothing was dismissed', () => {
    expect(applyDismissal('optionalUpdate', s, null)).toBe('optionalUpdate');
  });
  it('never suppresses a required update or maintenance', () => {
    expect(applyDismissal('requiredUpdate', s, '1.3.0')).toBe('requiredUpdate');
    expect(applyDismissal('maintenance', s, '1.3.0')).toBe('maintenance');
  });
  it('persists and reads the dismissed version, and works without storage', async () => {
    const mem = new Map<string, string>();
    const store = {
      getItem: async (k: string) => mem.get(k) ?? null,
      setItem: async (k: string, v: string) => {
        mem.set(k, v);
      },
    };
    await saveDismissedVersion(store, '1.3.0');
    expect(mem.get(DISMISSED_VERSION_KEY)).toBe('1.3.0');
    expect(await loadDismissedVersion(store)).toBe('1.3.0');
    expect(await loadDismissedVersion(null)).toBeNull();
    const broken = {
      getItem: async () => {
        throw new Error('x');
      },
      setItem: async () => {
        throw new Error('x');
      },
    };
    expect(await loadDismissedVersion(broken)).toBeNull();
    await expect(saveDismissedVersion(broken, '1.3.0')).resolves.toBeUndefined();
  });
});

describe('shouldRecheck', () => {
  it('checks the first time, then at most once per interval', () => {
    const interval = 5 * 60 * 1000;
    expect(shouldRecheck(null, 1000, interval)).toBe(true);
    expect(shouldRecheck(1000, 1000 + interval - 1, interval)).toBe(false);
    expect(shouldRecheck(1000, 1000 + interval, interval)).toBe(true);
  });
});
