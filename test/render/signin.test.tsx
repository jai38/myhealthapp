// Phase 5 sign-in flow, rendered with a fake API (no network): S01 → S02 → S03 → A01 → A02,
// the new-phone path (A03 → A02 enter) and app lock. Synthetic numbers only.
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SigninFlow } from '../../features/signin/SigninFlow';
import type { SigninDeps } from '../../features/signin/SigninFlow';
import { AppLockGate } from '../../features/signin/AppLockGate';
import { PhoneAuthError } from '../../services/auth/phone-auth-client';
import { Text } from 'react-native';

const NOW = new Date(2026, 10, 27, 10, 0).getTime();
const SIGNED_IN = { status: 'SIGNED_IN' as const, isNewUser: true, profileComplete: false, accessToken: 'a', refreshToken: 'r', expiresAt: NOW + 900_000, deviceId: 'd' };

function makeDeps(over: Partial<SigninDeps['client']> = {}) {
  let session: Record<string, unknown> | null = null;
  const client = {
    requestCode: vi.fn(async () => ({ requestId: 'req-1', codeLength: 6, expiresInSeconds: 600, resendAfterSeconds: 30, channel: 'WHATSAPP' })),
    delivery: vi.fn(async () => 'DELIVERED' as const),
    verify: vi.fn(async () => SIGNED_IN),
    secondFactor: vi.fn(async () => ({ ...SIGNED_IN, isNewUser: false, profileComplete: true, recoveryCodeUsed: true })),
    me: vi.fn(async () => ({ userId: 'u1', patientProfileId: 'p1', phone: '+919876543210', profileComplete: false })),
    account: vi.fn(),
    saveAccount: vi.fn(async () => ({ profileComplete: true })),
    createRecoveryCode: vi.fn(async () => 'K7QF-29XD-M4PN-8RWC'),
    ...over,
  };
  const auth = {
    signInWithPhone: vi.fn(async (s: Record<string, unknown>) => {
      session = { ...s, kind: 'phone' };
      return session as never;
    }),
    markProfileComplete: vi.fn(async () => {}),
    finishOnboarding: vi.fn(async () => {}),
    getSession: vi.fn(() => session as never),
    logout: vi.fn(async () => {}),
  };
  const deps: Partial<SigninDeps> = {
    client: client as unknown as SigninDeps['client'],
    auth: auth as unknown as SigninDeps['auth'],
    installId: async () => '00000000-0000-4000-8000-000000000001',
    readClipboard: async () => 'Your Ayoreni code is 123 456.',
    writeClipboard: vi.fn(async () => true),
    openSupport: vi.fn(),
    setAppLock: vi.fn(async () => {}),
    now: () => NOW,
    pollMs: 20,
  };
  return { deps, client, auth };
}

async function toS02(deps: Partial<SigninDeps>) {
  await render(<SigninFlow deps={deps} />);
  await fireEvent.changeText(screen.getByTestId('s01-number'), '+91 98765 43210');
  await fireEvent.press(screen.getByTestId('s01-terms'));
  await fireEvent.press(screen.getByTestId('s01-continue'));
  await screen.findByTestId('s02');
}

describe('S01', () => {
  it('Continue stays off until a valid number and the Terms box', async () => {
    const { deps, client } = makeDeps();
    await render(<SigninFlow deps={deps} />);
    const off = () => screen.getByTestId('s01-continue').props.accessibilityState?.disabled === true;
    expect(off()).toBe(true);
    await fireEvent.changeText(screen.getByTestId('s01-number'), '9876543210');
    expect(off()).toBe(true);
    await fireEvent.press(screen.getByTestId('s01-terms'));
    expect(off()).toBe(false);
    await fireEvent.press(screen.getByTestId('s01-continue'));
    await waitFor(() => expect(client.requestCode).toHaveBeenCalledWith('9876543210', expect.any(String), expect.any(String)));
  });

  it('too many attempts and no internet show their notes', async () => {
    const { deps } = makeDeps({ requestCode: vi.fn(async () => { throw new PhoneAuthError('RATE_LIMITED', 429, { reason: 'TOO_MANY_CODES' }); }) });
    await render(<SigninFlow deps={deps} />);
    await fireEvent.changeText(screen.getByTestId('s01-number'), '9876543210');
    await fireEvent.press(screen.getByTestId('s01-terms'));
    await fireEvent.press(screen.getByTestId('s01-continue'));
    expect(await screen.findByTestId('s01-rate-limited')).toBeTruthy();
  });
});

