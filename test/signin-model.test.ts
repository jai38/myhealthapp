// Phase 5 sign-in rules (S01, S02, S03, A02, A04).
import { describe, it, expect } from 'vitest';
import {
  EMPTY_S03,
  accountBody,
  ageOn,
  canContinueS01,
  canContinueS03,
  codeFromPaste,
  formatCountdown,
  formatIndianMobile,
  formatRecoveryCode,
  isCompleteRecoveryCode,
  isUnder18,
  maskIndianMobile,
  mobileFieldDigits,
  normalizeIndianMobile,
  resendSecondsLeft,
  validateS03,
} from '../features/signin/signinModel';

const TODAY = { year: 2026, month: 11, day: 24 };

describe('S01 mobile number', () => {
  it('accepts 10 digits starting 6–9 and strips +91, 91, a leading 0, spaces and dashes', () => {
    for (const input of ['9876543210', '+91 98765 43210', '+91-98765-43210', '919876543210', '09876543210', '98765 43210']) {
      expect(normalizeIndianMobile(input)).toBe('9876543210');
    }
  });

  it('refuses other numbers', () => {
    for (const input of ['5876543210', '987654321', '98765432101', '', 'abc', '+1 9876543210']) {
      expect(normalizeIndianMobile(input)).toBeNull();
    }
  });

  it('formats and masks', () => {
    expect(formatIndianMobile('9876543210')).toBe('98765 43210');
    expect(formatIndianMobile('98765')).toBe('98765');
    expect(maskIndianMobile('9876543210')).toBe('+91 ••••• •3210');
    expect(mobileFieldDigits('+91 98765 43210')).toBe('9876543210');
    expect(mobileFieldDigits('98765432109999')).toBe('9876543210');
  });

  it('Continue needs a valid number and the Terms box', () => {
    expect(canContinueS01('9876543210', true)).toBe(true);
    expect(canContinueS01('9876543210', false)).toBe(false);
    expect(canContinueS01('12345', true)).toBe(false);
  });
});

describe('S02 code', () => {
  it('paste finds the six digits in a WhatsApp message', () => {
    expect(codeFromPaste('123456')).toBe('123456');
    expect(codeFromPaste('Your Ayoreni code is 123 456. It expires in 10 minutes.')).toBe('123456');
    expect(codeFromPaste('Code: 123-456')).toBe('123456');
    expect(codeFromPaste('12345')).toBeNull();
    expect(codeFromPaste('nothing here')).toBeNull();
  });

  it('counts down the resend gap', () => {
    expect(resendSecondsLeft(0, 30, 0)).toBe(30);
    expect(resendSecondsLeft(0, 30, 29_500)).toBe(1);
    expect(resendSecondsLeft(0, 30, 31_000)).toBe(0);
    expect(formatCountdown(27)).toBe('0:27');
    expect(formatCountdown(600)).toBe('10:00');
  });
});

describe('S03 and A04', () => {
  const valid = {
    ...EMPTY_S03,
    fullName: 'Asha Test',
    dateOfBirth: { year: 1990, month: 5, day: 4 },
    gender: 'FEMALE' as const,
    healthDataConsent: true,
  };

  it('Continue needs name, date of birth, gender and consent; email is optional', () => {
    expect(canContinueS03(valid, TODAY)).toBe(true);
    expect(validateS03(EMPTY_S03, TODAY)).toEqual({
      fullName: 's03.errorName',
      dateOfBirth: 's03.errorDob',
      gender: 's03.errorGender',
      healthDataConsent: 's03.errorConsent',
    });
    expect(validateS03({ ...valid, email: 'not an email' }, TODAY)).toEqual({ email: 's03.errorEmail' });
  });

  it('refuses a future or impossible date of birth', () => {
    expect(validateS03({ ...valid, dateOfBirth: { year: 2027, month: 1, day: 1 } }, TODAY).dateOfBirth).toBe('s03.errorDob');
    expect(validateS03({ ...valid, dateOfBirth: { year: 1990, month: 2, day: 30 } }, TODAY).dateOfBirth).toBe('s03.errorDob');
  });

  it('under 18 is blocked (A04), counting the birthday exactly', () => {
    expect(ageOn({ year: 2008, month: 11, day: 24 }, TODAY)).toBe(18);
    expect(isUnder18({ year: 2008, month: 11, day: 24 }, TODAY)).toBe(false);
    expect(isUnder18({ year: 2008, month: 11, day: 25 }, TODAY)).toBe(true);
    expect(isUnder18({ year: 2015, month: 1, day: 1 }, TODAY)).toBe(true);
  });

  it('builds the PUT /auth/account body: self-description only with SELF_DESCRIBE, email only if given', () => {
    expect(accountBody({ ...valid, genderSelfDescription: 'ignored' })).toEqual({
      fullName: 'Asha Test',
      dateOfBirth: '1990-05-04',
      gender: 'FEMALE',
      healthDataConsentVersion: expect.any(String),
    });
    expect(accountBody({ ...valid, gender: 'SELF_DESCRIBE', genderSelfDescription: ' Non-binary ', email: ' asha@seed.ayoreni.test ' })).toMatchObject({
      gender: 'SELF_DESCRIBE',
      genderSelfDescription: 'Non-binary',
      email: 'asha@seed.ayoreni.test',
    });
  });
});

describe('A02 recovery code', () => {
  it('upper-cases, drops look-alike characters and adds dashes every 4', () => {
    // The design's sample (K7QF-29XD-M4PL-8RWC) has an L, which real codes never contain.
    expect(formatRecoveryCode('k7qf29xdm4pn8rwc')).toBe('K7QF-29XD-M4PN-8RWC');
    expect(formatRecoveryCode('K7QF 29XD')).toBe('K7QF-29XD');
    // 0, O, 1, I and L aren't in the alphabet.
    expect(formatRecoveryCode('O0I1L')).toBe('');
    expect(formatRecoveryCode('K7QF-29XD-M4PN-8RWC-EXTRA')).toBe('K7QF-29XD-M4PN-8RWC');
    expect(isCompleteRecoveryCode('K7QF-29XD-M4PN-8RWC')).toBe(true);
    expect(isCompleteRecoveryCode('K7QF-29XD')).toBe(false);
  });
});
