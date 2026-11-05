// Pure auth gate rules. No native imports, so Vitest can run them in node.
// The root layout renders from authGateState and nothing else decides which tree is shown.

export type SessionEndReason = 'signedOut' | 'expired';

export type AuthGateState = 'restoring' | 'signedOut' | 'expired' | 'signedIn';

export interface SessionLike {
  expiresAt?: number;
}

// Refresh the access token when it is this close to its expiry, or past it.
export const REFRESH_LEEWAY_MS = 60_000;

/**
 * True when the access token is past or near its expiry and should be refreshed.
 * The clock only ever triggers a refresh attempt. It never signs the patient out:
 * only the server rejecting the refresh does that. A session with no expiry is not
 * refreshed ahead of time; a 401 triggers the refresh instead.
 */
export function needsRefresh(
  session: SessionLike | null | undefined,
  nowMs: number,
  leewayMs: number = REFRESH_LEEWAY_MS
): boolean {
  if (!session) return false;
  if (typeof session.expiresAt !== 'number' || !Number.isFinite(session.expiresAt)) return false;
  return session.expiresAt - leewayMs <= nowMs;
}

export interface AuthGateInput {
  initialized: boolean;
  session: SessionLike | null | undefined;
  endReason: SessionEndReason | null | undefined;
}

/**
 * Which tree to render. Patient data is reachable only from 'signedIn'. A session ends as
 * expired only through the auth service (the server rejected the refresh, or there was no
 * refresh token), which clears it and sets the end reason. A cached session whose token is
 * merely old stays signedIn, so an offline patient keeps access.
 */
export function authGateState({ initialized, session, endReason }: AuthGateInput): AuthGateState {
  if (!initialized) return 'restoring';
  if (!session) return endReason === 'expired' ? 'expired' : 'signedOut';
  return 'signedIn';
}

// The calm note shows only when the session ended by expiry, never after a deliberate sign-out.
export function showsSessionEndedNote(state: AuthGateState): boolean {
  return state === 'expired';
}
