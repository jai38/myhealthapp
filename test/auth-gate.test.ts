import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

import { authGateState, needsRefresh, showsSessionEndedNote } from '../features/auth/authGate';
import { authService, UserSession } from '../services/auth/auth-service';
import { medicationStore } from '../services/medications/medication-store';
import { ApiClient, ApiError } from '../services/api/client';
import type { MedicationRecord, DoseLog } from '../services/medications/medication-service';

const NOW = 1_800_000_000_000;
const live = { expiresAt: NOW + 60_000 };
const stale = { expiresAt: NOW - 1 };

describe('needsRefresh', () => {
  it('is false without a session or without an expiry', () => {
    expect(needsRefresh(null, NOW)).toBe(false);
    expect(needsRefresh({}, NOW)).toBe(false);
  });
  it('is true when past or within the leeway of the expiry, false well before it', () => {
    expect(needsRefresh(stale, NOW)).toBe(true);
    expect(needsRefresh({ expiresAt: NOW + 30_000 }, NOW)).toBe(true);
    expect(needsRefresh({ expiresAt: NOW + 120_000 }, NOW)).toBe(false);
  });
});

describe('authGateState', () => {
  it('is restoring before initialization, whatever else is set', () => {
    expect(authGateState({ initialized: false, session: null, endReason: null })).toBe('restoring');
    expect(authGateState({ initialized: false, session: live, endReason: null })).toBe('restoring');
  });
  it('is signedOut with no session and no end reason', () => {
    expect(authGateState({ initialized: true, session: null, endReason: null })).toBe('signedOut');
  });
  it('is signedOut after a deliberate sign-out, with no note', () => {
    const state = authGateState({ initialized: true, session: null, endReason: 'signedOut' });
    expect(state).toBe('signedOut');
    expect(showsSessionEndedNote(state)).toBe(false);
  });
  it('is expired, with the note, after a 401 or expiry ended the session', () => {
    const state = authGateState({ initialized: true, session: null, endReason: 'expired' });
    expect(state).toBe('expired');
    expect(showsSessionEndedNote(state)).toBe(true);
  });
  it('keeps a cached session signedIn even when its token is past expiry (offline access)', () => {
    expect(authGateState({ initialized: true, session: stale, endReason: null })).toBe('signedIn');
  });
  it('is signedIn only for a live session', () => {
    expect(authGateState({ initialized: true, session: live, endReason: null })).toBe('signedIn');
    expect(authGateState({ initialized: true, session: {}, endReason: null })).toBe('signedIn');
  });
});

const makeSession = (over: Partial<UserSession> = {}): UserSession => ({
  userId: 'usr_gate_1',
  email: 'gate@example.com',
  patientProfileId: 'pat_gate_1',
  accessToken: 'synthetic-token',
  expiresAt: Date.now() + 3_600_000,
  ...over,
});

const med: MedicationRecord = {
  id: 'med-gate-1',
  patientProfileId: 'pat_gate_1',
  nameAsWritten: 'Tab Synthetic 5mg',
  normalizedMedicineName: 'Synthetic',
  strength: '5 mg',
  dosageForm: 'TABLET',
  route: 'ORAL',
  prescribedInstructions: 'Once daily',
  status: 'ACTIVE',
  startDate: new Date().toISOString(),
  reminderTimes: ['08:00'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Puts a session in place the way login does, without a real network call.
async function signInForTest(s: UserSession) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      data: {
        user: { id: s.userId, email: s.email },
        session: {
          accessToken: s.accessToken,
          patientProfileId: s.patientProfileId,
          expiresAt: s.expiresAt,
        },
      },
    }),
  } as Response);
  await authService.login(s.email, 'synthetic-password');
}

describe('the auth gate never renders patient data after expiry', () => {
  beforeEach(async () => {
    await authService.logout();
  });

  it('a subscriber sees null before anything else, and the gate is not signedIn', async () => {
    await signInForTest(makeSession());
    const seen: Array<{ session: UserSession | null; reason: string | null }> = [];
    const unsubscribe = authService.subscribe((s) => {
      seen.push({ session: s, reason: authService.getEndReason() });
    });
    seen.length = 0;

    await authService.expireSession();
    unsubscribe();

    expect(seen).toHaveLength(1);
    expect(seen[0]).toEqual({ session: null, reason: 'expired' });
    expect(authService.getSession()).toBeNull();
    expect(await authService.getToken()).toBeNull();
    const state = authGateState({
      initialized: true,
      session: authService.getSession(),
      endReason: authService.getEndReason(),
    });
    expect(state).toBe('expired');
    expect(state).not.toBe('signedIn');
  });

  it('clears the in-memory medicines and doses for the ended session', async () => {
    await signInForTest(makeSession());
    await medicationStore.switchUser('usr_gate_1');
    await medicationStore.addMedication(med);
    const dose = {
      id: 'dose-gate-1',
      medicationId: med.id,
      patientProfileId: 'pat_gate_1',
      scheduledAt: new Date().toISOString(),
      status: 'PENDING',
    } as unknown as DoseLog;
    await medicationStore.addDoseLog(dose);
    expect(medicationStore.getMedications().some((m) => m.id === med.id)).toBe(true);

    // Not awaited: the caches must already be empty when the sign-out notification returns.
    const ending = authService.expireSession();
    expect(medicationStore.getMedications().some((m) => m.id === med.id)).toBe(false);
    expect(medicationStore.getAllDoses().some((d) => d.id === dose.id)).toBe(false);
    await ending;
  });

  it('a 401 whose refresh the server rejects ends the session as expired', async () => {
    await signInForTest(makeSession());
    const client = new ApiClient({
      baseUrl: 'http://localhost/api',
      getToken: () => authService.getToken(),
      refreshSession: (t) => authService.refreshSession(t),
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
      text: async () => '',
    } as unknown as Response);

    await expect(client.get('/anything')).rejects.toBeInstanceOf(ApiError);
    expect(authService.getSession()).toBeNull();
    expect(authService.getEndReason()).toBe('expired');
  });

  it('a deliberate sign-out ends as signedOut, and expiring with no session changes nothing', async () => {
    await signInForTest(makeSession());
    await authService.logout();
    expect(authService.getEndReason()).toBe('signedOut');

    await authService.expireSession();
    expect(authService.getEndReason()).toBe('signedOut');
  });

  it('a new sign-in clears the end reason', async () => {
    await signInForTest(makeSession());
    await authService.expireSession();
    expect(authService.getEndReason()).toBe('expired');
    await signInForTest(makeSession());
    expect(authService.getEndReason()).toBeNull();
    expect(authService.getSession()).not.toBeNull();
  });
});
