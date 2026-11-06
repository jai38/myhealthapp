import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

import { canRecordDoseNow, doseStatusFor } from '../features/medications/dose-display';
import { runAsNeededDose, runDoseAction } from '../features/today/useDoseActions';
import { doseDisplayStateFor, doseStatusDisplayFor } from '../features/today/todayModel';
import { medicationStore } from '../services/medications/medication-store';
import { medicationService } from '../services/medications/medication-service';
import type { DoseLog, MedicationRecord } from '../services/medications/medication-service';
import { authService } from '../services/auth/auth-service';
import { t } from '../design/strings';

const MIN = 60_000;
const NOW = new Date('2026-11-05T10:00:00.000Z').getTime();
const iso = (mins: number) => new Date(NOW + mins * MIN).toISOString();

const dose = (over: Partial<DoseLog> = {}): DoseLog => ({
  id: 'd1',
  medicationId: 'm1',
  patientProfileId: 'p1',
  scheduledTime: iso(-120),
  status: 'PENDING',
  actionTime: null,
  snoozeMinutes: null,
  createdAt: '2026-11-04T00:00:00.000Z',
  updatedAt: '2026-11-04T00:00:00.000Z',
  ...over,
});
const med = (over: Partial<MedicationRecord> = {}): MedicationRecord => ({
  id: 'm1',
  patientProfileId: 'p1',
  nameAsWritten: 'Synthetic 10mg',
  dosageForm: 'TABLET',
  route: 'ORAL',
  status: 'ACTIVE',
  reminderTimes: ['08:00'],
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  ...over,
});
const fmt = (d: Date) => d.toISOString();

describe('Finding 1: one gate for Taken and Skip on the Medicines day schedule', () => {
  it('offers actions for an unrecorded dose of an active medicine that is not in the future', () => {
    expect(canRecordDoseNow(dose(), med(), NOW)).toBe(true);
    expect(canRecordDoseNow(dose({ status: 'SNOOZED' }), med(), NOW)).toBe(true);
  });

  it('no actions for paused or stopped medicines', () => {
    for (const status of ['PAUSED', 'DISCONTINUED', 'COMPLETED', 'INACTIVE'] as const) {
      expect(canRecordDoseNow(dose(), med({ status }), NOW)).toBe(false);
    }
  });

  it('no actions for a dose scheduled in the future', () => {
    expect(canRecordDoseNow(dose({ scheduledTime: iso(30) }), med(), NOW)).toBe(false);
    expect(canRecordDoseNow(dose({ scheduledTime: iso(60 * 24 * 3) }), med(), NOW)).toBe(false);
  });

  it('no actions for a dose that is already recorded', () => {
    expect(canRecordDoseNow(dose({ status: 'TAKEN' }), med(), NOW)).toBe(false);
    expect(canRecordDoseNow(dose({ status: 'SKIPPED' }), med(), NOW)).toBe(false);
  });

  it('DaySchedule uses the shared gate for the buttons and the pending count', () => {
    const src = readFileSync(new URL('../features/medications/DaySchedule.tsx', import.meta.url), 'utf8');
    expect(src).toContain('canRecordDoseNow(dose, med, nowMs)');
    expect(src).toContain('canActOnDose(d,');
    expect(src).not.toContain('actionableDoses.length');
  });
});

