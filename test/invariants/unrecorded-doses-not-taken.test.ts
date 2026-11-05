/**
 * Invariant 13: unrecorded past doses are never counted as taken. Adherence is never synthesized.
 *
 * Already proven by medication-store.test.ts (not repeated): a newly added medicine has no past
 * and no TAKEN doses; yesterday shows 0 taken and 0% with no doses; only recordAction changes a
 * dose to TAKEN; generateUpcomingDoses emits only PENDING, today-or-later doses; and the
 * isFabricatedBackfillDose signature function.
 *
 * Added here: the passage of time, loading stored data through the real init path, server sync,
 * guest mode, and a sweep over awkward clock times.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

import {
  medicationStore,
  generateUpcomingDoses,
  toLocalDateString,
} from '../../services/medications/medication-store';
import type { MedicationRecord, DoseLog } from '../../services/medications/medication-service';

const mkMed = (over: Partial<MedicationRecord> = {}): MedicationRecord => ({
  id: 'med-time-1',
  patientProfileId: 'pat-1',
  nameAsWritten: 'Tab Time 10mg',
  normalizedMedicineName: 'Time',
  strength: '10 mg',
  dosageForm: 'TABLET',
  route: 'ORAL',
  prescribedInstructions: 'Twice daily',
  status: 'ACTIVE',
  startDate: '2026-01-01T00:00:00.000Z',
  reminderTimes: ['08:00', '20:00'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

const day = (d: Date, offset: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + offset);
  return toLocalDateString(x);
};

describe('Invariant: unrecorded doses are never counted as taken', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 2, 9, 0, 0));
    await medicationStore.switchUser(null);
    await medicationStore.clearUserStorage();
  });

  afterEach(async () => {
    vi.useRealTimers();
    (AsyncStorage.getItem as any).mockImplementation(async () => null);
    await medicationStore.switchUser(null);
    await medicationStore.clearUserStorage();
  });

  it('letting ten days pass without any action never produces a TAKEN dose or taken adherence', async () => {
    const start = new Date();
    await medicationStore.addMedication(mkMed());
    const generated = medicationStore.getAllDoses().filter((d) => d.medicationId === 'med-time-1');
    expect(generated.length).toBeGreaterThan(0);

    vi.setSystemTime(new Date(2026, 10, 12, 9, 0, 0));

    const after = medicationStore.getAllDoses().filter((d) => d.medicationId === 'med-time-1');
    expect(after.some((d) => d.status === 'TAKEN')).toBe(false);
    expect(after.every((d) => d.status === 'PENDING')).toBe(true);
    for (let offset = 0; offset <= 10; offset++) {
      const a = medicationStore.getAdherenceForDate(day(start, offset), Date.now());
      expect(a.taken, `day +${offset}`).toBe(0);
      expect(a.percentage, `day +${offset}`).toBeNull();
    }
  });

  it('past doses that stay PENDING or SNOOZED are not counted as taken', async () => {
    await medicationStore.addMedication(mkMed());
    const [first, second] = medicationStore.getTodayDoses();
    await medicationStore.recordAction(first.id, 'SNOOZED');
    vi.setSystemTime(new Date(2026, 10, 5, 9, 0, 0));
    const today = day(new Date(2026, 10, 2), 0);
    const a = medicationStore.getAdherenceForDate(today, Date.now());
    expect(a.total).toBe(2);
    expect(a.taken).toBe(0);
    expect(medicationStore.getAllDoses().find((d) => d.id === second.id)!.status).toBe('PENDING');
  });

  it('only an explicit TAKEN raises adherence, and only for the dose acted on', async () => {
    await medicationStore.addMedication(mkMed());
    const [first] = medicationStore.getTodayDoses();
    await medicationStore.recordAction(first.id, 'TAKEN');
    const a = medicationStore.getAdherenceForDate(toLocalDateString(new Date()), Date.now());
    expect(a).toMatchObject({ percentage: 100, taken: 1, total: 2 });
  });

  describe('loading stored data through the real init path', () => {
    const store = new Map<string, string>();
    const seed = async (doses: DoseLog[]) => {
      store.clear();
      store.set('@myhealthapp/persisted_meds_user_seed', JSON.stringify([mkMed()]));
      store.set('@myhealthapp/persisted_doses_user_seed', JSON.stringify(doses));
      (AsyncStorage.getItem as any).mockImplementation(async (k: string) => store.get(k) ?? null);
      (AsyncStorage.setItem as any).mockImplementation(async (k: string, v: string) => void store.set(k, v));
      await medicationStore.switchUser('seed');
    };

    const dose = (over: Partial<DoseLog>): DoseLog => ({
      id: 'dose-med-time-1-2026-10-01-0800',
      medicationId: 'med-time-1',
      patientProfileId: 'pat-1',
      scheduledTime: '2026-10-01T08:00:00',
      status: 'PENDING',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
      ...over,
    });

    it('purges backfilled TAKEN history from older installs but keeps what the patient recorded', async () => {
      const fabricated = dose({
        id: 'dose-med-time-1-2026-10-01-0800',
        scheduledTime: '2026-10-01T08:00:00',
        status: 'TAKEN',
        actionTime: '2026-10-01T08:05:00',
      });
      const realTaken = dose({
        id: 'dose-med-time-1-2026-10-01-2000',
        scheduledTime: '2026-10-01T20:00:00',
        status: 'TAKEN',
        actionTime: '2026-10-01T20:07:41.382Z',
      });
      const realSkipped = dose({ id: 'dose-med-time-1-2026-10-02-0800', scheduledTime: '2026-10-02T08:00:00', status: 'SKIPPED' });
      const pending = dose({ id: 'dose-med-time-1-2026-10-02-2000', scheduledTime: '2026-10-02T20:00:00', status: 'PENDING' });
      await seed([fabricated, realTaken, realSkipped, pending]);

      const ids = medicationStore.getAllDoses().map((d) => d.id);
      expect(ids).not.toContain(fabricated.id);
      expect(ids).toEqual(expect.arrayContaining([realTaken.id, realSkipped.id, pending.id]));
      expect(medicationStore.getAdherenceForDate('2026-10-01', Date.now())).toMatchObject({ percentage: 100, taken: 1, total: 1 });
      expect(medicationStore.getAllDoses().find((d) => d.id === pending.id)!.status).toBe('PENDING');
      // The purge was persisted, so it does not come back on the next launch.
      expect(store.get('@myhealthapp/persisted_doses_user_seed')).not.toContain(fabricated.id);
    });

    it('past PENDING doses loaded from storage stay not-taken and add nothing to adherence', async () => {
      await seed([
        dose({ id: 'dose-med-time-1-2026-10-03-0800', scheduledTime: '2026-10-03T08:00:00' }),
        dose({ id: 'dose-med-time-1-2026-10-03-2000', scheduledTime: '2026-10-03T20:00:00' }),
      ]);
      expect(medicationStore.getAllDoses().every((d) => d.status === 'PENDING')).toBe(true);
      expect(medicationStore.getAdherenceForDate('2026-10-03', Date.now())).toMatchObject({ percentage: null, taken: 0, notConfirmed: 2, total: 2 });
    });
  });

  it('server sync of unanswered past doses does not turn them into taken', async () => {
    const past: DoseLog = {
      id: 'srv-1',
      medicationId: 'med-time-1',
      patientProfileId: 'pat-1',
      scheduledTime: '2026-10-20T08:00:00',
      status: 'PENDING',
      createdAt: '2026-10-20T00:00:00.000Z',
      updatedAt: '2026-10-20T00:00:00.000Z',
    };
    await medicationStore.syncFromServer([mkMed()], [past]);
    expect(medicationStore.getAllDoses().find((d) => d.id === 'srv-1')!.status).toBe('PENDING');
    expect(medicationStore.getAdherenceForDate('2026-10-20', Date.now())).toMatchObject({ percentage: null, taken: 0, notConfirmed: 1, total: 1 });
  });

  it('guest mode starts with no taken history and no past doses', async () => {
    await medicationStore.switchUser(null);
    const todayStr = toLocalDateString(new Date());
    const doses = medicationStore.getAllDoses();
    expect(doses.some((d) => d.status === 'TAKEN')).toBe(false);
    expect(doses.every((d) => d.scheduledTime.slice(0, 10) >= todayStr)).toBe(true);
  });

  it('a day with no doses reports no adherence, never 100%', () => {
    expect(medicationStore.getAdherenceForDate('2020-01-01', Date.now())).toMatchObject({ percentage: null, taken: 0, total: 0 });
  });

  it.each([
    ['just before midnight', new Date(2026, 10, 2, 23, 59, 59)],
    ['just after midnight', new Date(2026, 10, 3, 0, 0, 1)],
    ['month boundary', new Date(2026, 9, 31, 23, 30, 0)],
    ['year boundary', new Date(2026, 11, 31, 23, 59, 0)],
    ['leap day', new Date(2028, 1, 29, 12, 0, 0)],
  ])('generateUpcomingDoses at %s emits only PENDING doses dated today or later', (_label, now) => {
    vi.setSystemTime(now);
    const todayStr = toLocalDateString(now);
    const meds = [
      mkMed(),
      mkMed({ id: 'm2', reminderTimes: ['00:00', '12:30', '23:59'] }),
      mkMed({ id: 'm3', reminderTimes: ['06:00'], startDate: '1999-01-01T00:00:00.000Z' }),
      mkMed({ id: 'm4', status: 'INACTIVE' }),
      mkMed({ id: 'm5', status: 'PAUSED' as any }),
    ];
    const doses = generateUpcomingDoses(meds);
    expect(doses.length).toBeGreaterThan(0);
    for (const d of doses) {
      expect(d.status).toBe('PENDING');
      expect(d.actionTime).toBeUndefined();
      expect(d.scheduledTime.slice(0, 10) >= todayStr).toBe(true);
    }
    expect(doses.some((d) => d.medicationId === 'm4' || d.medicationId === 'm5')).toBe(false);
  });
});
