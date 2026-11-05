import { describe, it, expect } from 'vitest';
import {
  buildInitialMedicines,
  buildReviewPayload,
  isAsNeededFrequency,
  normalizePrescriptionDate,
  parseReminderTime,
  sanitizeReminderTimes,
} from '../features/prescriptions/review/reviewLogic';
import type { EditableMedicine } from '../features/prescriptions/review/reviewTypes';

function draft(overrides: Partial<EditableMedicine>): EditableMedicine {
  return {
    id: 'med-test',
    name_as_written: 'Augmentin 625',
    normalized_medicine_name: 'Amoxicillin and Clavulanate',
    strength: '625 mg',
    dosage_form: 'TABLET',
    frequency_text: '2x Daily',
    duration_text: '5 Days',
    route: 'ORAL',
    instructions: '',
    confidence: 'HIGH',
    is_active_medication: true,
    times_per_day: 2,
    reminder_times: ['08:00', '20:00'],
    total_count: '',
    ...overrides,
  };
}

describe('review: as-needed detection', () => {
  it('treats the as-needed preset and PRN or SOS wording as as-needed', () => {
    expect(isAsNeededFrequency('As Needed')).toBe(true);
    expect(isAsNeededFrequency('PRN')).toBe(true);
    expect(isAsNeededFrequency('SOS for fever')).toBe(true);
  });

  it('does not treat scheduled frequencies or a missing value as as-needed', () => {
    expect(isAsNeededFrequency('2x Daily')).toBe(false);
    expect(isAsNeededFrequency('')).toBe(false);
    expect(isAsNeededFrequency(undefined)).toBe(false);
  });
});

describe('review: prescription date input', () => {
  it('converts day-first dates to ISO order', () => {
    expect(normalizePrescriptionDate('5/3/2026')).toBe('2026-03-05');
    expect(normalizePrescriptionDate('12-10-2026')).toBe('2026-10-12');
  });

  it('passes other text through unchanged', () => {
    expect(normalizePrescriptionDate('2026-10-12')).toBe('2026-10-12');
    expect(normalizePrescriptionDate('October 2026')).toBe('October 2026');
  });
});

describe('review: initial medicine rows', () => {
  it('starts with one blank-named draft when the extraction has no medicines', () => {
    const rows = buildInitialMedicines(undefined);
    expect(rows).toHaveLength(1);
    expect(rows[0].name_as_written).toBe('');
    expect(rows[0].reminder_times).toEqual(['08:00']);
  });

  it('keeps name as written separate from the normalized name', () => {
    const [row] = buildInitialMedicines([
      { name_as_written: 'AUGMENTIN 625', normalized_medicine_name: 'Amoxicillin', frequency_text: 'bd' },
    ]);
    expect(row.name_as_written).toBe('AUGMENTIN 625');
    expect(row.normalized_medicine_name).toBe('Amoxicillin');
    expect(row.frequency_text).toBe('2x Daily');
    expect(row.reminder_times).toEqual(['08:00', '20:00']);
  });

  it('keeps an extracted medicine uncertain and historical unless the patient changes it', () => {
    const [row] = buildInitialMedicines([{ name_as_written: 'Old drug', confidence: 'UNCERTAIN' }]);
    expect(row.confidence).toBe('UNCERTAIN');
    expect(row.is_active_medication).toBe(false);
  });
});

describe('review: confirm payload', () => {
  const base = {
    documentId: 'doc-1',
    prescriptionDate: '',
    dateIsUncertain: false,
    doctorName: '  Dr. A. Verma  ',
    clinicName: '',
    diagnosis: '',
  };

  it('marks the date uncertain when none is entered', () => {
    const payload = buildReviewPayload({ ...base, medicines: [draft({})] });
    expect(payload.prescription_date).toBeUndefined();
    expect(payload.date_is_uncertain).toBe(true);
    expect(payload.doctor_name).toBe('Dr. A. Verma');
    expect(payload.clinic_hospital_name).toBeUndefined();
  });

  it('sends an as-needed medicine with no reminder times', () => {
    const payload = buildReviewPayload({
      ...base,
      prescriptionDate: '1/11/2026',
      medicines: [draft({ frequency_text: 'As Needed', reminder_times: ['08:00'] })],
    });
    expect(payload.prescription_date).toBe('2026-11-01');
    expect(payload.date_is_uncertain).toBe(false);
    expect(payload.medicines[0].reminder_times).toEqual([]);
  });

  it('defaults an active medicine with no times to 08:00 and leaves a historical one without reminders', () => {
    const payload = buildReviewPayload({
      ...base,
      medicines: [
        draft({ reminder_times: [] }),
        draft({ id: 'med-2', is_active_medication: false, reminder_times: [] }),
      ],
    });
    expect(payload.medicines[0].reminder_times).toEqual(['08:00']);
    expect(payload.medicines[1].reminder_times).toBeUndefined();
  });

  it('trims the name as written and keeps the normalized name separate', () => {
    const payload = buildReviewPayload({
      ...base,
      medicines: [draft({ name_as_written: '  Augmentin 625 ', normalized_medicine_name: ' Amoxicillin ' })],
    });
    expect(payload.medicines[0].name_as_written).toBe('Augmentin 625');
    expect(payload.medicines[0].normalized_medicine_name).toBe('Amoxicillin');
  });
});

describe('reminder time validation', () => {
  it.each([
    ['08:00', '08:00'],
    ['23:59', '23:59'],
    ['00:00', '00:00'],
    ['8:30', '08:30'],
    [' 20:15 ', '20:15'],
  ])('accepts %j as %j', (input, expected) => {
    expect(parseReminderTime(input)).toBe(expected);
  });

  it.each(['25:99', '24:00', '12:60', '8:5', '8:', ':30', '0800', '08.00', 'ab:cd', '', '  ', '08:30:00', '-1:30'])(
    'rejects %j',
    (input) => {
      expect(parseReminderTime(input)).toBeNull();
    },
  );

  it('rejects null and undefined', () => {
    expect(parseReminderTime(null)).toBeNull();
    expect(parseReminderTime(undefined)).toBeNull();
  });

  it('sanitizeReminderTimes normalises, drops invalid and removes duplicates', () => {
    expect(sanitizeReminderTimes(['8:30', '25:99', '08:30', '20:00'])).toEqual(['08:30', '20:00']);
  });

  it('never sends an invalid time to the server', () => {
    const payload = buildReviewPayload({
      documentId: 'doc-1',
      prescriptionDate: '2026-11-01',
      dateIsUncertain: false,
      doctorName: '',
      clinicName: '',
      diagnosis: '',
      medicines: [draft({ reminder_times: ['25:99', '9:00'] })],
    });
    expect(payload.medicines[0].reminder_times).toEqual(['09:00']);
  });

  it('a historical medicine with only invalid times gets no reminders', () => {
    const payload = buildReviewPayload({
      documentId: 'doc-1',
      prescriptionDate: '2026-11-01',
      dateIsUncertain: false,
      doctorName: '',
      clinicName: '',
      diagnosis: '',
      medicines: [draft({ is_active_medication: false, reminder_times: ['25:99'] })],
    });
    expect(payload.medicines[0].reminder_times).toBeUndefined();
  });
});