describe('Finding 2b: a failed server save is not left on screen as saved', () => {
  beforeEach(async () => {
    await medicationStore.clearUserStorage();
    await medicationStore.addMedication(med({ id: 'med-fail-1' }));
  });
  afterEach(() => vi.restoreAllMocks());

  it('restores the dose and throws when the server fails (signed in)', async () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(medicationService, 'recordDoseAction').mockRejectedValue(new Error('network'));
    const [first] = medicationStore.getTodayDoses();
    const before = { ...first };

    await expect(medicationStore.recordAction(first.id, 'TAKEN')).rejects.toThrow();
    const after = medicationStore.getAllDoses().find((d) => d.id === first.id)!;
    expect(after.status).toBe(before.status);
    expect(after.actionTime ?? null).toBe(before.actionTime ?? null);
  });

  it('keeps the dose when the server saves it', async () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(medicationService, 'recordDoseAction').mockResolvedValue(dose());
    const [first] = medicationStore.getTodayDoses();
    await medicationStore.recordAction(first.id, 'SKIPPED');
    expect(medicationStore.getAllDoses().find((d) => d.id === first.id)!.status).toBe('SKIPPED');
  });

  it('signed out (guest) the action stays on the phone', async () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(false);
    const spy = vi.spyOn(medicationService, 'recordDoseAction');
    const [first] = medicationStore.getTodayDoses();
    await medicationStore.recordAction(first.id, 'TAKEN');
    expect(spy).not.toHaveBeenCalled();
    expect(medicationStore.getAllDoses().find((d) => d.id === first.id)!.status).toBe('TAKEN');
  });

  it('runDoseAction shows the calm error and no success notice on failure', async () => {
    vi.spyOn(medicationStore, 'recordAction').mockRejectedValue(new Error('x'));
    const notices: Array<string | null> = [];
    const onFailure = vi.fn();
    await runDoseAction([med()], 'd1', 'TAKEN', undefined, {
      setActionNotice: (n) => notices.push(n),
      setActionDoseId: () => undefined,
      onFailure,
    });
    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(notices.some((n) => n !== null)).toBe(false);
    expect(t('status.doseActionFailedBody')).toMatch(/not saved/i);
  });

  it('runDoseAction shows a plain notice on success, with no emoji', async () => {
    vi.spyOn(medicationStore, 'recordAction').mockResolvedValue(dose({ status: 'TAKEN' }));
    const notices: Array<string | null> = [];
    await runDoseAction([med()], 'd1', 'TAKEN', undefined, {
      setActionNotice: (n) => notices.push(n),
      setActionDoseId: () => undefined,
      onFailure: vi.fn(),
    });
    expect(notices[0]).toBe('Synthetic 10mg marked as taken.');
  });
});

describe('Finding 2a: an as-needed dose is saved on this phone only, and says so', () => {
  afterEach(() => vi.restoreAllMocks());

  it('the notice says it is saved on this phone only, and never claims a server log', async () => {
    vi.spyOn(medicationStore, 'addDoseLog').mockResolvedValue();
    const notices: Array<string | null> = [];
    await runAsNeededDose(med(), { setActionNotice: (n) => notices.push(n), onFailure: vi.fn() });
    expect(notices[0]).toMatch(/Saved on this phone only/);
    expect(notices[0]).not.toMatch(/logged|synced|server/i);
  });

  it('shows the calm error if the phone cannot save it', async () => {
    vi.spyOn(medicationStore, 'addDoseLog').mockRejectedValue(new Error('x'));
    const onFailure = vi.fn();
    await runAsNeededDose(med(), { setActionNotice: vi.fn(), onFailure });
    expect(onFailure).toHaveBeenCalledTimes(1);
  });
});

describe('Finding 16: unknown times are shown as unknown', () => {
  it('a dose with a missing or invalid scheduledTime shows "Time unknown", not Not confirmed or 1970', () => {
    for (const scheduledTime of ['', 'not-a-date', undefined as unknown as string]) {
      const d = dose({ scheduledTime });
      const state = doseDisplayStateFor(d, NOW);
      const display = doseStatusDisplayFor(d, state, fmt);
      expect(display?.labelKey).toBe('status.timeUnknown');
      expect(t(display!.labelKey)).toBe('Time unknown');
      expect(JSON.stringify(display)).not.toContain('1970');
      // Still never Taken or Missed.
      expect(state.kind).toBe('notConfirmed');
      expect(doseStatusFor(d, NOW, med())?.labelKey).toBe('status.timeUnknown');
    }
  });

  it('a Taken dose with no actionTime and no updatedAt does not show the scheduled time', () => {
    const d = dose({ status: 'TAKEN', actionTime: null, updatedAt: '' });
    const display = doseStatusDisplayFor(d, doseDisplayStateFor(d, NOW), fmt);
    expect(display?.labelKey).toBe('status.takenTimeUnknown');
    expect(display?.labelParams).toBeUndefined();
    expect(t(display!.labelKey)).toBe('Taken · time unknown');
  });

  it('a Taken dose with a recorded time still shows that time', () => {
    const d = dose({ status: 'TAKEN', actionTime: iso(-5) });
    const display = doseStatusDisplayFor(d, doseDisplayStateFor(d, NOW), fmt);
    expect(display?.labelKey).toBe('status.taken');
    expect(display?.labelParams).toEqual({ time: iso(-5) });
  });

  it('a normal unrecorded past dose is still Not confirmed', () => {
    const d = dose();
    expect(doseStatusDisplayFor(d, doseDisplayStateFor(d, NOW), fmt)?.labelKey).toBe('status.notConfirmed');
  });
});
