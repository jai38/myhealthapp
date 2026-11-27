import AsyncStorage from '@react-native-async-storage/async-storage';
import { needsRefresh, type SessionEndReason } from '../../features/auth/authGate';
import { cancelAllMedicationReminders } from '../notifications/notification-service';
import { t } from '../../design/strings';
import {
  APP_ENV_STORAGE_KEY,
  ENV_SCOPED_STORAGE_KEYS,
  environmentFingerprint,
  resolveApiBaseUrl,
} from '../config/environment';
import { secureStorage } from './secure-storage';

export interface UserSession {
  userId: string;
  /** Email sign-in only. Phone accounts (Phase 5) have no login email. */
  email?: string;
  /** Phone sign-in only: E.164, e.g. "+919876543210". */
  phone?: string;
  /** How the session was made. Missing on sessions saved before Phase 5: email. */
  kind?: 'email' | 'phone';
  /** Phone sessions: false until S03 is done (health-data routes answer 403 until then). */
  profileComplete?: boolean;
  /** Phone sessions: 'pending' until S03, A01 and A02 are finished (the gate keeps the flow up). */
  onboarding?: 'pending' | 'done';
  fullName?: string;
  patientProfileId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

const STORAGE_KEYS = {
  /** Legacy: the access token in plain storage. Cleared; tokens live in secure storage now. */
  TOKEN: '@myhealthapp/auth_token',
  /** The session without its tokens. */
  SESSION: '@myhealthapp/user_session',
  /** Access and refresh tokens, in secure storage (Phase 5 task 11). */
  SECRETS: '@myhealthapp/session_tokens',
} as const;

type SessionTokens = Pick<UserSession, 'accessToken' | 'refreshToken'>;

function withoutTokens(session: UserSession): Omit<UserSession, 'accessToken' | 'refreshToken'> {
  const { accessToken: _a, refreshToken: _r, ...rest } = session;
  return rest;
}

// In-memory fallback for Node.js test runners where native storage is unavailable
const memoryStorage = new Map<string, string>();

const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null && val !== undefined) return val;
    } catch {
      // ignore
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const val = localStorage.getItem(key);
        if (val !== null && val !== undefined) return val;
      } catch {
        // ignore
      }
    }
    return memoryStorage.get(key) || null;
  },
  async setItem(key: string, value: string): Promise<void> {
    memoryStorage.set(key, value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // ignore
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch {
        // ignore
      }
    }
  },
  async removeItem(key: string): Promise<void> {
    memoryStorage.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  },
};

type AuthListener = (session: UserSession | null) => void;

export type { SessionEndReason };

// retry: a usable token is now current, so send the request again.
// rejected: the server refused the refresh and the session has ended as expired.
// unreachable: the refresh could not be completed (offline, server error); the session is kept.
export type RefreshOutcome = 'retry' | 'rejected' | 'unreachable';

class AuthService {
  private currentSession: UserSession | null = null;
  private listeners: Set<AuthListener> = new Set();
  private initialized: boolean = false;
  private ready: Promise<void>;
  private refreshInFlight: Promise<RefreshOutcome> | null = null;
  // Why the last session ended. Cleared when a new session starts.
  private endReason: SessionEndReason | null = null;

  constructor() {
    this.ready = this.loadPersistedSession();
  }

  /**
   * Switching between prod, dev and local must never carry a session, cached medicines or scheduled
   * reminders across: the other backend's IDs and tokens mean nothing here, and dev data must never
   * appear next to real records. On a change, everything scoped to the old backend is cleared.
   */
  private async clearIfEnvironmentChanged(): Promise<void> {
    const current = environmentFingerprint();
    const previous = await safeStorage.getItem(APP_ENV_STORAGE_KEY);
    if (previous === current) return;
    if (previous !== null) {
      for (const key of ENV_SCOPED_STORAGE_KEYS) await safeStorage.removeItem(key);
      await secureStorage.removeItem(STORAGE_KEYS.SECRETS);
      try {
        await cancelAllMedicationReminders();
      } catch {
        // Notifications unavailable (tests, web): nothing scheduled to cancel.
      }
    }
    await safeStorage.setItem(APP_ENV_STORAGE_KEY, current);
  }

