// Phone sign-in API (Phase 5; ayoreni-docs docs/contracts/api.md "Phone sign-in", backend
// PR #12). Not live yet: the app reaches these only behind the dev switch in
// services/config/phoneSignIn.ts (working agreement rule 5).
//
// Nothing here logs: numbers, codes, names and recovery codes never reach a log (rule 8).
import { z } from 'zod';
import { resolveApiBaseUrl } from '../config/environment';

export type PhoneAuthErrorCode =
  | 'INVALID_PHONE'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'OTP_UNAVAILABLE'
  | 'WRONG_CODE'
  | 'CODE_EXPIRED'
  | 'LOCKED'
  | 'WRONG_RECOVERY_CODE'
  | 'CHALLENGE_EXPIRED'
  | 'UNDER_18'
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'SERVER';

export type RateLimitReason = 'RESEND_TOO_SOON' | 'TOO_MANY_CODES' | 'DAILY_LIMIT';

/** A failed call, with what the screens need to choose a state. */
export class PhoneAuthError extends Error {
  constructor(
    readonly code: PhoneAuthErrorCode,
    readonly status: number,
    readonly details: { attemptsLeft?: number; retryAfterSeconds?: number; reason?: RateLimitReason; field?: string } = {},
  ) {
    super(code);
    this.name = 'PhoneAuthError';
  }
}

const KNOWN: ReadonlySet<string> = new Set<PhoneAuthErrorCode>([
  'INVALID_PHONE',
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'OTP_UNAVAILABLE',
  'WRONG_CODE',
  'CODE_EXPIRED',
  'LOCKED',
  'WRONG_RECOVERY_CODE',
  'CHALLENGE_EXPIRED',
  'UNDER_18',
  'NOT_FOUND',
]);

const RequestCodeSchema = z.object({
  requestId: z.string(),
  codeLength: z.number(),
  expiresInSeconds: z.number(),
  resendAfterSeconds: z.number(),
  channel: z.string(),
});
export type RequestCodeResult = z.infer<typeof RequestCodeSchema>;

export type Delivery = 'PENDING' | 'SENT' | 'DELIVERED' | 'WHATSAPP_UNAVAILABLE' | 'FAILED';
const DeliverySchema = z.object({
  delivery: z.enum(['PENDING', 'SENT', 'DELIVERED', 'WHATSAPP_UNAVAILABLE', 'FAILED']),
});

const SignedInSchema = z.object({
  status: z.literal('SIGNED_IN'),
  isNewUser: z.boolean(),
  profileComplete: z.boolean(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
  deviceId: z.string(),
  recoveryCodeUsed: z.boolean().optional(),
});
const SecondFactorSchema = z.object({
  status: z.literal('SECOND_FACTOR_REQUIRED'),
  secondFactorToken: z.string(),
  methods: z.array(z.string()),
  expiresInSeconds: z.number(),
  withoutCode: z.enum(['RECORDS_HIDDEN', 'CONTACT_SUPPORT']),
});
const SupportSchema = z.object({ status: z.literal('SUPPORT_REQUIRED') });
const VerifySchema = z.discriminatedUnion('status', [SignedInSchema, SecondFactorSchema, SupportSchema]);

export type SignedIn = z.infer<typeof SignedInSchema>;
export type VerifyResult = z.infer<typeof VerifySchema>;

const AccountSchema = z.object({
  phone: z.string(),
  profileComplete: z.boolean(),
  hasRecoveryCode: z.boolean(),
  fullName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  genderSelfDescription: z.string().optional(),
  email: z.string().optional(),
});
export type Account = z.infer<typeof AccountSchema>;

export interface DeviceInfo {
  installId: string;
  name: string;
  platform: 'ios' | 'android' | 'web' | 'other';
}

type Fetch = typeof fetch;

async function call<T>(
  path: string,
  init: { method: string; body?: unknown; token?: string },
  schema: z.ZodType<T>,
  doFetch: Fetch = fetch,
): Promise<T> {
  let res: Response;
  try {
    res = await doFetch(`${resolveApiBaseUrl()}${path}`, {
      method: init.method,
      headers: {
        Accept: 'application/json',
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new PhoneAuthError('NETWORK', 0);
  }
  const json = (await res.json().catch(() => null)) as
    | { data?: unknown; error?: { code?: string; details?: Record<string, unknown>; fields?: { path?: string }[] } }
    | null;
  if (!res.ok) {
    const code = json?.error?.code;
    const d = json?.error?.details ?? {};
    throw new PhoneAuthError(code && KNOWN.has(code) ? (code as PhoneAuthErrorCode) : 'SERVER', res.status, {
      attemptsLeft: typeof d.attemptsLeft === 'number' ? d.attemptsLeft : undefined,
      retryAfterSeconds: typeof d.retryAfterSeconds === 'number' ? d.retryAfterSeconds : undefined,
      reason: typeof d.reason === 'string' ? (d.reason as RateLimitReason) : undefined,
      field: json?.error?.fields?.[0]?.path,
    });
  }
  const parsed = schema.safeParse(json?.data);
  if (!parsed.success) throw new PhoneAuthError('SERVER', res.status);
  return parsed.data;
}

export const phoneAuthClient = {
  /** S01 Continue, and S02 Resend. The reply is the same for known and unknown numbers. */
  requestCode(phone: string, installId: string, termsVersion: string, doFetch?: Fetch) {
    return call('/auth/otp/request', { method: 'POST', body: { phone, installId, termsVersion } }, RequestCodeSchema, doFetch);
  },
  /** S02 polls this: "no WhatsApp on this number" arrives late. */
  async delivery(requestId: string, doFetch?: Fetch): Promise<Delivery> {
    const r = await call(`/auth/otp/request/${encodeURIComponent(requestId)}`, { method: 'GET' }, DeliverySchema, doFetch);
    return r.delivery;
  },
  verify(requestId: string, code: string, device: DeviceInfo, doFetch?: Fetch): Promise<VerifyResult> {
    return call('/auth/otp/verify', { method: 'POST', body: { requestId, code, device } }, VerifySchema, doFetch);
  },
  /** A02 "enter", on a new phone. */
  secondFactor(secondFactorToken: string, recoveryCode: string, doFetch?: Fetch): Promise<SignedIn> {
    return call('/auth/second-factor', { method: 'POST', body: { secondFactorToken, recoveryCode } }, SignedInSchema, doFetch);
  },
  account(token: string, doFetch?: Fetch): Promise<Account> {
    return call('/auth/account', { method: 'GET', token }, AccountSchema, doFetch);
  },
  /** S03 Continue. 422 UNDER_18 stores nothing. */
  saveAccount(token: string, body: unknown, doFetch?: Fetch) {
    return call('/auth/account', { method: 'PUT', body, token }, z.object({ profileComplete: z.boolean() }), doFetch);
  },
  /** A02 "show": the code is shown once. */
  async createRecoveryCode(token: string, doFetch?: Fetch): Promise<string> {
    const r = await call('/auth/recovery-code', { method: 'POST', token }, z.object({ recoveryCode: z.string() }), doFetch);
    return r.recoveryCode;
  },
};
