// Phase 5 phone sign-in client against the api.md shapes (backend PR #12), with a fake fetch.
import { describe, it, expect } from 'vitest';
import { PhoneAuthError, phoneAuthClient } from '../services/auth/phone-auth-client';

type Reply = { status: number; body: unknown };
function fakeFetch(reply: Reply, seen: { url?: string; init?: RequestInit } = {}) {
  return (async (url: string, init?: RequestInit) => {
    seen.url = url;
    seen.init = init;
    return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { 'Content-Type': 'application/json' } });
  }) as unknown as typeof fetch;
}
const DEVICE = { installId: '00000000-0000-4000-8000-000000000001', name: 'Test phone', platform: 'android' as const };

describe('phoneAuthClient', () => {
  it('requests a code with the number, install id and terms version', async () => {
    const seen: { url?: string; init?: RequestInit } = {};
    const r = await phoneAuthClient.requestCode('9876543210', DEVICE.installId, 'v1', fakeFetch({
      status: 200,
      body: { data: { requestId: 'r1', codeLength: 6, expiresInSeconds: 600, resendAfterSeconds: 30, channel: 'WHATSAPP' } },
    }, seen));
    expect(r.requestId).toBe('r1');
    expect(seen.url).toMatch(/\/auth\/otp\/request$/);
    expect(JSON.parse(String(seen.init?.body))).toEqual({ phone: '9876543210', installId: DEVICE.installId, termsVersion: 'v1' });
    expect((seen.init?.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('maps a rate limit with its reason and wait', async () => {
    const err = await phoneAuthClient
      .requestCode('9876543210', DEVICE.installId, 'v1', fakeFetch({
        status: 429,
        body: { error: { code: 'RATE_LIMITED', details: { reason: 'TOO_MANY_CODES', retryAfterSeconds: 600 } } },
      }))
      .catch((e) => e);
    expect(err).toBeInstanceOf(PhoneAuthError);
    expect(err).toMatchObject({ code: 'RATE_LIMITED', status: 429, details: { reason: 'TOO_MANY_CODES', retryAfterSeconds: 600 } });
  });

  it('a network failure is NETWORK, and an unknown error code is SERVER', async () => {
    const down = (async () => { throw new TypeError('offline'); }) as unknown as typeof fetch;
    expect(await phoneAuthClient.delivery('r1', down).catch((e) => e.code)).toBe('NETWORK');
    expect(await phoneAuthClient.delivery('r1', fakeFetch({ status: 500, body: { error: { code: 'BOOM' } } })).catch((e) => e.code)).toBe('SERVER');
  });

  it('reads the late "no WhatsApp" delivery result', async () => {
    expect(await phoneAuthClient.delivery('r1', fakeFetch({ status: 200, body: { data: { delivery: 'WHATSAPP_UNAVAILABLE' } } }))).toBe('WHATSAPP_UNAVAILABLE');
  });

  it('verify returns each of the three shapes', async () => {
    const signedIn = await phoneAuthClient.verify('r1', '123456', DEVICE, fakeFetch({ status: 200, body: { data: {
      status: 'SIGNED_IN', needsSecondFactor: false, isNewUser: true, profileComplete: false,
      accessToken: 'a', refreshToken: 'r', expiresAt: 1, deviceId: 'd',
    } } }));
    expect(signedIn).toMatchObject({ status: 'SIGNED_IN', isNewUser: true, profileComplete: false });
    const second = await phoneAuthClient.verify('r1', '123456', DEVICE, fakeFetch({ status: 200, body: { data: {
      status: 'SECOND_FACTOR_REQUIRED', needsSecondFactor: true, secondFactorToken: 's', methods: ['RECOVERY_CODE'],
      expiresInSeconds: 600, withoutCode: 'RECORDS_HIDDEN',
    } } }));
    expect(second).toMatchObject({ status: 'SECOND_FACTOR_REQUIRED', withoutCode: 'RECORDS_HIDDEN' });
    const support = await phoneAuthClient.verify('r1', '123456', DEVICE, fakeFetch({ status: 200, body: { data: { status: 'SUPPORT_REQUIRED', needsSecondFactor: false } } }));
    expect(support.status).toBe('SUPPORT_REQUIRED');
    expect('accessToken' in support).toBe(false);
  });

  it('a wrong code carries the attempts left; an expired one is CODE_EXPIRED', async () => {
    expect(await phoneAuthClient.verify('r1', '000000', DEVICE, fakeFetch({ status: 400, body: { error: { code: 'WRONG_CODE', details: { attemptsLeft: 2 } } } })).catch((e) => e))
      .toMatchObject({ code: 'WRONG_CODE', details: { attemptsLeft: 2 } });
    expect(await phoneAuthClient.verify('r1', '000000', DEVICE, fakeFetch({ status: 410, body: { error: { code: 'CODE_EXPIRED' } } })).catch((e) => e.code)).toBe('CODE_EXPIRED');
  });

  it('S03 sends the token; under 18 is UNDER_18', async () => {
    const seen: { url?: string; init?: RequestInit } = {};
    const err = await phoneAuthClient.saveAccount('tok', { fullName: 'Asha Test' }, fakeFetch({ status: 422, body: { error: { code: 'UNDER_18' } } }, seen)).catch((e) => e);
    expect(err.code).toBe('UNDER_18');
    expect(seen.init?.method).toBe('PUT');
    expect((seen.init?.headers as Record<string, string>).Authorization).toBe('Bearer tok');
  });

  it('a reply that does not match the contract is refused, not half-used', async () => {
    expect(await phoneAuthClient.verify('r1', '123456', DEVICE, fakeFetch({ status: 200, body: { data: { status: 'SIGNED_IN' } } })).catch((e) => e.code)).toBe('SERVER');
  });
});