describe('S02', () => {
  it('Paste fills all six boxes and verifies at once', async () => {
    const { deps, client } = makeDeps();
    await toS02(deps);
    await fireEvent.press(screen.getByTestId('s02-paste'));
    await waitFor(() => expect(client.verify).toHaveBeenCalledWith('req-1', '123456', expect.objectContaining({ installId: expect.any(String) })));
  });

  it('a wrong code says how many attempts are left and clears the boxes', async () => {
    const { deps } = makeDeps({ verify: vi.fn(async () => { throw new PhoneAuthError('WRONG_CODE', 400, { attemptsLeft: 2 }); }) });
    await toS02(deps);
    await fireEvent.changeText(screen.getByTestId('s02-code'), '000000');
    await fireEvent.press(screen.getByTestId('s02-verify'));
    expect(await screen.findByTestId('s02-wrong')).toHaveTextContent(/2 attempts left/);
  });

  it('"no WhatsApp on this number" arrives late and offers Use Another Number', async () => {
    const { deps } = makeDeps({ delivery: vi.fn(async () => 'WHATSAPP_UNAVAILABLE' as const) });
    await toS02(deps);
    expect(await screen.findByTestId('s02-no-whatsapp')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('s02-use-another'));
    // Back on S01 with the number kept, and Continue off until it changes.
    expect(await screen.findByTestId('s01-no-whatsapp')).toBeTruthy();
    expect(screen.getByTestId('s01-continue').props.accessibilityState?.disabled).toBe(true);
  });
});

describe('new user: S03 → A01 → A02', () => {
  it('saves the account, offers app lock and shows the recovery code once', async () => {
    const { deps, client, auth } = makeDeps();
    await toS02(deps);
    await fireEvent.press(screen.getByTestId('s02-paste'));
    await screen.findByTestId('s03', {}, { timeout: 3000 });
    expect(auth.signInWithPhone).toHaveBeenCalledWith(expect.objectContaining({ onboarding: 'pending', profileComplete: false, userId: 'u1' }));

    // Continue with nothing filled shows the errors and sends nothing.
    await fireEvent.press(screen.getByTestId('s03-continue'));
    expect(screen.getByTestId('s03-name-error')).toHaveTextContent('Please enter your full name.');
    expect(client.saveAccount).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByTestId('s03-name'), 'Asha Test');
    await fireEvent.press(screen.getByTestId('s03-dob'));
    await fireEvent.press(screen.getByTestId('s03-dob-sheet-confirm'));
    await fireEvent.press(screen.getByTestId('s03-gender-FEMALE'));
    await fireEvent.press(screen.getByTestId('s03-consent'));
    await fireEvent.press(screen.getByTestId('s03-continue'));
    await screen.findByTestId('a01-offer');
    expect(client.saveAccount).toHaveBeenCalledWith('a', expect.objectContaining({ fullName: 'Asha Test', gender: 'FEMALE', dateOfBirth: '1996-01-01' }));

    await fireEvent.press(screen.getByTestId('a01-turn-on'));
    expect(deps.setAppLock).toHaveBeenCalledWith(true);
    expect(await screen.findByTestId('a02-code')).toHaveTextContent('K7QF-29XD-M4PN-8RWC');
    expect(screen.getByTestId('a02-continue').props.accessibilityState?.disabled).toBe(true);
    await fireEvent.press(screen.getByTestId('a02-copy'));
    expect(deps.writeClipboard).toHaveBeenCalledWith('K7QF-29XD-M4PN-8RWC');
    expect(screen.getByTestId('a02-copied')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('a02-continue'));
    await waitFor(() => expect(auth.finishOnboarding).toHaveBeenCalled());
  });

  it('under 18 goes to A04 and sends nothing', async () => {
    const { deps, client } = makeDeps();
    await toS02(deps);
    await fireEvent.press(screen.getByTestId('s02-paste'));
    await screen.findByTestId('s03', {}, { timeout: 3000 });
    await fireEvent.changeText(screen.getByTestId('s03-name'), 'Asha Test');
    await fireEvent.press(screen.getByTestId('s03-dob'));
    // Year 2015 on the wheel: 11 years old.
    await fireEvent.press(screen.getByTestId('s03-dob-year-2015'));
    await fireEvent.press(screen.getByTestId('s03-dob-sheet-confirm'));
    await fireEvent.press(screen.getByTestId('s03-gender-FEMALE'));
    await fireEvent.press(screen.getByTestId('s03-consent'));
    await fireEvent.press(screen.getByTestId('s03-continue'));
    expect(await screen.findByTestId('a04')).toBeTruthy();
    expect(client.saveAccount).not.toHaveBeenCalled();
  });
});

