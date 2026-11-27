// The Phase 5 sign-in flow container: S01 → S02 → S03 → A01 → A02, and the new-phone path
// A03 → A02 enter. It drives signinReducer with the API results and keeps the views stateless.
// Reached only behind the dev switch (services/config/phoneSignIn.ts) until backend PR #12 is
// live. Nothing here logs: numbers, codes, names and recovery codes never reach a log (rule 8).
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { t } from '../../design/strings';
import { authService } from '../../services/auth/auth-service';
import { getInstallId } from '../../services/auth/install-id';
import { PhoneAuthError, phoneAuthClient } from '../../services/auth/phone-auth-client';
import type { DeviceInfo, SignedIn } from '../../services/auth/phone-auth-client';
import { SUPPORT_EMAIL } from '../../services/config/support';
import { setAppLock } from '../../services/security/app-lock';
import { INITIAL_SIGNIN, signinReducer } from './signinFlow';
import type { SigninState } from './signinFlow';
import {
  CODE_LENGTH,
  EMPTY_S03,
  TERMS_VERSION,
  accountBody,
  canContinueS01,
  codeFromPaste,
  formatRecoveryCode,
  isUnder18,
  mobileFieldDigits,
  normalizeIndianMobile,
  resendSecondsLeft,
  validateS03,
} from './signinModel';
import type { S03Form } from './signinModel';
import { S01MobileNumber } from './S01MobileNumber';
import type { S01Status } from './S01MobileNumber';
import { S02Code } from './S02Code';
import type { S02Status } from './S02Code';
import { S03CreateAccount } from './S03CreateAccount';
import type { S03Status } from './S03CreateAccount';
import { A01Offer, A02Enter, A02Show, A03Check, A03Hidden, A04Under18 } from './SecurityScreens';

export interface SigninDeps {
  client: typeof phoneAuthClient;
  auth: Pick<typeof authService, 'signInWithPhone' | 'markProfileComplete' | 'finishOnboarding' | 'getSession' | 'logout'>;
  installId: () => Promise<string>;
  readClipboard: () => Promise<string>;
  writeClipboard: (text: string) => Promise<unknown>;
  openSupport: () => void;
  setAppLock: (on: boolean) => Promise<void>;
  now: () => number;
  /** How often S02 asks whether the code was delivered (the late "no WhatsApp"). */
  pollMs: number;
}

const defaultDeps: SigninDeps = {
  client: phoneAuthClient,
  auth: authService,
  installId: getInstallId,
  readClipboard: () => Clipboard.getStringAsync(),
  writeClipboard: (text) => Clipboard.setStringAsync(text),
  openSupport: () => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {}),
  setAppLock,
  now: () => Date.now(),
  pollMs: 5000,
};

function deviceInfo(installId: string): DeviceInfo {
  const platform = Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web' ? Platform.OS : 'other';
  const name = platform === 'ios' ? 'iPhone' : platform === 'android' ? 'Android phone' : platform === 'web' ? 'Web browser' : 'Device';
  return { installId, name, platform };
}

