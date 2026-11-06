// Display-only helpers for dose status on the Medicines screen.
// The status itself comes from the shared todayModel rules. This file only
// formats it, so an unrecorded past dose shows "Not confirmed", never Taken.
import type { StatusDisplay } from '../../design/status';
import type { DoseLog, MedicationRecord } from '../../services/medications/medication-service';
import { doseDisplayStateFor, doseStatusDisplayFor } from '../today/todayModel';

export function formatDoseClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Status pill content for one dose. Null for a paused or stopped medicine. */
export function doseStatusFor(
  dose: DoseLog,
  nowMs: number,
  med?: MedicationRecord | null,
): StatusDisplay | null {
  return doseStatusDisplayFor(dose, doseDisplayStateFor(dose, nowMs, med), formatDoseClock);
}

/**
 * Whether Take/Skip/Snooze may be offered for a dose: it must still be awaiting an
 * answer (PENDING or SNOOZED) and its medicine must be active. Paused or stopped
 * medicines show no actions, as on Today and the Medicines list.
 */
export function canActOnDose(
  dose: Pick<DoseLog, 'status'>,
  med: Pick<MedicationRecord, 'status'> | null | undefined,
): boolean {
  if (dose.status !== 'PENDING' && dose.status !== 'SNOOZED') return false;
  return !med || med.status === 'ACTIVE';
}

/**
 * canActOnDose, and the dose is not scheduled in the future (it has not happened yet,
 * so nothing can be recorded). A dose with no valid time is not treated as future.
 * The Medicines day schedule, its pending count and the next-dose card use this one rule.
 */
export function canRecordDoseNow(
  dose: Pick<DoseLog, 'status' | 'scheduledTime'>,
  med: Pick<MedicationRecord, 'status'> | null | undefined,
  nowMs: number,
): boolean {
  if (!canActOnDose(dose, med)) return false;
  const ms = new Date(dose.scheduledTime).getTime();
  return Number.isNaN(ms) || ms <= nowMs;
}
