// Pure rules for Phase 5 sign-in (S01, S02, S03, A02, A04; designes/design/screens.md and
// ayoreni-docs docs/contracts/api.md "Phone sign-in"). No React, no clock reads: dates and
// times are parameters.
import type { StringKey } from '../../design/strings';

/** Versions of the texts the user agrees to; sent to the server and recorded with a time. */
export const TERMS_VERSION = '2026-11-terms-privacy-v1';
export const HEALTH_DATA_CONSENT_VERSION = '2026-11-health-data-v1';

export const CODE_LENGTH = 6;
export const MIN_AGE_YEARS = 18;

// ---- S01: mobile number ---------------------------------------------------------------------

/**
 * The 10-digit national number from what the user typed or pasted, or null. Removes spaces,
 * dashes and brackets, a leading +91 or 91 (when 12 digits), and a leading 0 (when 11).
 */
export function normalizeIndianMobile(input: string): string | null {
  let digits = (input ?? '').replace(/[^\d+]/g, '');
  if (digits.startsWith('+91')) digits = digits.slice(3);
  digits = digits.replace(/\+/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** Digits only, at most 10, for the field as the user types (a pasted +91 or 0 removed). */
export function mobileFieldDigits(input: string): string {
  const normalized = normalizeIndianMobile(input);
  if (normalized) return normalized;
  let d = (input ?? '').replace(/\D/g, '');
  if (d.length > 10 && d.startsWith('91')) d = d.slice(2);
  if (d.length > 10 && d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10);
}

/** "98765 43210" (5 + 5), as S01 and S02 show it. */
export function formatIndianMobile(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 10);
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}

/** "+91 ••••• •3210": the masked number on S03 and A03. */
export function maskIndianMobile(digits: string): string {
  const d = digits.replace(/\D/g, '');
  return `+91 ••••• •${d.slice(-4)}`;
}

/** S01's Continue: a valid number and the Terms box ticked. */
export function canContinueS01(input: string, termsAccepted: boolean): boolean {
  return termsAccepted && normalizeIndianMobile(input) !== null;
}

// ---- S02: the code --------------------------------------------------------------------------

/**
 * Six digits from pasted text ("Your Ayoreni code is 123 456"), or null. Paste fills all six
 * boxes and verifies at once (S02).
 */
export function codeFromPaste(text: string): string | null {
  const runs = (text ?? '').match(/\d[\d\s-]*\d|\d/g) ?? [];
  for (const run of runs) {
    const digits = run.replace(/\D/g, '');
    if (digits.length === CODE_LENGTH) return digits;
  }
  const all = (text ?? '').replace(/\D/g, '');
  return all.length === CODE_LENGTH ? all : null;
}

/** Seconds left before Resend, never below 0. */
export function resendSecondsLeft(sentAtMs: number, resendAfterSeconds: number, nowMs: number): number {
  return Math.max(0, Math.ceil((sentAtMs + resendAfterSeconds * 1000 - nowMs) / 1000));
}

/** "0:27": the S02 timer. */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ---- S03: create your account ---------------------------------------------------------------

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'SELF_DESCRIBE' | 'PREFER_NOT_TO_SAY';

export interface S03Form {
  fullName: string;
  /** Local calendar date of birth, or null until chosen on the wheel. */
  dateOfBirth: { year: number; month: number; day: number } | null;
  gender: Gender | null;
  genderSelfDescription: string;
  email: string;
  healthDataConsent: boolean;
}

export const EMPTY_S03: S03Form = {
  fullName: '',
  dateOfBirth: null,
  gender: null,
  genderSelfDescription: '',
  email: '',
  healthDataConsent: false,
};

export type S03Field = 'fullName' | 'dateOfBirth' | 'gender' | 'email' | 'healthDataConsent';

/** Full years on `today` for someone born on `dob` (calendar arithmetic, no time zones). */
export function ageOn(dob: { year: number; month: number; day: number }, today: { year: number; month: number; day: number }): number {
  let age = today.year - dob.year;
  if (today.month < dob.month || (today.month === dob.month && today.day < dob.day)) age -= 1;
  return age;
}

export function isRealPastDate(d: { year: number; month: number; day: number }, today: { year: number; month: number; day: number }): boolean {
  const probe = new Date(Date.UTC(d.year, d.month - 1, d.day));
  const real = probe.getUTCFullYear() === d.year && probe.getUTCMonth() === d.month - 1 && probe.getUTCDate() === d.day;
  const todayMs = Date.UTC(today.year, today.month - 1, today.day);
  return real && probe.getTime() <= todayMs && d.year >= 1900;
}

/** The under-18 block (A04, Phase 5 P4). Nothing is stored when it applies. */
export function isUnder18(dob: { year: number; month: number; day: number }, today: { year: number; month: number; day: number }): boolean {
  return ageOn(dob, today) < MIN_AGE_YEARS;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Field errors for S03's Continue (screens.md copy), empty when it may be sent. */
export function validateS03(form: S03Form, today: { year: number; month: number; day: number }): Partial<Record<S03Field, StringKey>> {
  const errors: Partial<Record<S03Field, StringKey>> = {};
  if (form.fullName.trim().length === 0) errors.fullName = 's03.errorName';
  if (!form.dateOfBirth || !isRealPastDate(form.dateOfBirth, today)) errors.dateOfBirth = 's03.errorDob';
  if (form.gender === null) errors.gender = 's03.errorGender';
  if (form.email.trim() !== '' && !EMAIL.test(form.email.trim())) errors.email = 's03.errorEmail';
  if (!form.healthDataConsent) errors.healthDataConsent = 's03.errorConsent';
  return errors;
}

/** S03's Continue is enabled when name, date of birth, gender and consent are valid. */
export function canContinueS03(form: S03Form, today: { year: number; month: number; day: number }): boolean {
  return Object.keys(validateS03(form, today)).length === 0;
}

/** The body of `PUT /auth/account`. Self-description only with SELF_DESCRIBE; email only if given. */
export function accountBody(form: S03Form): {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  genderSelfDescription?: string;
  email?: string;
  healthDataConsentVersion: string;
} {
  const d = form.dateOfBirth!;
  const body: ReturnType<typeof accountBody> = {
    fullName: form.fullName.trim(),
    dateOfBirth: `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`,
    gender: form.gender!,
    healthDataConsentVersion: HEALTH_DATA_CONSENT_VERSION,
  };
  const self = form.genderSelfDescription.trim();
  if (form.gender === 'SELF_DESCRIBE' && self) body.genderSelfDescription = self.slice(0, 60);
  if (form.email.trim()) body.email = form.email.trim();
  return body;
}

// ---- A02: recovery code ---------------------------------------------------------------------

const RECOVERY_ALPHABET = /[23456789ABCDEFGHJKMNPQRSTUVWXYZ]/;

/** Upper case, unknown characters dropped, dashes every 4, at most 16 characters (A02 "enter"). */
export function formatRecoveryCode(input: string): string {
  const chars = (input ?? '')
    .toUpperCase()
    .split('')
    .filter((c) => RECOVERY_ALPHABET.test(c))
    .slice(0, 16)
    .join('');
  return chars.replace(/(.{4})(?=.)/g, '$1-');
}

export function isCompleteRecoveryCode(formatted: string): boolean {
  return formatted.replace(/-/g, '').length === 16;
}
