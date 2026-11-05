import type { StringKey } from '../../design/strings';
import type { ReminderScheduleResult } from '../../services/notifications/notification-service';

export type ReminderOutcome = 'allSet' | 'permissionDenied' | 'notSet';

/** Only `allSet` may be shown to the patient as "reminders are active". */
export function reminderOutcome(result: ReminderScheduleResult): ReminderOutcome {
  if (result.permissionDenied) return 'permissionDenied';
  if (result.total > 0 && result.scheduled === result.total) return 'allSet';
  return 'notSet';
}

/** Message shown when the medicine saved but reminders were not fully scheduled. */
export function reminderFailureMessageKey(result: ReminderScheduleResult): StringKey {
  return reminderOutcome(result) === 'permissionDenied'
    ? 'medicines.reminders.permissionOff'
    : 'medicines.reminders.notSet';
}
