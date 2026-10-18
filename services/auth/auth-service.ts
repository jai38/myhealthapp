import AsyncStorage from '@react-native-async-storage/async-storage';

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

class AuthService {
  private currentSession: UserSession | null = null;
  private listeners: Set<AuthListener> = new Set();
  private initialized: boolean = false;

  constructor() {
    this.loadPersistedSession();
  }

  private async loadPersistedSession(): Promise<void> {
    try {
      const raw = await safeStorage.getItem(STORAGE_KEYS.SESSION);
      if (raw) {
        this.currentSession = JSON.parse(raw);
        this.notifyListeners();
      }
    } catch {
      // Clean fallback
    } finally {
      this.initialized = true;
    }
  }

  async waitForInitialization(): Promise<void> {
    if (this.initialized) return;
    await this.loadPersistedSession();
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
    if (this.currentSession?.accessToken) {
      return this.currentSession.accessToken;
    }
    return await safeStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  getSession(): UserSession | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentSession?.accessToken;
  }

  private getBaseUrl(): string {
    return process.env.EXPO_PUBLIC_API_URL || 'https://myhealthapp-backend.onrender.com/api/v1';
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
      const message = body?.error?.message || 'Login failed. Please check your credentials.';
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
      const message = body?.error?.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }

    const { user, session } = body.data;
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
    await safeStorage.setItem(STORAGE_KEYS.TOKEN, session.accessToken);
    await safeStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    this.notifyListeners();
  }

  async logout(): Promise<void> {
    this.currentSession = null;
    await safeStorage.removeItem(STORAGE_KEYS.TOKEN);
    await safeStorage.removeItem(STORAGE_KEYS.SESSION);
    this.notifyListeners();
  }
}

export const authService = new AuthService();
