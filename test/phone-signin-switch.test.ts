// Phase 5: phone sign-in stays off in production and by default (working agreement rule 5).
import { describe, it, expect } from 'vitest';
import { isPhoneSignInEnabled } from '../services/config/phoneSignIn';
import { __forTests, getInstallId } from '../services/auth/install-id';

describe('phone sign-in switch', () => {
  it('is off by default, and always off in production', () => {
    expect(isPhoneSignInEnabled({})).toBe(false);
    expect(isPhoneSignInEnabled({ appEnv: 'prod', phoneSignIn: 'on' })).toBe(false);
    expect(isPhoneSignInEnabled({ appEnv: '', phoneSignIn: 'on' })).toBe(false);
    expect(isPhoneSignInEnabled({ appEnv: 'dev' })).toBe(false);
  });

  it('turns on only in dev or local with EXPO_PUBLIC_PHONE_SIGN_IN=on', () => {
    expect(isPhoneSignInEnabled({ appEnv: 'dev', phoneSignIn: 'on' })).toBe(true);
    expect(isPhoneSignInEnabled({ appEnv: 'local', phoneSignIn: ' ON ' })).toBe(true);
    expect(isPhoneSignInEnabled({ appEnv: 'dev', phoneSignIn: 'yes' })).toBe(false);
  });
});

describe('install id', () => {
  it('is a v4 UUID, made once and kept', async () => {
    __forTests.reset();
    const a = await getInstallId();
    __forTests.reset();
    const b = await getInstallId();
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(b).toBe(a);
    expect(__forTests.uuidV4()).not.toBe(__forTests.uuidV4());
  });
});
