// Display-only helpers for dose status on the Medicines screen.
// The status itself comes from the shared todayModel rules. This file only
// formats it, so an unrecorded past dose shows "Not confirmed", never Taken.
import { doseStatusDisplay, type StatusDisplay } from '../../design/status';
import type { DoseLog, MedicationRecord } from '../../services/medications/medication-service';
import { doseDisplayStateFor } from '../today/todayModel';

export function formatDoseClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Status pill content for one dose. Null for a paused or stopped medicine. */
export function doseStatusFor(
  dose: DoseLog,
  nowMs: number,
  med?: MedicationRecord | null,
): StatusDisplay | null {
  return doseStatusDisplay(doseDisplayStateFor(dose, nowMs, med), formatDoseClock);
}
