// Rule 15: adherence is computed from recorded doses only. Unrecorded doses are never missed.
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

import { medicationStore } from '../services/medications/medication-store';
import { adherenceDotStatus } from '../features/records/adherenceDots';
import type { MedicationRecord, DoseLog } from '../services/medications/medication-service';

const med: MedicationRecord = {
  id: 'med-adh-1',
  patientProfileId: 'pat-1',
  nameAsWritten: 'Tab Synthetic 5mg',
  normalizedMedicineName: 'Synthetic',
  strength: '5 mg',
  dosageForm: 'TABLET',
  route: 'ORAL',
  prescribedInstructions: 'Four times daily',
  status: 'ACTIVE',
  startDate: '2026-01-01T00:00:00.000Z',
  reminderTimes: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const dose = (hhmm: string, status: DoseLog['status']): DoseLog => ({
  id: `d-${hhmm}-${status}`,
  medicationId: med.id,
  patientProfileId: 'pat-1',
  scheduledTime: `2026-10-10T${hhmm}:00`,
  status,
  actionTime: status === 'TAKEN' ? `2026-10-10T${hhmm}:05:00` : undefined,
  createdAt: '2026-10-09T00:00:00.000Z',
  updatedAt: '2026-10-09T00:00:00.000Z',
});

const at = (hhmm: string) => new Date(`2026-10-10T${hhmm}:00`).getTime();

describe('getAdherenceForDate', () => {
  beforeEach(async () => {
    await medicationStore.switchUser(null);
    await medicationStore.clearUserStorage();
  });

  it('does not count unrecorded or future doses as misses', async () => {
    await medicationStore.syncFromServer(
      [med],
      [dose('08:00', 'TAKEN'), dose('12:00', 'PENDING'), dose('18:00', 'PENDING'), dose('22:00', 'PENDING')],
    );
    // 19:30: 12:00 is past its window (Not confirmed); 18:00 is still Due now (2 hours, ST-01);
    // 22:00 is upcoming. None counts as missed.
    const a = medicationStore.getAdherenceForDate('2026-10-10', at('19:30'));
    expect(a).toMatchObject({ taken: 1, skipped: 0, notConfirmed: 1, upcoming: 2, total: 4, percentage: 100 });
    const later = medicationStore.getAdherenceForDate('2026-10-10', at('20:01'));
    expect(later).toMatchObject({ notConfirmed: 2, upcoming: 1, percentage: 100 });
  });

  it('percentage covers recorded doses only (taken, skipped, user-marked missed)', async () => {
    await medicationStore.syncFromServer(
      [med],
      [dose('08:00', 'TAKEN'), dose('12:00', 'SKIPPED'), dose('18:00', 'MISSED' as DoseLog['status']), dose('22:00', 'PENDING')],
    );
    const a = medicationStore.getAdherenceForDate('2026-10-10', at('21:00'));
    expect(a).toMatchObject({ taken: 1, skipped: 1, missed: 1, upcoming: 1, notConfirmed: 0, percentage: 33 });
  });

  it('returns a null percentage when nothing is recorded', async () => {
    await medicationStore.syncFromServer([med], [dose('08:00', 'PENDING'), dose('20:00', 'PENDING')]);
    const a = medicationStore.getAdherenceForDate('2026-10-10', at('23:00'));
    expect(a.percentage).toBeNull();
    expect(a).toMatchObject({ taken: 0, notConfirmed: 2, total: 2 });
  });

  it('a dose inside its 2-hour due window is upcoming, not not-confirmed (ST-01)', async () => {
    await medicationStore.syncFromServer([med], [dose('08:00', 'PENDING')]);
    expect(medicationStore.getAdherenceForDate('2026-10-10', at('09:59'))).toMatchObject({ upcoming: 1, notConfirmed: 0 });
    expect(medicationStore.getAdherenceForDate('2026-10-10', at('10:01'))).toMatchObject({ upcoming: 0, notConfirmed: 1 });
  });

  it("the window ends at the same medicine's next dose (ST-01)", async () => {
    await medicationStore.syncFromServer([med], [dose('08:00', 'PENDING'), dose('09:00', 'PENDING')]);
    expect(medicationStore.getAdherenceForDate('2026-10-10', at('09:01'))).toMatchObject({ upcoming: 1, notConfirmed: 1 });
  });

  it('leaves out doses of paused medicines', async () => {
    await medicationStore.syncFromServer([{ ...med, status: 'INACTIVE' }], [dose('08:00', 'PENDING')]);
    expect(medicationStore.getAdherenceForDate('2026-10-10', at('23:00')).total).toBe(0);
  });
});

describe('adherenceDotStatus', () => {
  const c = (taken: number, upcoming: number, total: number, skipped = 0, missed = 0) => ({
    taken,
    skipped,
    missed,
    upcoming,
    total,
  });
  it('a day with no doses is none', () => {
    expect(adherenceDotStatus(c(0, 0, 0))).toBe('none');
  });
  it('a day where every dose is Not confirmed is neutral no-data, not caution', () => {
    expect(adherenceDotStatus(c(0, 0, 2))).toBe('none');
  });
  it('one taken plus one Not confirmed is not caution: an unrecorded dose never colours the dot', () => {
    expect(adherenceDotStatus(c(1, 0, 2))).not.toBe('partial');
    expect(adherenceDotStatus(c(1, 0, 2))).toBe('pending');
  });
  it('all taken is complete; taken plus a recorded skip is partial; still-upcoming stays neutral', () => {
    expect(adherenceDotStatus(c(2, 0, 2))).toBe('complete');
    expect(adherenceDotStatus(c(1, 0, 2, 1))).toBe('partial');
    expect(adherenceDotStatus(c(1, 1, 3, 1))).toBe('pending');
  });
});
