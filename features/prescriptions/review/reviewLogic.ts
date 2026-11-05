import { DEFAULT_REMINDER_TIME } from './reviewTypes';
import type { EditableMedicine } from './reviewTypes';

// Pure review helpers. No React or React Native imports, so they can be tested directly.

/**
 * Validates a typed reminder time. Accepts 24-hour `HH:mm`, and `H:mm` (one-digit hour)
 * which is unambiguous and normalised to `HH:mm`. A one-digit minute such as "8:5" is
 * rejected: it could mean 8:05 or 8:50, and a reminder time is never guessed.
 */
export function parseReminderTime(input: string | null | undefined): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec((input ?? '').trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, '0')}:${m[2]}`;
}

/** Normalises each time and drops the ones that are not valid times. */
export function sanitizeReminderTimes(times: string[]): string[] {
  const out: string[] = [];
  for (const raw of times) {
    const valid = parseReminderTime(raw);
    if (valid && !out.includes(valid)) out.push(valid);
  }
  return out;
}

export function isAsNeededFrequency(frequencyText: string | undefined): boolean {
  return (
    frequencyText === 'As Needed' ||
    (frequencyText?.toLowerCase().includes('needed') ?? false) ||
    (frequencyText?.toLowerCase().includes('prn') ?? false) ||
    (frequencyText?.toLowerCase().includes('sos') ?? false)
  );
}

export function defaultMedicine(): EditableMedicine {
  return {
    id: 'med-1',
    name_as_written: '',
    normalized_medicine_name: '',
    strength: '',
    dosage_form: 'TABLET',
    frequency_text: '1x Daily',
    duration_text: '7 Days',
    route: 'ORAL',
    instructions: '',
    confidence: 'HIGH',
    is_active_medication: true,
    times_per_day: 1,
    reminder_times: [DEFAULT_REMINDER_TIME],
    total_count: '',
  };
}

// Maps the extraction's medicines into editable rows. Free-text frequency is
// normalized to a preset label where it is recognized; anything else is kept as written.
export function buildInitialMedicines(rawMedicines: unknown): EditableMedicine[] {
  const rawMeds: any[] = Array.isArray(rawMedicines) ? rawMedicines : [];
  if (rawMeds.length === 0) {
    return [defaultMedicine()];
  }
  return rawMeds.map((m: any, idx: number) => {
    let defaultTimes = [DEFAULT_REMINDER_TIME];
    const freq = (m?.frequency_text || '').toLowerCase();
    let normalizedFrequency = m?.frequency_text || '1x Daily';

    if (freq.includes('as needed') || freq.includes('prn') || freq.includes('sos') || freq.includes('needed')) {
      defaultTimes = [];
      normalizedFrequency = 'As Needed';
    } else if (freq.includes('bd') || freq.includes('twice') || freq.includes('2x') || freq.includes('1-0-1')) {
      defaultTimes = ['08:00', '20:00'];
      normalizedFrequency = '2x Daily';
    } else if (freq.includes('tds') || freq.includes('thrice') || freq.includes('3x') || freq.includes('1-1-1')) {
      defaultTimes = ['08:00', '13:00', '20:00'];
      normalizedFrequency = '3x Daily';
    } else if (freq.includes('qid') || freq.includes('4x')) {
      defaultTimes = ['08:00', '12:00', '16:00', '20:00'];
      normalizedFrequency = '4x Daily';
    } else if (freq.includes('od') || freq.includes('once') || freq.includes('1x')) {
      defaultTimes = [DEFAULT_REMINDER_TIME];
      normalizedFrequency = '1x Daily';
    }

    const isAsNeeded = normalizedFrequency === 'As Needed';
    const initialReminderTimes = isAsNeeded
      ? []
      : Array.isArray(m?.reminder_times) && m.reminder_times.length > 0
      ? m.reminder_times
      : defaultTimes;

    return {
      id: m?.id || `med-${idx + 1}`,
      name_as_written: m?.name_as_written || '',
      normalized_medicine_name: m?.normalized_medicine_name || '',
      strength: m?.strength || '',
      dosage_form: m?.dosage_form || 'TABLET',
      frequency_text: normalizedFrequency,
      duration_text: m?.duration_text || '7 Days',
      route: m?.route || 'ORAL',
      instructions: m?.instructions || '',
      confidence: m?.confidence || 'HIGH',
      is_active_medication: Boolean(m?.is_active_medication),
      times_per_day: initialReminderTimes.length,
      reminder_times: initialReminderTimes,
      total_count: m?.total_count || '',
    };
  });
}

// Converts DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD. Other text is passed through.
export function normalizePrescriptionDate(input: string): string {
  const dmy = input.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }
  return input;
}

export interface ReviewPayloadInput {
  documentId: string;
  prescriptionDate: string;
  dateIsUncertain: boolean;
  doctorName: string;
  clinicName: string;
  diagnosis: string;
  medicines: EditableMedicine[];
}

export function buildReviewPayload(input: ReviewPayloadInput): any {
  let cleanDate: string | undefined = input.prescriptionDate.trim() || undefined;
  if (cleanDate) {
    cleanDate = normalizePrescriptionDate(cleanDate);
  }

  return {
    documentId: input.documentId,
    prescription_date: cleanDate,
    date_is_uncertain: input.dateIsUncertain || !cleanDate,
    doctor_name: input.doctorName.trim() || undefined,
    clinic_hospital_name: input.clinicName.trim() || undefined,
    documented_diagnosis: input.diagnosis.trim() || undefined,
    medicines: input.medicines.map((m) => {
      const isAsNeeded = isAsNeededFrequency(m.frequency_text);

      return {
        name_as_written: m.name_as_written.trim(),
        normalized_medicine_name: m.normalized_medicine_name?.trim() || undefined,
        strength: m.strength?.trim() || undefined,
        dosage_form: m.dosage_form,
        frequency_text: m.frequency_text?.trim() || undefined,
        duration_text: m.duration_text?.trim() || undefined,
        route: m.route,
        instructions: m.instructions?.trim() || undefined,
        is_active_medication: m.is_active_medication,
        reminder_times: isAsNeeded
          ? []
          : sanitizeReminderTimes(m.reminder_times ?? []).length > 0
          ? sanitizeReminderTimes(m.reminder_times ?? [])
          : m.is_active_medication
          ? [DEFAULT_REMINDER_TIME]
          : undefined,
        total_count: m.total_count?.trim() || undefined,
      };
    }),
  };
}
