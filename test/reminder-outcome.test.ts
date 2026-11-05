// Never tell the patient reminders are active unless they were actually scheduled.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  scheduleMedicationReminders,
  setNotificationsModuleForTesting,
} from '../services/notifications/notification-service';
import { reminderOutcome, reminderFailureMessageKey } from '../features/medications/reminderOutcome';
import { t } from '../design/strings';

const mod = (over: Record<string, unknown> = {}) => ({
  AndroidImportance: { MAX: 5 },
  AndroidNotificationPriority: { MAX: 'max', HIGH: 'high' },
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  getPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
  setNotificationChannelAsync: vi.fn().mockResolvedValue(undefined),
  setNotificationHandler: vi.fn(),
  cancelScheduledNotificationAsync: vi.fn().mockResolvedValue(undefined),
  scheduleNotificationAsync: vi.fn().mockResolvedValue('notif-id'),
  ...over,
});

describe('scheduleMedicationReminders', () => {
  beforeEach(() => setNotificationsModuleForTesting(null));

  it('reports all scheduled when every time gets a notification id', async () => {
    setNotificationsModuleForTesting(mod());
    const r = await scheduleMedicationReminders('m1', 'Synthetic', ['08:00', '20:00']);
    expect(r).toEqual({ scheduled: 2, total: 2, permissionDenied: false });
    expect(reminderOutcome(r)).toBe('allSet');
  });

  it('reports permission denied and schedules nothing', async () => {
    const schedule = vi.fn().mockResolvedValue('notif-id');
    setNotificationsModuleForTesting(
      mod({
        getPermissionsAsync: vi.fn().mockResolvedValue({ status: 'denied' }),
        requestPermissionsAsync: vi.fn().mockResolvedValue({ status: 'denied' }),
        scheduleNotificationAsync: schedule,
      }),
    );
    const r = await scheduleMedicationReminders('m1', 'Synthetic', ['08:00']);
    expect(r).toEqual({ scheduled: 0, total: 1, permissionDenied: true });
    expect(schedule).not.toHaveBeenCalled();
    expect(reminderOutcome(r)).toBe('permissionDenied');
    expect(t(reminderFailureMessageKey(r))).toMatch(/notifications are off/i);
  });

  it('reports not set when scheduling throws', async () => {
    setNotificationsModuleForTesting(
      mod({ scheduleNotificationAsync: vi.fn().mockRejectedValue(new Error('boom')) }),
    );
    const r = await scheduleMedicationReminders('m1', 'Synthetic', ['08:00', '20:00']);
    expect(r).toEqual({ scheduled: 0, total: 2, permissionDenied: false });
    expect(reminderOutcome(r)).toBe('notSet');
  });

  it('reports not set when the native module is unavailable (no id created)', async () => {
    const r = await scheduleMedicationReminders('m1', 'Synthetic', ['08:00']);
    expect(r.scheduled).toBe(0);
    expect(reminderOutcome(r)).not.toBe('allSet');
  });

  it('a partial failure is not allSet', async () => {
    const schedule = vi
      .fn()
      .mockResolvedValueOnce('a') // adv, 08:00
      .mockResolvedValueOnce('b') // due, 08:00
      .mockResolvedValueOnce('c') // adv, 20:00
      .mockRejectedValueOnce(new Error('boom')); // due, 20:00
    setNotificationsModuleForTesting(mod({ scheduleNotificationAsync: schedule }));
    const r = await scheduleMedicationReminders('m1', 'Synthetic', ['08:00', '20:00']);
    expect(r).toMatchObject({ scheduled: 1, total: 2 });
    expect(reminderOutcome(r)).toBe('notSet');
  });
});

describe('reminder wiring guard', () => {
  it('no screen fires scheduling and forgets the result', async () => {
    const { readFileSync } = await import('node:fs');
    for (const f of [
      'features/medications/ManualAddMedicationModal.tsx',
      'features/medications/detail/useMedicationDetail.ts',
    ]) {
      const src = readFileSync(f, 'utf8');
      expect(src, f).not.toMatch(/scheduleMedicationReminder\([^;]*\)\.catch\(\(\) => \{\}\)/s);
      expect(src, f).toMatch(/reminderOutcome|reminderFailureMessageKey/);
    }
  });
});