  private async loadPersistedSession(): Promise<void> {
    try {
      await this.clearIfEnvironmentChanged();
      const raw = await safeStorage.getItem(STORAGE_KEYS.SESSION);
      if (raw) {
        // A cached session is kept even when its token is old, so an offline patient still gets in.
        const stored = JSON.parse(raw) as UserSession;
        if (stored.accessToken) {
          // Saved before tokens moved to secure storage: move them there now.
          await this.writeSession(stored);
          this.currentSession = stored;
        } else {
          const secretsRaw = await secureStorage.getItem(STORAGE_KEYS.SECRETS);
          const secrets = secretsRaw ? (JSON.parse(secretsRaw) as SessionTokens) : null;
          // Without its tokens a session is no use: treat it as signed out.
          this.currentSession = secrets?.accessToken ? { ...stored, ...secrets } : null;
        }
        this.notifyListeners();
      }
    } catch {
      // Clean fallback
    } finally {
      this.initialized = true;
    }
    // Renew an old token in the background. Only the server rejecting it ends the session.
    if (needsRefresh(this.currentSession, Date.now())) {
      void this.refreshSession(null);
    }
  }

  async waitForInitialization(): Promise<void> {
    await this.ready;
  }

  subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.currentSession);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentSession);
    }
  }

  async getToken(): Promise<string | null> {
    // A refresh in flight is about to replace the token; wait so callers send the new one.
    if (this.refreshInFlight) await this.refreshInFlight;
    if (this.currentSession?.accessToken) {
      return this.currentSession.accessToken;
    }
    return await safeStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  getEndReason(): SessionEndReason | null {
    return this.endReason;
  }

  getSession(): UserSession | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentSession?.accessToken;
  }

  private getBaseUrl(): string {
    return resolveApiBaseUrl();
  }

  async login(email: string, password: string): Promise<UserSession> {
    const url = `${this.getBaseUrl()}/auth/login`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const message = body?.error?.message || t('auth.loginFailed');
      throw new Error(message);
    }

    const { user, session } = body.data;
    const userSession: UserSession = {
      userId: user.id || session.userId,
      email: user.email,
      fullName: user.fullName,
      patientProfileId: session.patientProfileId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    };

    await this.saveSession(userSession);
    return userSession;
  }

  async signup(email: string, password: string, fullName?: string): Promise<UserSession> {
    const url = `${this.getBaseUrl()}/auth/signup`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        fullName: fullName?.trim() || undefined,
      }),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const message = body?.error?.message || t('auth.signupFailed');
      throw new Error(message);
    }

    const { user, session } = body.data;
    if (!session) {
      throw new Error(t('auth.signupNoSession'));
    }
    const userSession: UserSession = {
      userId: user.id || session.userId,
      email: user.email,
      fullName: fullName?.trim() || 'Patient',
      patientProfileId: session.patientProfileId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    };

    await this.saveSession(userSession);
    return userSession;
  }

  /** Tokens to secure storage, the rest of the session to plain storage. */
  private async writeSession(session: UserSession): Promise<void> {
    const tokens: SessionTokens = { accessToken: session.accessToken, refreshToken: session.refreshToken };
    await secureStorage.setItem(STORAGE_KEYS.SECRETS, JSON.stringify(tokens));
    await safeStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(withoutTokens(session)));
    await safeStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

  private async clearStoredSession(): Promise<void> {
    await secureStorage.removeItem(STORAGE_KEYS.SECRETS);
    await safeStorage.removeItem(STORAGE_KEYS.TOKEN);
    await safeStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  private async saveSession(session: UserSession): Promise<void> {
    this.currentSession = session;
    this.endReason = null;
    await this.writeSession(session);
    // A sign-out during the writes above must not leave this session on disk.
    if (this.currentSession !== session) {
      if (this.currentSession === null) await this.clearStoredSession();
      return;
    }
    this.notifyListeners();
  }

  /**
   * Phase 5: a phone sign-in (POST /auth/otp/verify or /auth/second-factor, then GET /auth/me).
   * Only reachable behind the dev switch until the phone routes are live.
   */
  async signInWithPhone(input: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    userId: string;
    patientProfileId: string;
    phone?: string;
    fullName?: string;
    profileComplete: boolean;
    onboarding: 'pending' | 'done';
  }): Promise<UserSession> {
    const session: UserSession = { kind: 'phone', ...input };
    await this.saveSession(session);
    return session;
  }

  /** Phase 5: the sign-in flow is finished (S03, A01, A02 as needed); the app opens. */
  async finishOnboarding(): Promise<void> {
    const current = this.currentSession;
    if (!current) return;
    await this.saveSession({ ...current, onboarding: 'done' });
  }

  /** Phase 5: S03 is done, so the account may use the health-data routes. */
  async markProfileComplete(fullName?: string): Promise<void> {
    const current = this.currentSession;
    if (!current) return;
    await this.saveSession({ ...current, profileComplete: true, fullName: fullName ?? current.fullName });
  }

  /**
   * Renews the access token with the refresh token. One refresh at a time: concurrent
   * callers share it, so a rotating refresh token is never spent twice.
   * `failedToken` is the access token a rejected request was sent with. If it is no longer
   * the current token, a newer one already exists and the caller just retries.
   */
  refreshSession(failedToken: string | null): Promise<RefreshOutcome> {
    const current = this.currentSession;
    if (!current) return Promise.resolve('rejected');
    if (failedToken && failedToken !== current.accessToken) return Promise.resolve('retry');
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.doRefresh(current).finally(() => {
        this.refreshInFlight = null;
      });
    }
    return this.refreshInFlight;
  }

  private async doRefresh(started: UserSession): Promise<RefreshOutcome> {
    if (!started.refreshToken) {
      await this.expireSession();
      return 'rejected';
    }
    let res: Response;
    try {
      res = await fetch(`${this.getBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken: started.refreshToken }),
      });
    } catch {
      return 'unreachable';
    }
    // The patient signed out, or in as someone else, while this was in flight: drop the result.
    if (this.currentSession?.refreshToken !== started.refreshToken) {
      return this.currentSession ? 'retry' : 'rejected';
    }
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      await this.expireSession();
      return 'rejected';
    }
    if (!res.ok) return 'unreachable';
    const body = await res.json().catch(() => null);
    // Check again: the patient may have signed out while the body was being read.
    if (this.currentSession?.refreshToken !== started.refreshToken) {
      return this.currentSession ? 'retry' : 'rejected';
    }
    const next = body?.data?.session;
    if (!next?.accessToken || !next?.refreshToken) return 'unreachable';
    await this.saveSession({
      ...started,
      accessToken: next.accessToken,
      refreshToken: next.refreshToken,
      expiresAt: next.expiresAt,
    });
    return 'retry';
  }

  // Deliberate sign-out: no note is shown afterwards. Scheduled reminders are cancelled so
  // another person using the device is not shown this patient's medicines.
  async logout(): Promise<void> {
    const refreshToken = this.currentSession?.refreshToken;
    await this.endSession('signedOut');
    await cancelAllMedicationReminders();
    if (refreshToken) {
      // Best effort: sign-out never waits on, or fails because of, the server.
      void fetch(`${this.getBaseUrl()}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
  }

  // The server rejected the refresh, or there is no refresh token. Reminders are left alone: a
  // missed dose is the worse harm. Does nothing without a session.
  async expireSession(): Promise<void> {
    if (!this.currentSession) return;
    await this.endSession('expired');
  }

  private async endSession(reason: SessionEndReason): Promise<void> {
    // In memory first and synchronously, so subscribers see null before any await.
    this.currentSession = null;
    this.endReason = reason;
    this.notifyListeners();
    await this.clearStoredSession();
  }
}

export const authService = new AuthService();
