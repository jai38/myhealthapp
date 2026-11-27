// Phase 5 sign-in flow, as a pure reducer (screens.md Flow 1 and Flow 3, api.md "Phone sign-in").
//   New user:            S01 → S02 → S03 → (under 18: A04, stop) → A01 offer → A02 show → done
//   Same phone, known:   S01 → S02 → done (or S03 if the profile isn't finished)
//   New phone:           S01 → S02 → A03 check → A02 enter → done (A02 show if the code was used up)
//                        S02 → A03 records hidden (no recovery code, unused 90+ days)
// No React, no network, no clock reads: the screens dispatch events with the API results.

export type SigninStep =
  | 'S01'
  | 'S02'
  | 'S03'
  | 'A04'
  | 'A01_OFFER'
  | 'A02_SHOW'
  | 'A03_CHECK'
  | 'A02_ENTER'
  | 'A03_HIDDEN'
  | 'DONE';

export type WithoutCode = 'RECORDS_HIDDEN' | 'CONTACT_SUPPORT';

export interface SigninState {
  step: SigninStep;
  /** 10-digit national number, once S01 has sent a code. */
  phone: string | null;
  requestId: string | null;
  /** Epoch ms the current code was sent, and the server's resend gap. */
  sentAtMs: number | null;
  resendAfterSeconds: number;
  /** A03 / A02 enter, on a new phone. */
  secondFactorToken: string | null;
  withoutCode: WithoutCode | null;
  /** A new account: after S03 the app lock offer and a recovery code follow. */
  isNewUser: boolean;
  /** The recovery code was used to sign in, so A02 shows a new one. */
  recoveryCodeUsed: boolean;
}

export const INITIAL_SIGNIN: SigninState = {
  step: 'S01',
  phone: null,
  requestId: null,
  sentAtMs: null,
  resendAfterSeconds: 30,
  secondFactorToken: null,
  withoutCode: null,
  isNewUser: false,
  recoveryCodeUsed: false,
};

export type SigninEvent =
  | { type: 'CODE_SENT'; phone: string; requestId: string; sentAtMs: number; resendAfterSeconds: number }
  | { type: 'CHANGE_NUMBER' }
  | { type: 'SIGNED_IN'; isNewUser: boolean; profileComplete: boolean; recoveryCodeUsed?: boolean }
  | { type: 'SECOND_FACTOR'; secondFactorToken: string; withoutCode: WithoutCode }
  | { type: 'SUPPORT_REQUIRED' }
  | { type: 'CHOOSE_RECOVERY_CODE' }
  | { type: 'NO_RECOVERY_CODE' }
  | { type: 'BACK' }
  | { type: 'UNDER_18' }
  | { type: 'CHECK_DOB' }
  | { type: 'ACCOUNT_SAVED' }
  | { type: 'APP_LOCK_DECIDED' }
  | { type: 'RECOVERY_CODE_SAVED' }
  | { type: 'RESTART' };

/** Where a signed-in user goes next. */
function afterSignIn(state: SigninState, e: Extract<SigninEvent, { type: 'SIGNED_IN' }>): SigninState {
  const base = { ...state, secondFactorToken: null, isNewUser: e.isNewUser, recoveryCodeUsed: Boolean(e.recoveryCodeUsed) };
  if (!e.profileComplete) return { ...base, step: 'S03' };
  // The recovery code was spent signing in: it no longer works, so make a new one now.
  if (e.recoveryCodeUsed) return { ...base, step: 'A02_SHOW' };
  return { ...base, step: 'DONE' };
}

export function signinReducer(state: SigninState, e: SigninEvent): SigninState {
  switch (e.type) {
    case 'CODE_SENT':
      return { ...state, step: 'S02', phone: e.phone, requestId: e.requestId, sentAtMs: e.sentAtMs, resendAfterSeconds: e.resendAfterSeconds };
    case 'CHANGE_NUMBER':
      return { ...INITIAL_SIGNIN, phone: state.phone };
    case 'SIGNED_IN':
      return state.step === 'S02' || state.step === 'A02_ENTER' ? afterSignIn(state, e) : state;
    case 'SECOND_FACTOR':
      return state.step === 'S02'
        ? { ...state, step: 'A03_CHECK', secondFactorToken: e.secondFactorToken, withoutCode: e.withoutCode }
        : state;
    case 'SUPPORT_REQUIRED':
      // No session: the records stay hidden until support confirms it's them (P2).
      return state.step === 'S02' ? { ...state, step: 'A03_HIDDEN' } : state;
    case 'CHOOSE_RECOVERY_CODE':
      return state.step === 'A03_CHECK' ? { ...state, step: 'A02_ENTER' } : state;
    case 'NO_RECOVERY_CODE':
      // "I don't have my code": where the server said it leads.
      if (state.step !== 'A02_ENTER' && state.step !== 'A03_CHECK') return state;
      return state.withoutCode === 'RECORDS_HIDDEN' ? { ...state, step: 'A03_HIDDEN' } : state;
    case 'BACK':
      if (state.step === 'S02') return { ...INITIAL_SIGNIN, phone: state.phone };
      if (state.step === 'A02_ENTER') return { ...state, step: 'A03_CHECK' };
      if (state.step === 'A03_CHECK' || state.step === 'A03_HIDDEN') return { ...INITIAL_SIGNIN, phone: state.phone };
      if (state.step === 'A04') return { ...state, step: 'S03' };
      return state;
    case 'UNDER_18':
      // A04: nothing entered on S03 is stored (screens.md; api.md 422 stores nothing).
      return state.step === 'S03' ? { ...state, step: 'A04' } : state;
    case 'CHECK_DOB':
      return state.step === 'A04' ? { ...state, step: 'S03' } : state;
    case 'ACCOUNT_SAVED':
      if (state.step !== 'S03') return state;
      if (state.isNewUser) return { ...state, step: 'A01_OFFER' };
      return state.recoveryCodeUsed ? { ...state, step: 'A02_SHOW' } : { ...state, step: 'DONE' };
    case 'APP_LOCK_DECIDED':
      return state.step === 'A01_OFFER' ? { ...state, step: 'A02_SHOW' } : state;
    case 'RECOVERY_CODE_SAVED':
      return state.step === 'A02_SHOW' ? { ...state, step: 'DONE' } : state;
    case 'RESTART':
      return INITIAL_SIGNIN;
  }
}
