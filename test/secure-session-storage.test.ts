// Phase 5 task 11: session tokens live in secure storage (the keychain / keystore on a phone),
// never in plain AsyncStorage. A session saved the old way is moved on first load.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Platform } from 'react-native';

const plain = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (k: string) => plain.get(k) ?? null),
    setItem: vi.fn(async (k: string, v: string) => void plain.set(k, v)),
    removeItem: vi.fn(async (k: string) => void plain.delete(k)),
  },
}));

import * as SecureStore from 'expo-secure-store';

const realOS = Platform.OS;
const setOS = (os: string) => Object.defineProperty(Platform, 'OS', { value: os, configurable: true });

// Fresh app modules per test; the secure store is read through the same fresh instance.
let store: typeof SecureStore = SecureStore;
async function freshAuth() {
  vi.resetModules();
  const auth = (await import('../services/auth/auth-service')).authService;
  store = (await import('expo-secure-store')) as typeof SecureStore;
  return auth;
}

const loginReply = {
  data: {
    user: { id: 'usr_1', email: 'asha.test@seed.ayoreni.test', fullName: 'Asha Test' },
    session: { accessToken: 'access-synthetic', refreshToken: 'refresh-synthetic', patientProfileId: 'pat_1', expiresAt: Date.now() + 3600_000 },
  },
};

describe('secure session storage on a phone', () => {
  beforeEach(() => {
    plain.clear();
    (SecureStore as unknown as { __resetSecureStore: () => void }).__resetSecureStore();
    setOS('android');
  });
  afterEach(() => {
    setOS(realOS);
    vi.restoreAllMocks();
  });

  it('keeps the tokens in secure storage and out of plain storage', async () => {
    const auth = await freshAuth();
    await auth.waitForInitialization();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => loginReply } as Response);
    await auth.login('asha.test@seed.ayoreni.test', 'synthetic-password');

    const plainText = [...plain.values()].join('\n');
    expect(plainText).not.toContain('access-synthetic');
    expect(plainText).not.toContain('refresh-synthetic');
    const secret = await store.getItemAsync('_myhealthapp_session_tokens');
    expect(secret).toContain('access-synthetic');
    expect(secret).toContain('refresh-synthetic');
  });

  it('a session saved before this change is moved: tokens out of plain storage, still signed in', async () => {
    plain.set('@myhealthapp/user_session', JSON.stringify({ userId: 'usr_1', patientProfileId: 'pat_1', accessToken: 'old-access', refreshToken: 'old-refresh', expiresAt: Date.now() + 3600_000 }));
    plain.set('@myhealthapp/auth_token', 'old-access');
    const auth = await freshAuth();
    await auth.waitForInitialization();
    expect(auth.getSession()?.accessToken).toBe('old-access');
    expect([...plain.values()].join('\n')).not.toContain('old-access');
    expect(await store.getItemAsync('_myhealthapp_session_tokens')).toContain('old-refresh');
  });

  it('sign-out removes the tokens from secure storage too', async () => {
    const auth = await freshAuth();
    await auth.waitForInitialization();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => loginReply } as Response);
    await auth.login('asha.test@seed.ayoreni.test', 'synthetic-password');
    await auth.logout();
    expect(await store.getItemAsync('_myhealthapp_session_tokens')).toBeNull();
    expect(plain.get('@myhealthapp/user_session')).toBeUndefined();
  });

  it('a session whose tokens are gone is treated as signed out', async () => {
    plain.set('@myhealthapp/user_session', JSON.stringify({ userId: 'usr_1', patientProfileId: 'pat_1' }));
    const auth = await freshAuth();
    await auth.waitForInitialization();
    expect(auth.getSession()).toBeNull();
  });

  it('a phone sign-in saves a phone session with no email', async () => {
    const auth = await freshAuth();
    await auth.waitForInitialization();
    const s = await auth.signInWithPhone({
      accessToken: 'p-access', refreshToken: 'p-refresh', expiresAt: Date.now() + 900_000,
      userId: 'usr_2', patientProfileId: 'pat_2', phone: '+919876543210', profileComplete: false, onboarding: 'pending',
    });
    expect(s).toMatchObject({ kind: 'phone', phone: '+919876543210', profileComplete: false });
    expect(s.email).toBeUndefined();
    expect([...plain.values()].join('\n')).not.toContain('p-access');
    await auth.markProfileComplete('Asha Test');
    expect(auth.getSession()).toMatchObject({ profileComplete: true, fullName: 'Asha Test' });
  });
});
