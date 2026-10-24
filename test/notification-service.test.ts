import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  scheduleMedicationReminder,
  cancelAllRemindersForMedication,
  cancelSnoozeRemindersForMedication,
  dismissDeliveredNotificationsForMedication,
  dismissAllDeliveredNotifications,
  syncAllMedicationReminders,
  requestNotificationPermissions,
  scheduleSnoozeReminder,
  onNotificationResponse,
  registerNotificationResponseListener,
  setNotificationsModuleForTesting,
  MEDICATION_CHANNEL_ID,
} from '../services/notifications/notification-service';

describe('Notification & Alarm Service - Fallback Mode', () => {
  beforeEach(() => {
    setNotificationsModuleForTesting(null);
  });

  it('gracefully handles missing native notification modules in non-mobile environments', async () => {
    const granted = await requestNotificationPermissions();
    expect(typeof granted).toBe('boolean');

    const result = await scheduleMedicationReminder('med-1', 'Paracetamol', '08:00', 'With water');
    expect(result).toBeNull(); // null because in test/web environment without native bridge

    await expect(cancelAllRemindersForMedication('med-1')).resolves.not.toThrow();
    await expect(
      syncAllMedicationReminders([
        {
          id: 'med-1',
          name: 'Paracetamol',
          isActive: true,
          reminderTimes: ['08:00', '20:00'],
        },
      ])
    ).resolves.not.toThrow();
  });

  it('rejects invalid time strings safely without throwing', async () => {
    expect(await scheduleMedicationReminder('med-1', 'Paracetamol', 'invalid-time')).toBeNull();
    expect(await scheduleMedicationReminder('med-1', 'Paracetamol', '25:00')).toBeNull();
    expect(await scheduleMedicationReminder('med-1', 'Paracetamol', '08:65')).toBeNull();
    expect(await scheduleMedicationReminder('med-1', 'Paracetamol', '-1:30')).toBeNull();
  });

  it('handles snooze reminder scheduling and notification response subscriptions safely', async () => {
    const snoozeResult = await scheduleSnoozeReminder('med-1', 'Paracetamol', 15);
    expect(snoozeResult).toBeNull();

    let capturedMedId: string | null = null;
    const unsub = onNotificationResponse((data) => {
      if (data.medicationId) {
        capturedMedId = data.medicationId;
      }
    });

    const removeListener = registerNotificationResponseListener((medId) => {
      capturedMedId = medId;
    });

    expect(typeof unsub).toBe('function');
    expect(typeof removeListener).toBe('function');

    unsub();
    removeListener();
  });
});

