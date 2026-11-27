// DEV ONLY. Every Phase 5 sign-in and account-security state (S01–S03, A01–A04), drawn from the
// views with fixed synthetic props: no backend, no session. /dev/preview/signin?state=…&theme=dark
import React from 'react';
import { ThemeProvider } from '../../design/theme';
import type { ThemeName } from '../../design/tokens';
import { S01MobileNumber } from '../signin/S01MobileNumber';
import type { S01Status } from '../signin/S01MobileNumber';
import { S02Code } from '../signin/S02Code';
import type { S02Status } from '../signin/S02Code';
import { S03CreateAccount } from '../signin/S03CreateAccount';
import { A01Locked, A01Offer, A02Enter, A02Show, A03Check, A03Hidden, A04Under18 } from '../signin/SecurityScreens';
import { EMPTY_S03 } from '../signin/signinModel';
import type { S03Form } from '../signin/signinModel';
import { t } from '../../design/strings';

const PHONE = '9876543210';
const TODAY = { year: 2026, month: 11, day: 27 };
const FILLED: S03Form = {
  fullName: 'Asha Test',
  dateOfBirth: { year: 1990, month: 5, day: 4 },
  gender: 'FEMALE',
  genderSelfDescription: '',
  email: 'asha.test@seed.ayoreni.test',
  healthDataConsent: true,
};
const noop = () => {};

function s01(status: S01Status, phone = PHONE, terms = true) {
  return <S01MobileNumber phone={phone} onPhoneChange={noop} termsAccepted={terms} onToggleTerms={noop} status={status} onContinue={noop} />;
}
function s02(status: S02Status, code = '', seconds = 27) {
  return (
    <S02Code phone={PHONE} code={code} onCodeChange={noop} onPaste={noop} status={status} resendSecondsLeft={seconds} onResend={noop} onVerify={noop} onBack={noop} onChangeNumber={noop} />
  );
}
function s03(form: S03Form, extra: { showErrors?: boolean; status?: 'idle' | 'saving' | 'saveFailed'; dobOpen?: boolean } = {}) {
  return (
    <S03CreateAccount phone={PHONE} form={form} onChange={noop} showErrors={extra.showErrors ?? false} status={extra.status ?? 'idle'} onContinue={noop} today={TODAY} dobOpen={extra.dobOpen ?? false} onDobOpenChange={noop} />
  );
}

export const SIGNIN_PREVIEW_STATES: Record<string, () => React.ReactElement> = {
  's01-default': () => s01('idle', '', false),
  's01-ready': () => s01('idle'),
  's01-invalid': () => s01('invalid', '12345'),
  's01-sending': () => s01('sending'),
  's01-no-whatsapp': () => s01('noWhatsapp'),
  's01-no-internet': () => s01('noInternet'),
  's01-rate-limited': () => s01('rateLimited'),
  's02-default': () => s02({ kind: 'idle' }),
  's02-filled': () => s02({ kind: 'idle' }, '123456'),
  's02-verifying': () => s02({ kind: 'verifying' }, '123456'),
  's02-verified': () => s02({ kind: 'verified' }, '123456'),
  's02-wrong': () => s02({ kind: 'wrong', attemptsLeft: 2 }),
  's02-resend': () => s02({ kind: 'idle' }, '', 0),
  's02-expired': () => s02({ kind: 'expired' }, '', 0),
  's02-locked': () => s02({ kind: 'locked' }, '', 0),
  's02-no-whatsapp': () => s02({ kind: 'noWhatsapp' }),
  's02-no-internet': () => s02({ kind: 'noInternet' }, '123456'),
  's03-default': () => s03(EMPTY_S03),
  's03-filled': () => s03(FILLED),
  's03-errors': () => s03(EMPTY_S03, { showErrors: true }),
  's03-dob': () => s03(FILLED, { dobOpen: true }),
  's03-self-describe': () => s03({ ...FILLED, gender: 'SELF_DESCRIBE', genderSelfDescription: 'Non-binary' }),
  's03-saving': () => s03(FILLED, { status: 'saving' }),
  's03-save-failed': () => s03(FILLED, { status: 'saveFailed' }),
  a04: () => <A04Under18 onBack={noop} onCheckDob={noop} onClose={noop} />,
  'a01-offer': () => <A01Offer enabled onToggle={noop} onTurnOn={noop} onNotNow={noop} />,
  'a01-locked': () => <A01Locked failed={false} onUnlock={noop} onUsePin={noop} />,
  'a01-failed': () => <A01Locked failed onUnlock={noop} onUsePin={noop} />,
  // A synthetic code from the real alphabet (no 0/O, 1/I/L).
  'a02-show': () => <A02Show code="K7QF-29XD-M4PN-8RWC" saved={false} copied={false} onCopy={noop} onToggleSaved={noop} onContinue={noop} />,
  'a02-copied': () => <A02Show code="K7QF-29XD-M4PN-8RWC" saved copied onCopy={noop} onToggleSaved={noop} onContinue={noop} />,
  'a02-enter': () => <A02Enter value="K7QF-29XD" onChange={noop} error={null} submitting={false} onSubmit={noop} onBack={noop} onNoCode={noop} />,
  'a02-wrong': () => <A02Enter value="K7QF-29XD-M4PN-8RWA" onChange={noop} error={t('a02.wrong')} submitting={false} onSubmit={noop} onBack={noop} onNoCode={noop} />,
  'a03-check': () => <A03Check phone={PHONE} hasPasskey={false} hasRecoveryCode onPasskey={noop} onRecoveryCode={noop} onContactSupport={noop} onBack={noop} />,
  'a03-hidden': () => <A03Hidden onContactSupport={noop} onSignOut={noop} />,
};

export const SIGNIN_PREVIEW_NAMES = Object.keys(SIGNIN_PREVIEW_STATES);

export function SigninPreview({ state, theme }: { state: string; theme: ThemeName }) {
  const render = SIGNIN_PREVIEW_STATES[state] ?? SIGNIN_PREVIEW_STATES['s01-default']!;
  return <ThemeProvider scheme={theme}>{render()}</ThemeProvider>;
}
