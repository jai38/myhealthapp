// S06 Undo after Mark as Taken (04b task 13): a regression test for the dose rules. Undo puts a
// dose back to PENDING, never Missed; a failed server save leaves the recorded state as it was.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

import { medicationStore } from '../services/medications/medication-store';
import { medicationService } from '../services/medications/medication-service';
import type { DoseLog, MedicationRecord } from '../services/medications/medication-service';
import { authService } from '../services/auth/auth-service';

const med = (over: Partial<MedicationRecord> = {}): MedicationRecord => ({
  id: 'med-undo-1',
  patientProfileId: 'p1',
  nameAsWritten: 'Testmed A 500 mg',
  normalizedMedicineName: null,
  strength: '500 mg',
  dosageForm: 'Oral Tablet',
  route: 'Oral',
  prescribedInstructions: null,
  status: 'ACTIVE',
  startDate: null,
  endDate: null,
  reminderTimes: ['08:00'],
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  ...over,
});

const saved = (over: Partial<DoseLog> = {}): DoseLog => ({
  id: 'x',
  medicationId: 'med-undo-1',
  patientProfileId: 'p1',
  scheduledTime: '2026-11-06T08:00:00',
  status: 'PENDING',
  actionTime: null,
  snoozeMinutes: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  ...over,
});

describe('medicationStore.undoAction (S06 Undo)', () => {
  beforeEach(async () => {
    await medicationStore.clearUserStorage();
    await medicationStore.addMedication(med());
  });
  afterEach(() => vi.restoreAllMocks());

  it('puts a Taken dose back to PENDING with no taken time, and asks the server for PENDING', async () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(medicationService, 'recordDoseAction').mockResolvedValue(saved({ status: 'TAKEN' }));
    const correct = vi.spyOn(medicationService, 'correctDoseAction').mockResolvedValue(saved());
    const [first] = medicationStore.getTodayDoses();
    await medicationStore.recordAction(first.id, 'TAKEN');
    expect(medicationStore.getAllDoses().find((d) => d.id === first.id)!.status).toBe('TAKEN');

    await medicationStore.undoAction(first.id);
    const after = medicationStore.getAllDoses().find((d) => d.id === first.id)!;
    expect(after.status).toBe('PENDING');
    expect(after.actionTime).toBeNull();
    expect(correct).toHaveBeenCalledWith(first.id, { action: 'PENDING' });
  });

  it('never leaves the dose Missed', async () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(false);
    const [first] = medicationStore.getTodayDoses();
    await medicationStore.recordAction(first.id, 'TAKEN');
    await medicationStore.undoAction(first.id);
    expect(medicationStore.getAllDoses().find((d) => d.id === first.id)!.status).not.toBe('MISSED');
  });

  it('restores the recorded Taken and throws when the server refuses the undo', async () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(medicationService, 'recordDoseAction').mockResolvedValue(saved({ status: 'TAKEN' }));
    vi.spyOn(medicationService, 'correctDoseAction').mockRejectedValue(new Error('network'));
    const [first] = medicationStore.getTodayDoses();
    await medicationStore.recordAction(first.id, 'TAKEN');
    const taken = medicationStore.getAllDoses().find((d) => d.id === first.id)!;

    await expect(medicationStore.undoAction(first.id)).rejects.toThrow();
    const after = medicationStore.getAllDoses().find((d) => d.id === first.id)!;
    expect(after.status).toBe('TAKEN');
    expect(after.actionTime).toBe(taken.actionTime);
  });

  it('signed out, the undo stays on the phone', async () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(false);
    const correct = vi.spyOn(medicationService, 'correctDoseAction');
    const [first] = medicationStore.getTodayDoses();
    await medicationStore.recordAction(first.id, 'TAKEN');
    await medicationStore.undoAction(first.id);
    expect(correct).not.toHaveBeenCalled();
  });

  it('refuses an unknown dose', async () => {
    await expect(medicationStore.undoAction('nope')).rejects.toThrow(/not found/);
  });
});
