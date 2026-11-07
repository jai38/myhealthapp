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

export interface UserSession {
  userId: string;
  email: string;
  fullName?: string;
  patientProfileId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

const STORAGE_KEYS = {
  TOKEN: '@myhealthapp/auth_token',
  SESSION: '@myhealthapp/user_session',
} as const;

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
        this.currentSession = JSON.parse(raw);
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

  private async saveSession(session: UserSession): Promise<void> {
    this.currentSession = session;
    this.endReason = null;
    await safeStorage.setItem(STORAGE_KEYS.TOKEN, session.accessToken);
    await safeStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    // A sign-out during the writes above must not leave this session on disk.
    if (this.currentSession !== session) {
      if (this.currentSession === null) {
        await safeStorage.removeItem(STORAGE_KEYS.TOKEN);
        await safeStorage.removeItem(STORAGE_KEYS.SESSION);
      }
      return;
    }
    this.notifyListeners();
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
    await safeStorage.removeItem(STORAGE_KEYS.TOKEN);
    await safeStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

export const authService = new AuthService();
