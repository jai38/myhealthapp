import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  isFabricatedBackfillDose,
  toLocalDateString,
} from '../services/medications/medication-store';
import type { MedicationRecord, DoseLog } from '../services/medications/medication-service';

const newMed: MedicationRecord = {
  id: 'med-regression-1',
  patientProfileId: 'pat-1',
  nameAsWritten: 'Tab Regression 10mg',
  normalizedMedicineName: 'Regression',
  strength: '10 mg',
  dosageForm: 'TABLET',
  route: 'ORAL',
  prescribedInstructions: 'Once daily',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
  reminderTimes: ['08:00', '20:00'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Medication store: no fabricated adherence history', () => {
  beforeEach(async () => {
    await medicationStore.clearUserStorage();
  });

  it('a newly added medicine has no past doses and no TAKEN doses', async () => {
    await medicationStore.addMedication(newMed);
    const todayStr = toLocalDateString(new Date());
    const doses = medicationStore.getAllDoses().filter((d) => d.medicationId === newMed.id);

    expect(doses.length).toBeGreaterThan(0);
    expect(doses.some((d) => d.status === 'TAKEN')).toBe(false);
    expect(doses.every((d) => d.status === 'PENDING')).toBe(true);
    expect(doses.every((d) => !d.actionTime)).toBe(true);
    expect(doses.every((d) => d.scheduledTime.slice(0, 10) >= todayStr)).toBe(true);
  });

  it('past days report no taken doses and no adherence figure until an explicit action', async () => {
    await medicationStore.addMedication(newMed);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const adherence = medicationStore.getAdherenceForDate(toLocalDateString(yesterday), Date.now());
    expect(adherence).toMatchObject({ percentage: null, taken: 0, total: 0 });
  });

  it('only an explicit TAKEN action changes a dose to TAKEN', async () => {
    await medicationStore.addMedication(newMed);
    const [first, second] = medicationStore.getTodayDoses();
    expect(first.status).toBe('PENDING');

    await medicationStore.recordAction(first.id, 'TAKEN');
    const byId = (id: string) => medicationStore.getAllDoses().find((d) => d.id === id)!;
    expect(byId(first.id).status).toBe('TAKEN');
    expect(byId(second.id).status).toBe('PENDING');

    await medicationStore.recordAction(second.id, 'SNOOZED');
    expect(byId(second.id).status).toBe('SNOOZED');
  });

  it('generateUpcomingDoses never emits TAKEN or past occurrences', () => {
    const todayStr = toLocalDateString(new Date());
    const doses = generateUpcomingDoses([newMed]);
    expect(doses.every((d) => d.status === 'PENDING')).toBe(true);
    expect(doses.every((d) => d.scheduledTime.slice(0, 10) >= todayStr)).toBe(true);
  });
});

describe('isFabricatedBackfillDose (stored-data cleanup)', () => {
  const base: DoseLog = {
    id: 'dose-med-1-2026-10-01-0800',
    medicationId: 'med-1',
    patientProfileId: 'pat-1',
    scheduledTime: '2026-10-01T08:00:00',
    status: 'TAKEN',
    actionTime: '2026-10-01T08:05:00',
    createdAt: '2026-10-19T00:00:00.000Z',
    updatedAt: '2026-10-19T00:00:00.000Z',
  };
  const now = new Date(2026, 9, 19, 12, 0, 0);

  it('matches the old backfill signature on a past day', () => {
    expect(isFabricatedBackfillDose(base, now)).toBe(true);
  });

  it('keeps a user-recorded TAKEN (ISO timestamp with ms and Z)', () => {
    expect(
      isFabricatedBackfillDose({ ...base, actionTime: '2026-10-01T08:12:31.456Z' }, now)
    ).toBe(false);
  });

  it('keeps SKIPPED, today and future records', () => {
    expect(isFabricatedBackfillDose({ ...base, status: 'SKIPPED' }, now)).toBe(false);
    expect(
      isFabricatedBackfillDose(
        { ...base, scheduledTime: '2026-10-19T08:00:00', actionTime: '2026-10-19T08:05:00' },
        now
      )
    ).toBe(false);
  });
});
