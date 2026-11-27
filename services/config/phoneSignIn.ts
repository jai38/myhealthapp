// Phase 5: the WhatsApp phone sign-in (S01–S03, A01–A04) is built against backend PR #12,
// which isn't live. Until it is, it stays behind this dev-only switch and email sign-in stays
// the default (working agreement rule 5). Production builds can never turn it on.
//
//   EXPO_PUBLIC_PHONE_SIGN_IN=on  with  EXPO_PUBLIC_APP_ENV=dev or local
import { readEnvInput, resolveAppEnv, type EnvInput } from './environment';

export function isPhoneSignInEnabled(
  input: EnvInput & { phoneSignIn?: string } = { ...readEnvInput(), phoneSignIn: process.env.EXPO_PUBLIC_PHONE_SIGN_IN },
): boolean {
  if (resolveAppEnv(input) === 'prod') return false;
  return (input.phoneSignIn ?? '').trim().toLowerCase() === 'on';
}
