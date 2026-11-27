// Phase 5 task 12: app lock (A01).
import { describe, it, expect, vi } from 'vitest';

const stored = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (k: string) => stored.get(k) ?? null),
    setItem: vi.fn(async (k: string, v: string) => void stored.set(k, v)),
    removeItem: vi.fn(async (k: string) => void stored.delete(k)),
  },
}));

import { canUseAppLock, isAppLockOn, lockMethod, setAppLock, shouldLock, unlockWithDevice } from '../services/security/app-lock';
import * as LA from 'expo-local-authentication';

const la = LA as unknown as {
  __setNextAuthResult: (r: { success: boolean }) => void;
  __setEnrolledLevel: (l: number, t?: number[]) => void;
  calls: { options: Record<string, unknown> }[];
};

describe('app lock', () => {
  it('locks only when on and the app goes to the background', () => {
    expect(shouldLock('background', true)).toBe(true);
    expect(shouldLock('inactive', true)).toBe(false);
    expect(shouldLock('active', true)).toBe(false);
    expect(shouldLock('background', false)).toBe(false);
  });

  it('remembers whether it is on; off by default', async () => {
    stored.clear();
    expect(await isAppLockOn()).toBe(false);
    await setAppLock(true);
    expect(await isAppLockOn()).toBe(true);
    await setAppLock(false);
    expect(await isAppLockOn()).toBe(false);
  });

  it('unlocks only on success, and always lets the phone offer its PIN', async () => {
    la.__setNextAuthResult({ success: true });
    expect(await unlockWithDevice('Unlock Ayoreni')).toBe(true);
    expect(la.calls.at(-1)?.options).toMatchObject({ promptMessage: 'Unlock Ayoreni', disableDeviceFallback: false });
    la.__setNextAuthResult({ success: false });
    expect(await unlockWithDevice('Unlock Ayoreni')).toBe(false);
  });

  it('works only when the phone has a biometric or PIN set, and names the method', async () => {
    la.__setEnrolledLevel(0);
    expect(await canUseAppLock()).toBe(false);
    la.__setEnrolledLevel(3, [1]);
    expect(await canUseAppLock()).toBe(true);
    expect(await lockMethod()).toBe('fingerprint');
    la.__setEnrolledLevel(3, [2]);
    expect(await lockMethod()).toBe('faceId');
  });
});
