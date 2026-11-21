// Pure model for S07, the Dose update sheet (04b task 14; designes/design/screens.md).
// No React, no clock reads: `nowMs` is always a parameter.
//
// Clinical rules (CLAUDE.md 13-15, decision D5):
// - The sheet opens only for a dose that is waiting for an answer and not in the future
//   (canRecordDoseNow): never for paused, stopped, future or already-recorded doses.
// - Missed comes only from the patient choosing "No, I missed it". Nothing here infers it.
// - "Other time" is never later than now. "As scheduled" is the scheduled time.
// - It only updates the log; it never changes the schedule or reminders.
import type { StringKey } from '../../design/strings';
import type { DoseLog, MedicationRecord, SkipReason } from '../../services/medications/medication-service';
import { canRecordDoseNow } from '../medications/dose-display';

export type DoseChoice = 'took' | 'skipped' | 'missed';
export type TakenWhen = 'scheduled' | 'now' | 'other';

export interface DoseUpdateDraft {
  choice: DoseChoice | null;
  when: TakenWhen;
  /** Chosen with the wheel when `when` is 'other'. */
  otherTime: Date | null;
  reason: SkipReason | null;
}

export const EMPTY_DRAFT: DoseUpdateDraft = { choice: null, when: 'scheduled', otherTime: null, reason: null };

export const SKIP_REASONS: { value: SkipReason; labelKey: StringKey }[] = [
  { value: 'FELT_UNWELL', labelKey: 'doseUpdate.reason.feltUnwell' },
  { value: 'DOCTOR_ADVISED', labelKey: 'doseUpdate.reason.doctorAdvised' },
  { value: 'RAN_OUT', labelKey: 'doseUpdate.reason.ranOut' },
  { value: 'SIDE_EFFECTS', labelKey: 'doseUpdate.reason.sideEffects' },
  { value: 'OTHER', labelKey: 'doseUpdate.reason.other' },
];

/** Whether S07 may open for this dose: Due now or Not confirmed, never future, paused or stopped. */
export function canOpenDoseUpdate(
  dose: Pick<DoseLog, 'status' | 'scheduledTime'>,
  med: Pick<MedicationRecord, 'status'> | null | undefined,
  nowMs: number,
): boolean {
  return canRecordDoseNow(dose, med, nowMs);
}

/** Save stays off until there is a complete choice. */
export function canSave(draft: DoseUpdateDraft): boolean {
  if (draft.choice === null) return false;
  if (draft.choice === 'took' && draft.when === 'other') return draft.otherTime !== null;
  return true;
}

export type DoseUpdateRequest =
  | { action: 'TAKEN'; actionTime: string }
  | { action: 'SKIPPED'; skipReason?: SkipReason }
  | { action: 'MISSED' };

/** The latest time the wheel may offer: now, or the scheduled day's end if that is earlier. */
export function latestTakenTime(scheduledMs: number, nowMs: number): Date {
  const endOfDay = new Date(scheduledMs);
  endOfDay.setHours(23, 59, 0, 0);
  return new Date(Math.min(nowMs, endOfDay.getTime()));
}

/**
 * The call S07 makes on Save, or null when Save should be off. A taken time is never later
 * than now: "as scheduled" for a dose whose time hasn't come is refused by canOpenDoseUpdate,
 * and is also clamped here.
 */
export function buildDoseUpdate(
  draft: DoseUpdateDraft,
  scheduledTime: string,
  nowMs: number,
): DoseUpdateRequest | null {
  if (!canSave(draft)) return null;
  switch (draft.choice) {
    case 'took': {
      const scheduledMs = new Date(scheduledTime).getTime();
      const chosenMs =
        draft.when === 'now'
          ? nowMs
          : draft.when === 'scheduled'
            ? scheduledMs
            : (draft.otherTime as Date).getTime();
      if (Number.isNaN(chosenMs)) return null;
      return { action: 'TAKEN', actionTime: new Date(Math.min(chosenMs, nowMs)).toISOString() };
    }
    case 'skipped':
      return draft.reason ? { action: 'SKIPPED', skipReason: draft.reason } : { action: 'SKIPPED' };
    case 'missed':
      return { action: 'MISSED' };
    default:
      return null;
  }
}
