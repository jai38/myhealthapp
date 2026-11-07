/**
 * Which backend the app talks to. One switch, set at start or build time:
 *
 *   EXPO_PUBLIC_APP_ENV = prod | dev | local      (default prod)
 *
 *   npm run start:prod    real sign-ins and real data
 *   npm run start:dev     shared AWS dev copy with synthetic data (EXPO_PUBLIC_DEV_API_URL)
 *   npm run start:local   your own backend (EXPO_PUBLIC_LOCAL_API_URL, default localhost:4000)
 *
 * EXPO_PUBLIC_API_URL still overrides everything, for one-off tests.
 * Expo only inlines EXPO_PUBLIC_* values written out literally, so each is read by name below.
 */

export type AppEnv = 'prod' | 'dev' | 'local';

/** Public address, not a secret. */
export const PROD_API_URL = 'https://b3tvclkxnc.execute-api.ap-south-1.amazonaws.com/api/v1';
export const LOCAL_API_URL = 'http://localhost:4000/api/v1';
/** Used when dev is chosen but no dev URL was given: requests fail visibly instead of reaching prod. */
export const DEV_URL_MISSING = 'https://dev-api-url-not-set.invalid/api/v1';

export interface EnvInput {
  appEnv?: string;
  apiUrl?: string;
  devApiUrl?: string;
  localApiUrl?: string;
}

export function readEnvInput(): EnvInput {
  return {
    appEnv: process.env.EXPO_PUBLIC_APP_ENV,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    devApiUrl: process.env.EXPO_PUBLIC_DEV_API_URL,
    localApiUrl: process.env.EXPO_PUBLIC_LOCAL_API_URL,
  };
}

export function resolveAppEnv(input: EnvInput = readEnvInput()): AppEnv {
  const v = (input.appEnv ?? '').trim().toLowerCase();
  return v === 'dev' || v === 'local' ? v : 'prod';
}

export function resolveApiBaseUrl(input: EnvInput = readEnvInput()): string {
  const override = input.apiUrl?.trim();
  if (override) return override;
  switch (resolveAppEnv(input)) {
    case 'dev': {
      const dev = input.devApiUrl?.trim() ?? '';
      return /^https?:\/\//.test(dev) ? dev : DEV_URL_MISSING;
    }
    case 'local':
      return input.localApiUrl?.trim() || LOCAL_API_URL;
    default:
      return PROD_API_URL;
  }
}

/** Remembers which backend the stored session and caches came from. */
export const APP_ENV_STORAGE_KEY = '@myhealthapp/app_env';

/**
 * Data that belongs to one backend. When the app starts against a different backend, these are
 * cleared so a dev session or dev medicines never show up in a prod build, or the reverse.
 */
export const ENV_SCOPED_STORAGE_KEYS = [
  '@myhealthapp/auth_token',
  '@myhealthapp/user_session',
  '@myhealthapp/persisted_meds',
  '@myhealthapp/persisted_doses',
  '@myhealthapp/store_initialized_v2',
] as const;

/** A key for the backend in use: the env name plus its URL, so two dev URLs also count as a change. */
export function environmentFingerprint(input: EnvInput = readEnvInput()): string {
  return `${resolveAppEnv(input)}|${resolveApiBaseUrl(input)}`;
}
