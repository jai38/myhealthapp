// Pure helpers for the Today screen. No React, no clock reads. The S06 layout is todayView.ts.
import type { MedicineForm } from '../../design/components/Foundations/iconNames';
import type { MedicationRecord } from '../../services/medications/medication-service';

/** Local time for dose rows and the hero, e.g. "8:00 AM". */
export function formatTodayTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Active medicines with no reminder times, or whose instructions say "as needed" or "SOS".
 * These are taken on demand, so they never show as a due dose.
 */
export function asNeededMedications(meds: MedicationRecord[]): MedicationRecord[] {
  return meds.filter(
    (m) =>
      m.status === 'ACTIVE' &&
      (!m.reminderTimes ||
        m.reminderTimes.length === 0 ||
        m.prescribedInstructions?.toLowerCase().includes('as needed') ||
        m.prescribedInstructions?.toLowerCase().includes('sos')),
  );
}

/** Icon shape for a medicine, from its recorded dosage form. Unknown forms get "other". */
export function medicineFormFor(dosageForm: string | null | undefined): MedicineForm {
  const f = (dosageForm ?? '').toLowerCase();
  if (f.includes('syrup') || f.includes('liquid') || f.includes('suspension')) return 'liquid';
  if (f.includes('drop')) return 'drops';
  if (f.includes('inject')) return 'injection';
  if (f.includes('inhal')) return 'inhaler';
  if (f.includes('cream') || f.includes('ointment') || f.includes('gel') || f.includes('lotion')) {
    return 'topical';
  }
  if (f.includes('capsule')) return 'capsule';
  if (f.includes('tablet')) return 'tablet';
  return 'other';
}