describe('Notification & Alarm Service - Scheduled Triggers (Expo SDK 52)', () => {
  let scheduledCalls: Array<{ identifier?: string; content: any; trigger: any }> = [];
  let cancelledIdentifiers: string[] = [];
  let dismissedIdentifiers: string[] = [];
  let dismissedAllCount = 0;

  const mockNotificationsModule = {
    AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3 },
    AndroidNotificationPriority: { MAX: 'max', HIGH: 'high', DEFAULT: 'default' },
    SchedulableTriggerInputTypes: {
      DAILY: 'daily',
      TIME_INTERVAL: 'timeInterval',
      CALENDAR: 'calendar',
    },
    getPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
    requestPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
    setNotificationChannelAsync: vi.fn().mockResolvedValue(undefined),
    setNotificationHandler: vi.fn(),
    scheduleNotificationAsync: vi.fn().mockImplementation(async (request) => {
      scheduledCalls.push(request);
      return request.identifier || 'mock-id';
    }),
    cancelScheduledNotificationAsync: vi.fn().mockImplementation(async (id) => {
      cancelledIdentifiers.push(id);
    }),
    getAllScheduledNotificationsAsync: vi.fn().mockImplementation(async () => [
      { identifier: 'med-med-1-0800-due' },
      { identifier: 'med-med-1-0800-adv' },
      { identifier: 'snooze-med-1-123456789' },
      { identifier: 'other-app-alarm' },
    ]),
    getPresentedNotificationsAsync: vi.fn().mockImplementation(async () => [
      { request: { identifier: 'med-med-1-0800-due' } },
      { request: { identifier: 'snooze-med-1-123456789' } },
      { request: { identifier: 'unrelated-notification' } },
    ]),
    dismissNotificationAsync: vi.fn().mockImplementation(async (id) => {
      dismissedIdentifiers.push(id);
    }),
    dismissAllNotificationsAsync: vi.fn().mockImplementation(async () => {
      dismissedAllCount++;
    }),
  };

  beforeEach(() => {
    scheduledCalls = [];
    cancelledIdentifiers = [];
    dismissedIdentifiers = [];
    dismissedAllCount = 0;
    vi.clearAllMocks();
    setNotificationsModuleForTesting(mockNotificationsModule);
  });

  it('schedules daily recurring notifications using { type: "daily", hour, minute }', async () => {
    const notifId = await scheduleMedicationReminder(
      'metformin-1',
      'Metformin 500mg',
      '08:30',
      'Take with breakfast'
    );

    expect(notifId).toBe('med-metformin-1-0830-due');
    expect(scheduledCalls).toHaveLength(2);

    // 1. Advance reminder (15m before 08:30 -> 08:15)
    const advReminder = scheduledCalls.find((c) => c.identifier?.endsWith('-adv'));
    expect(advReminder).toBeDefined();
    expect(advReminder?.trigger).toEqual({
      type: 'daily',
      hour: 8,
      minute: 15,
      channelId: MEDICATION_CHANNEL_ID,
    });
    expect(advReminder?.content.title).toContain('Upcoming in 15m');

    // 2. Exact dose-time alarm (08:30)
    const dueReminder = scheduledCalls.find((c) => c.identifier?.endsWith('-due'));
    expect(dueReminder).toBeDefined();
    expect(dueReminder?.trigger).toEqual({
      type: 'daily',
      hour: 8,
      minute: 30,
      channelId: MEDICATION_CHANNEL_ID,
    });
    expect(dueReminder?.content.title).toContain('Time for Metformin 500mg');
  });

  it('correctly handles midnight wraparound for 15m advance reminders', async () => {
    await scheduleMedicationReminder('med-midnight', 'Sleep Aid', '00:10');

    const advReminder = scheduledCalls.find((c) => c.identifier?.endsWith('-adv'));
    expect(advReminder).toBeDefined();
    // 00:10 - 15m = 23:55
    expect(advReminder?.trigger).toEqual({
      type: 'daily',
      hour: 23,
      minute: 55,
      channelId: MEDICATION_CHANNEL_ID,
    });

    const dueReminder = scheduledCalls.find((c) => c.identifier?.endsWith('-due'));
    expect(dueReminder?.trigger).toEqual({
      type: 'daily',
      hour: 0,
      minute: 10,
      channelId: MEDICATION_CHANNEL_ID,
    });
  });

  it('schedules one-time snooze using { type: "timeInterval", seconds, repeats: false }', async () => {
    const snoozeId = await scheduleSnoozeReminder('med-1', 'Metformin 500mg', 15);
    expect(snoozeId).toMatch(/^snooze-med-1-/);
    expect(scheduledCalls).toHaveLength(1);

    const snoozeCall = scheduledCalls[0];
    expect(snoozeCall.trigger).toEqual({
      type: 'timeInterval',
      seconds: 900, // 15 mins * 60 seconds
      repeats: false,
      channelId: MEDICATION_CHANNEL_ID,
    });
    expect(snoozeCall.content.title).toContain('Snoozed Medication');
  });

  it('cancels scheduled notifications and dismisses presented notifications for a medication', async () => {
    await cancelAllRemindersForMedication('med-1');

    expect(cancelledIdentifiers).toContain('med-med-1-0800-due');
    expect(cancelledIdentifiers).toContain('med-med-1-0800-adv');
    expect(cancelledIdentifiers).toContain('snooze-med-1-123456789');
    expect(cancelledIdentifiers).not.toContain('other-app-alarm');

    expect(dismissedIdentifiers).toContain('med-med-1-0800-due');
    expect(dismissedIdentifiers).toContain('snooze-med-1-123456789');
    expect(dismissedIdentifiers).not.toContain('unrelated-notification');
  });

  it('syncAllMedicationReminders clears stale spam, cancels old alarms, and registers daily triggers', async () => {
    await syncAllMedicationReminders(
      [
        {
          id: 'med-atorvastatin',
          name: 'Atorvastatin 20mg',
          isActive: true,
          reminderTimes: ['13:00'],
        },
      ],
      true
    );

    // Clears delivered spam
    expect(dismissedAllCount).toBeGreaterThanOrEqual(1);

    // Cancelled old scheduled alerts
    expect(cancelledIdentifiers).toContain('med-med-1-0800-due');

    // Scheduled advance and due daily alarms for the active medication
    const adv = scheduledCalls.find((c) => c.identifier === 'med-med-atorvastatin-1300-adv');
    const due = scheduledCalls.find((c) => c.identifier === 'med-med-atorvastatin-1300-due');

    expect(adv?.trigger).toEqual({
      type: 'daily',
      hour: 12,
      minute: 45,
      channelId: MEDICATION_CHANNEL_ID,
    });
    expect(due?.trigger).toEqual({
      type: 'daily',
      hour: 13,
      minute: 0,
      channelId: MEDICATION_CHANNEL_ID,
    });
  });

  it('skips redundant alarm rescheduling when active medications and reminder times are unchanged', async () => {
    const meds = [
      {
        id: 'med-stable',
        name: 'Stable Med',
        isActive: true,
        reminderTimes: ['09:00'],
      },
    ];

    // First call: registers alarms
    await syncAllMedicationReminders(meds, true);
    const initialCallCount = scheduledCalls.length;
    expect(initialCallCount).toBe(2);

    // Second call with same schedule: should skip rescheduling
    await syncAllMedicationReminders(meds, false);
    expect(scheduledCalls.length).toBe(initialCallCount);
  });
});
