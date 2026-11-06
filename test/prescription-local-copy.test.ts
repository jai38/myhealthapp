// CLAUDE.md rules 12 and 13: the phone-side copy of a confirmed medicine never guesses.
import { describe, it, expect } from 'vitest';
import { buildMedicationRecord } from '../features/today/utils';
import { confirmPrescriptionDraft, matchServerMedicine } from '../features/today/prescription-confirmation';

const bare = { name_as_written: 'Tab Synthetic 5mg' };

describe('buildMedicationRecord', () => {
  it('does not guess a reminder time: no prescription times means no reminders', () => {
    const r = buildMedicationRecord(bare, {}, 'pat-1');
    expect(r.reminderTimes).toEqual([]);
    expect(r.reminderTimes).not.toContain('08:00');
  });

  it('keeps nameAsWritten apart: normalizedMedicineName stays empty until the server gives one', () => {
    const r = buildMedicationRecord(bare, {}, 'pat-1');
    expect(r.nameAsWritten).toBe('Tab Synthetic 5mg');
    expect(r.normalizedMedicineName).toBeNull();
    const withServer = buildMedicationRecord(bare, {}, 'pat-1', { normalizedMedicineName: 'Synthetic' });
    expect(withServer.normalizedMedicineName).toBe('Synthetic');
  });

  it('leaves missing form, route, instructions and start date empty', () => {
    const r = buildMedicationRecord(bare, {}, undefined);
    expect(r.dosageForm).toBe('');
    expect(r.route).toBe('');
    expect(r.prescribedInstructions).toBeNull();
    expect(r.startDate).toBeNull();
    expect(r.patientProfileId).toBe('');
  });

  it('uses prescription times when valid and drops invalid ones; server values win', () => {
    const r = buildMedicationRecord({ ...bare, reminder_times: ['07:30', 'bad', '25:00'] }, {}, 'p');
    expect(r.reminderTimes).toEqual(['07:30']);
    const s = buildMedicationRecord(bare, {}, 'p', { id: 'srv-1', dosageForm: 'DROPS', route: 'OPHTHALMIC' });
    expect(s).toMatchObject({ id: 'srv-1', dosageForm: 'DROPS', route: 'OPHTHALMIC' });
  });
});

describe('confirmed medicines use the server record (finding 3)', () => {
  const srv = (over: Record<string, unknown>) =>
    ({
      id: 'srv-1',
      patientProfileId: 'pat-1',
      nameAsWritten: 'Tab Synthetic 5mg',
      normalizedMedicineName: 'Synthetic',
      strength: '5 mg',
      dosageForm: 'TABLET',
      route: 'ORAL',
      prescribedInstructions: 'After food',
      status: 'ACTIVE',
      startDate: '2026-11-01',
      reminderTimes: ['09:00'],
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
      ...over,
    }) as any;

  it('passes the fetched server medicine to the phone copy, so no field is empty', async () => {
    const added: any[] = [];
    await confirmPrescriptionDraft({
      payload: { medicines: [{ is_active_medication: true, name_as_written: 'Tab Synthetic 5mg' } as any] },
      confirmOnServer: async () => ({}),
      fetchServerMedicines: async () => [srv({})],
      addActiveMedicine: async (m, serverMedicine) => {
        added.push(buildMedicationRecord(m, {}, 'pat-1', serverMedicine));
      },
    });
    expect(added[0]).toMatchObject({ id: 'srv-1', dosageForm: 'TABLET', route: 'ORAL', reminderTimes: ['09:00'] });
  });

  it('uses each server medicine once, and a failed fetch leaves the copy sparse', async () => {
    const used = new Set<string>();
    const meds = [srv({})];
    expect(matchServerMedicine({ name_as_written: 'Tab Synthetic 5mg' }, meds, used)?.id).toBe('srv-1');
    expect(matchServerMedicine({ name_as_written: 'Tab Synthetic 5mg' }, meds, used)).toBeNull();

    const added: any[] = [];
    await confirmPrescriptionDraft({
      payload: { medicines: [{ is_active_medication: true, name_as_written: 'Tab Synthetic 5mg' } as any] },
      confirmOnServer: async () => ({}),
      fetchServerMedicines: async () => {
        throw new Error('offline');
      },
      addActiveMedicine: async (m, serverMedicine) => {
        added.push(buildMedicationRecord(m, {}, 'pat-1', serverMedicine));
      },
    });
    expect(added[0].dosageForm).toBe('');
    expect(added[0].reminderTimes).toEqual([]);
  });
});