describe('new phone: A03 → A02 enter', () => {
  it('a used-up recovery code leads to a new one', async () => {
    const { deps, client } = makeDeps({
      verify: vi.fn(async () => ({ status: 'SECOND_FACTOR_REQUIRED' as const, needsSecondFactor: true, secondFactorToken: 'sf', methods: ['RECOVERY_CODE'], expiresInSeconds: 600, withoutCode: 'RECORDS_HIDDEN' as const })) as never,
      me: vi.fn(async () => ({ userId: 'u1', patientProfileId: 'p1', phone: '+919876543210', profileComplete: true })),
    });
    await toS02(deps);
    await fireEvent.press(screen.getByTestId('s02-paste'));
    await screen.findByTestId('a03-check');
    expect(screen.queryByTestId('a03-passkey')).toBeNull();
    await fireEvent.press(screen.getByTestId('a03-recovery'));
    await fireEvent.changeText(screen.getByTestId('a02-input'), 'k7qf29xdm4pn8rwc');
    expect(screen.getByTestId('a02-input').props.value).toBe('K7QF-29XD-M4PN-8RWC');
    await fireEvent.press(screen.getByTestId('a02-submit'));
    await waitFor(() => expect(client.secondFactor).toHaveBeenCalledWith('sf', 'K7QF-29XD-M4PN-8RWC'));
    expect(await screen.findByTestId('a02-show')).toHaveTextContent(/Make a new recovery code/);
  });

  it('"I don\'t have my code" shows records hidden when the server says so', async () => {
    const { deps } = makeDeps({
      verify: vi.fn(async () => ({ status: 'SECOND_FACTOR_REQUIRED' as const, needsSecondFactor: true, secondFactorToken: 'sf', methods: ['RECOVERY_CODE'], expiresInSeconds: 600, withoutCode: 'RECORDS_HIDDEN' as const })) as never,
    });
    await toS02(deps);
    await fireEvent.press(screen.getByTestId('s02-paste'));
    await fireEvent.press(await screen.findByTestId('a03-recovery'));
    await fireEvent.press(screen.getByTestId('a02-no-code'));
    expect(await screen.findByTestId('a03-hidden')).toBeTruthy();
  });
});

describe('A01 app lock gate', () => {
  it('while locked, the app is hidden; a failed unlock says so; success shows the app', async () => {
    const results = [false, true];
    const unlock = vi.fn(async () => results.shift() ?? true);
    await render(
      <AppLockGate initiallyLocked unlock={unlock}>
        <Text testID="health-data">Testmed A 500 mg</Text>
      </AppLockGate>,
    );
    // Locked: the health data is hidden from view and from screen readers.
    expect(screen.queryByTestId('health-data')).toBeNull();
    expect(screen.getByTestId('app-lock-content', { includeHiddenElements: true }).props.accessibilityElementsHidden).toBe(true);
    expect(await screen.findByTestId('a01-failed')).toBeTruthy();
    expect(screen.queryByTestId('health-data')).toBeNull();
    await fireEvent.press(screen.getByTestId('a01-try-again'));
    await waitFor(() => expect(screen.queryByTestId('app-lock-screen')).toBeNull());
    expect(screen.getByTestId('health-data')).toHaveTextContent('Testmed A 500 mg');
  });
});
