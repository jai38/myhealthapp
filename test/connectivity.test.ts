import { describe, it, expect } from 'vitest';
import { toConnectivityStatus, shouldShowOfflineBanner } from '../services/network/connectivity';
import { createSupportCode } from '../features/system/supportCode';

describe('toConnectivityStatus', () => {
  it('online when connected and reachable', () => {
    expect(toConnectivityStatus({ isConnected: true, isInternetReachable: true })).toBe('online');
  });
  it('offline when not connected', () => {
    expect(toConnectivityStatus({ isConnected: false, isInternetReachable: false })).toBe('offline');
    expect(toConnectivityStatus({ isConnected: false, isInternetReachable: null })).toBe('offline');
  });
  it('offline when connected but internet proven unreachable', () => {
    expect(toConnectivityStatus({ isConnected: true, isInternetReachable: false })).toBe('offline');
  });
  it('unknown, not offline, when reachability is null', () => {
    expect(toConnectivityStatus({ isConnected: true, isInternetReachable: null })).toBe('unknown');
    expect(toConnectivityStatus({ isConnected: null, isInternetReachable: null })).toBe('unknown');
  });
  it('unknown when there is no state yet', () => {
    expect(toConnectivityStatus(null)).toBe('unknown');
    expect(toConnectivityStatus(undefined)).toBe('unknown');
  });
});

describe('shouldShowOfflineBanner', () => {
  it('shows only when offline and clears on reconnect', () => {
    expect(shouldShowOfflineBanner('offline')).toBe(true);
    expect(shouldShowOfflineBanner('unknown')).toBe(false);
    expect(shouldShowOfflineBanner('online')).toBe(false);
  });
});

describe('createSupportCode', () => {
  it('takes no user data', () => {
    expect(createSupportCode.length).toBe(0);
  });
  it('is an opaque ID made of a prefix, timestamp and random characters only', () => {
    const code = createSupportCode(new Date('2026-11-05T10:00:00Z'));
    expect(code).toMatch(/^AY-[0-9A-Z]+-[A-Z2-9]{4}$/);
  });
  it('differs between calls at the same time', () => {
    const at = new Date(0);
    const codes = new Set(Array.from({ length: 20 }, () => createSupportCode(at)));
    expect(codes.size).toBeGreaterThan(1);
  });
});
