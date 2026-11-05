// Pure auth gate rules. No native imports, so Vitest can run them in node.
// The root layout renders from authGateState and nothing else decides which tree is shown.

export type SessionEndReason = 'signedOut' | 'expired';

export type AuthGateState = 'restoring' | 'signedOut' | 'expired' | 'signedIn';

export interface SessionLike {
  expiresAt?: number;
}

/**
 * A session with a known expiry in the past is expired.
 * A session with no expiry is treated as live; the API's 401 ends it if the server disagrees.
 * No refresh flow exists in the app yet, so an expired session cannot be renewed.
 */
export function isSessionExpired(session: SessionLike | null | undefined, nowMs: number): boolean {
  if (!session) return false;
  if (typeof session.expiresAt !== 'number' || !Number.isFinite(session.expiresAt)) return false;
  return session.expiresAt <= nowMs;
}

export interface AuthGateInput {
  initialized: boolean;
  session: SessionLike | null | undefined;
  endReason: SessionEndReason | null | undefined;
  nowMs: number;
}

/**
 * Which tree to render. Patient data is reachable only from 'signedIn', and a
 * session that is expired (by its own expiry or by an end reason) is never signedIn.
 */
export function authGateState({ initialized, session, endReason, nowMs }: AuthGateInput): AuthGateState {
  if (!initialized) return 'restoring';
  if (!session) return endReason === 'expired' ? 'expired' : 'signedOut';
  if (isSessionExpired(session, nowMs)) return 'expired';
  return 'signedIn';
}

// The calm note shows only when the session ended by expiry, never after a deliberate sign-out.
export function showsSessionEndedNote(state: AuthGateState): boolean {
  return state === 'expired';
}