function todayParts(ms: number) {
  const d = new Date(ms);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export interface SigninFlowProps {
  deps?: Partial<SigninDeps>;
  /** Resume a phone session whose onboarding isn't finished (the app was closed part-way). */
  resume?: boolean;
  /** Close (A04 Close): leave the flow without an account. */
  onExit?: () => void;
}

export function SigninFlow({ deps: overrides, resume = false, onExit }: SigninFlowProps) {
  const deps: SigninDeps = { ...defaultDeps, ...overrides };
  const depsRef = useRef(deps);
  depsRef.current = deps;

  const [state, dispatch] = useReducer(signinReducer, undefined, (): SigninState => {
    if (!resume) return INITIAL_SIGNIN;
    const s = deps.auth.getSession();
    const phone = s?.phone?.replace(/^\+91/, '') ?? null;
    // Profile not finished: back to S03, then A01 and A02 as for a new account.
    if (s && s.profileComplete === false) return { ...INITIAL_SIGNIN, step: 'S03', phone, isNewUser: true };
    return { ...INITIAL_SIGNIN, step: 'DONE', phone };
  });

  // S01
  const [phoneField, setPhoneField] = useState(state.phone ?? '');
  const [terms, setTerms] = useState(false);
  const [s01, setS01] = useState<S01Status>('idle');
  const [noWhatsappFor, setNoWhatsappFor] = useState<string | null>(null);
  // S02
  const [code, setCode] = useState('');
  const [s02, setS02] = useState<S02Status>({ kind: 'idle' });
  const [nowMs, setNowMs] = useState(deps.now());
  // S03
  const [form, setForm] = useState<S03Form>(EMPTY_S03);
  const [showErrors, setShowErrors] = useState(false);
  const [s03, setS03] = useState<S03Status>('idle');
  const [dobOpen, setDobOpen] = useState(false);
  // A01, A02
  const [lockOn, setLockOn] = useState(true);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [codeSaved, setCodeSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enterValue, setEnterValue] = useState('');
  const [enterError, setEnterError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The S02 timer.
  useEffect(() => {
    if (state.step !== 'S02') return undefined;
    const id = setInterval(() => setNowMs(depsRef.current.now()), 1000);
    return () => clearInterval(id);
  }, [state.step]);

  // S02: "no WhatsApp on this number" arrives late (api.md). Poll while the code is pending.
  useEffect(() => {
    if (state.step !== 'S02' || !state.requestId) return undefined;
    const requestId = state.requestId;
    let stopped = false;
    const id = setInterval(async () => {
      try {
        const delivery = await depsRef.current.client.delivery(requestId);
        if (stopped) return;
        if (delivery === 'WHATSAPP_UNAVAILABLE') {
          setS02({ kind: 'noWhatsapp' });
          setNoWhatsappFor(state.phone);
        } else if (delivery === 'FAILED') {
          setS02((cur) => (cur.kind === 'idle' ? { kind: 'sendFailed' } : cur));
        }
        if (delivery !== 'PENDING' && delivery !== 'SENT') clearInterval(id);
      } catch {
        // A failed poll changes nothing; the next one tries again.
      }
    }, depsRef.current.pollMs);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [state.step, state.requestId, state.phone]);

  // When the flow ends, the app opens (the gate shows the tabs).
  useEffect(() => {
    if (state.step === 'DONE' && depsRef.current.auth.getSession()) void depsRef.current.auth.finishOnboarding();
  }, [state.step]);

  // A02 show: make the code once, when the screen opens.
  useEffect(() => {
    if (state.step !== 'A02_SHOW' || recoveryCode) return;
    const token = depsRef.current.auth.getSession()?.accessToken;
    if (!token) return;
    void depsRef.current.client
      .createRecoveryCode(token)
      .then(setRecoveryCode)
      .catch(() => setRecoveryCode(null));
  }, [state.step, recoveryCode]);

  // ---- S01 ----------------------------------------------------------------------------------

  const sendCode = useCallback(async (digits: string, isResend: boolean) => {
    const d = depsRef.current;
    if (!isResend) setS01('sending');
    try {
      const r = await d.client.requestCode(digits, await d.installId(), TERMS_VERSION);
      setCode('');
      setS02({ kind: 'idle' });
      setNowMs(d.now());
      dispatch({ type: 'CODE_SENT', phone: digits, requestId: r.requestId, sentAtMs: d.now(), resendAfterSeconds: r.resendAfterSeconds });
      setS01('idle');
    } catch (e) {
      const code = e instanceof PhoneAuthError ? e.code : 'SERVER';
      const status: S01Status =
        code === 'INVALID_PHONE' || code === 'VALIDATION_ERROR'
          ? 'invalid'
          : code === 'RATE_LIMITED'
            ? 'rateLimited'
            : code === 'OTP_UNAVAILABLE'
              ? 'unavailable'
              : code === 'NETWORK'
                ? 'noInternet'
                : 'failed';
      if (isResend) setS02(status === 'noInternet' ? { kind: 'noInternet' } : status === 'rateLimited' ? { kind: 'locked' } : { kind: 'sendFailed' });
      else setS01(status);
    }
  }, []);

  const onS01Continue = () => {
    const digits = normalizeIndianMobile(phoneField);
    if (!digits) {
      setS01('invalid');
      return;
    }
    if (!canContinueS01(digits, terms)) return;
    void sendCode(digits, false);
  };

  // ---- S02 ----------------------------------------------------------------------------------

  const finishSignIn = useCallback(async (r: SignedIn) => {
    const d = depsRef.current;
    const me = await d.client.me(r.accessToken);
    const pending = r.isNewUser || !r.profileComplete || Boolean(r.recoveryCodeUsed);
    await d.auth.signInWithPhone({
      accessToken: r.accessToken,
      refreshToken: r.refreshToken,
      expiresAt: r.expiresAt,
      userId: me.userId,
      patientProfileId: me.patientProfileId,
      phone: me.phone,
      fullName: me.fullName,
      profileComplete: r.profileComplete,
      onboarding: pending ? 'pending' : 'done',
    });
    dispatch({ type: 'SIGNED_IN', isNewUser: r.isNewUser, profileComplete: r.profileComplete, recoveryCodeUsed: r.recoveryCodeUsed });
  }, []);

  const verify = useCallback(
    async (value: string) => {
      const d = depsRef.current;
      if (value.length !== CODE_LENGTH || !state.requestId) return;
      setS02({ kind: 'verifying' });
      try {
        const r = await d.client.verify(state.requestId, value, deviceInfo(await d.installId()));
        if (r.status === 'SIGNED_IN') {
          setS02({ kind: 'verified' });
          // "Mobile number verified" for about 0.6 s, then on.
          await new Promise((res) => setTimeout(res, 600));
          await finishSignIn(r);
        } else if (r.status === 'SECOND_FACTOR_REQUIRED') {
          dispatch({ type: 'SECOND_FACTOR', secondFactorToken: r.secondFactorToken, withoutCode: r.withoutCode });
        } else {
          dispatch({ type: 'SUPPORT_REQUIRED' });
        }
      } catch (e) {
        const err = e instanceof PhoneAuthError ? e : null;
        setCode('');
        if (err?.code === 'WRONG_CODE') setS02({ kind: 'wrong', attemptsLeft: err.details.attemptsLeft ?? 0 });
        else if (err?.code === 'CODE_EXPIRED') setS02({ kind: 'expired' });
        else if (err?.code === 'LOCKED') setS02({ kind: 'locked' });
        else if (err?.code === 'NETWORK') setS02({ kind: 'noInternet' });
        else setS02({ kind: 'sendFailed' });
      }
    },
    [state.requestId, finishSignIn],
  );

  const onPaste = async () => {
    const found = codeFromPaste(await depsRef.current.readClipboard());
    if (!found) return;
    setCode(found);
    // Paste fills all six boxes and verifies at once (S02).
    void verify(found);
  };

  // ---- S03 ----------------------------------------------------------------------------------

  const onS03Continue = async () => {
    const d = depsRef.current;
    const today = todayParts(d.now());
    setShowErrors(true);
    if (Object.keys(validateS03(form, today)).length > 0) return;
    // Under 18: A04, and nothing entered is sent or stored.
    if (form.dateOfBirth && isUnder18(form.dateOfBirth, today)) {
      setForm(EMPTY_S03);
      setShowErrors(false);
      dispatch({ type: 'UNDER_18' });
      return;
    }
    const token = d.auth.getSession()?.accessToken;
    if (!token) return;
    setS03('saving');
    try {
      await d.client.saveAccount(token, accountBody(form));
      await d.auth.markProfileComplete(form.fullName.trim());
      setS03('idle');
      dispatch({ type: 'ACCOUNT_SAVED' });
    } catch (e) {
      if (e instanceof PhoneAuthError && e.code === 'UNDER_18') {
        setForm(EMPTY_S03);
        setShowErrors(false);
        setS03('idle');
        dispatch({ type: 'UNDER_18' });
      } else {
        setS03('saveFailed');
      }
    }
  };

  // ---- A01, A02, A03 -------------------------------------------------------------------------

  const onA01 = async (on: boolean) => {
    await depsRef.current.setAppLock(on);
    dispatch({ type: 'APP_LOCK_DECIDED' });
  };

  const onCopy = async () => {
    if (!recoveryCode) return;
    await depsRef.current.writeClipboard(recoveryCode);
    setCopied(true);
    setCodeSaved(true);
  };

  const onEnterSubmit = async () => {
    const d = depsRef.current;
    if (!state.secondFactorToken) return;
    setSubmitting(true);
    setEnterError(null);
    try {
      const r = await d.client.secondFactor(state.secondFactorToken, enterValue);
      await finishSignIn(r);
    } catch (e) {
      const err = e instanceof PhoneAuthError ? e : null;
      if (err?.code === 'WRONG_RECOVERY_CODE') {
        const left = err.details.attemptsLeft;
        setEnterError(typeof left === 'number' && left > 0 ? t('a02.wrongLeft', { count: String(left) }) : t('a02.wrong'));
      } else if (err?.code === 'CHALLENGE_EXPIRED' || err?.code === 'LOCKED') {
        setEnterError(t('a02.expired'));
      } else {
        setEnterError(t('s02.noInternet'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onNoCode = () => {
    if (state.withoutCode === 'CONTACT_SUPPORT') depsRef.current.openSupport();
    else dispatch({ type: 'NO_RECOVERY_CODE' });
  };

  // ---- render --------------------------------------------------------------------------------

  switch (state.step) {
    case 'S01':
      return (
        <S01MobileNumber
          phone={phoneField}
          onPhoneChange={(text) => {
            const digits = mobileFieldDigits(text);
            setPhoneField(digits);
            if (s01 !== 'sending') setS01(digits === noWhatsappFor ? 'noWhatsapp' : 'idle');
          }}
          termsAccepted={terms}
          onToggleTerms={() => setTerms((v) => !v)}
          status={phoneField === noWhatsappFor && s01 === 'idle' ? 'noWhatsapp' : s01}
          onContinue={onS01Continue}
        />
      );
    case 'S02':
      return (
        <S02Code
          phone={state.phone ?? ''}
          code={code}
          onCodeChange={(digits) => {
            setCode(digits);
            if (s02.kind === 'wrong' || s02.kind === 'sendFailed' || s02.kind === 'noInternet') setS02({ kind: 'idle' });
          }}
          onPaste={() => void onPaste()}
          status={s02}
          resendSecondsLeft={state.sentAtMs === null ? 0 : resendSecondsLeft(state.sentAtMs, state.resendAfterSeconds, nowMs)}
          onResend={() => state.phone && void sendCode(state.phone, true)}
          onVerify={() => void verify(code)}
          onBack={() => dispatch({ type: 'BACK' })}
          onChangeNumber={() => {
            setPhoneField(state.phone ?? '');
            dispatch({ type: 'CHANGE_NUMBER' });
          }}
        />
      );
    case 'S03':
      return (
        <S03CreateAccount
          phone={state.phone ?? depsRef.current.auth.getSession()?.phone?.replace(/^\+91/, '') ?? ''}
          form={form}
          onChange={setForm}
          showErrors={showErrors}
          status={s03}
          onContinue={() => void onS03Continue()}
          today={todayParts(deps.now())}
          dobOpen={dobOpen}
          onDobOpenChange={setDobOpen}
        />
      );
    case 'A04':
      return (
        <A04Under18
          onBack={() => dispatch({ type: 'BACK' })}
          onCheckDob={() => {
            dispatch({ type: 'CHECK_DOB' });
            setDobOpen(true);
          }}
          onClose={() => {
            void depsRef.current.auth.logout();
            dispatch({ type: 'RESTART' });
            onExit?.();
          }}
        />
      );
    case 'A01_OFFER':
      return (
        <A01Offer
          enabled={lockOn}
          onToggle={setLockOn}
          onTurnOn={() => void onA01(true)}
          onNotNow={() => void onA01(false)}
        />
      );
    case 'A02_SHOW':
      return (
        <A02Show
          code={recoveryCode}
          saved={codeSaved}
          copied={copied}
          usedUp={state.recoveryCodeUsed}
          onCopy={() => void onCopy()}
          onToggleSaved={() => setCodeSaved((v) => !v)}
          onContinue={() => {
            setRecoveryCode(null);
            dispatch({ type: 'RECOVERY_CODE_SAVED' });
          }}
        />
      );
    case 'A03_CHECK':
      return (
        <A03Check
          phone={state.phone ?? ''}
          hasPasskey={false}
          hasRecoveryCode
          onPasskey={() => {}}
          onRecoveryCode={() => dispatch({ type: 'CHOOSE_RECOVERY_CODE' })}
          onContactSupport={() => depsRef.current.openSupport()}
          onBack={() => dispatch({ type: 'BACK' })}
        />
      );
    case 'A02_ENTER':
      return (
        <A02Enter
          value={enterValue}
          onChange={(text) => {
            setEnterValue(formatRecoveryCode(text));
            setEnterError(null);
          }}
          error={enterError}
          submitting={submitting}
          onSubmit={() => void onEnterSubmit()}
          onBack={() => dispatch({ type: 'BACK' })}
          onNoCode={onNoCode}
        />
      );
    case 'A03_HIDDEN':
      return (
        <A03Hidden
          onContactSupport={() => depsRef.current.openSupport()}
          onSignOut={() => {
            void depsRef.current.auth.logout();
            dispatch({ type: 'RESTART' });
          }}
        />
      );
    case 'DONE':
      return null;
  }
}
