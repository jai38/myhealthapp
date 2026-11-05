import type { MedicationRecord } from './medication-service';

export interface ReminderSyncMedication {
  id: string;
  name: string;
  isActive: boolean;
  reminderTimes: string[];
  instructions?: string;
  endDate?: string | null;
}

/** Same end-of-day rule the notification service applies to a course end date. */
function hasCourseEnded(endDate: string | null | undefined, nowMs: number): boolean {
  if (!endDate) return false;
  const end = new Date(`${endDate}T23:59:59`).getTime();
  return !isNaN(end) && end < nowMs;
}

/**
 * Single source of truth for which medicines get device reminders. Used by both Home and Medicines.
 * Only ACTIVE medicines with an unfinished course are included; historical, paused, stopped and
 * completed medicines never create reminders. Building this payload never touches dose status.
 */
export function buildReminderSyncPayload(
  medications: ReadonlyArray<
    Pick<
      MedicationRecord,
      'id' | 'nameAsWritten' | 'status' | 'reminderTimes' | 'prescribedInstructions' | 'endDate'
    >
  >,
  nowMs: number = Date.now()
): ReminderSyncMedication[] {
  return medications
    .filter((m) => m.status === 'ACTIVE' && !hasCourseEnded(m.endDate, nowMs))
    .map((m) => ({
      id: m.id,
      name: m.nameAsWritten,
      isActive: true,
      reminderTimes: m.reminderTimes || [],
      instructions: m.prescribedInstructions || undefined,
      endDate: m.endDate || null,
    }));
}
