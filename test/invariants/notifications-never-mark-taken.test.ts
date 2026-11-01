/**
 * Invariant 12: notification delivery, dismissal, tap or snooze must never mark a dose TAKEN.
 * Only an explicit TAKEN/SKIPPED action recorded by the patient changes dose status.
 *
 * Existing suites prove that the store only changes status through recordAction
 * (medication-store.test.ts) and that notifications are scheduled and cancelled correctly
 * (notification-service.test.ts). Neither fires notification events at a populated store and
 * checks the doses. This does, using a fake native module that captures the real listeners.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

import { medicationStore } from '../../services/medications/medication-store';
import { medicationService } from '../../services/medications/medication-service';
import type { MedicationRecord } from '../../services/medications/medication-service';
import {
  registerNotificationResponseListener,
  onNotificationResponse,
  scheduleSnoozeReminder,
  scheduleMedicationReminder,
  dismissDeliveredNotificationsForMedication,
  dismissAllDeliveredNotifications,
  cancelSnoozeRemindersForMedication,
  cancelAllRemindersForMedication,
  syncAllMedicationReminders,
  setNotificationsModuleForTesting,
} from '../../services/notifications/notification-service';

const DEFAULT_ACTION = 'expo.modules.notifications.actions.DEFAULT';
const DISMISS_ACTION = 'expo.modules.notifications.actions.DISMISS';

const med: MedicationRecord = {
  id: 'med-notif-1',
  patientProfileId: 'pat-1',
  nameAsWritten: 'Tab Notif 5mg',
  normalizedMedicineName: 'Notif',
  strength: '5 mg',
  dosageForm: 'TABLET',
  route: 'ORAL',
  prescribedInstructions: 'Once daily',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
  reminderTimes: ['08:00', '14:00', '20:00'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function response(actionIdentifier: string, data: unknown) {
  return { actionIdentifier, notification: { request: { identifier: 'n-1', content: { data } } } };
}

describe('Invariant: notification events never mark a dose TAKEN', () => {
  let responseListeners: Array<(r: any) => void>;
  let receivedListeners: Array<(n: any) => void>;
  let lastResponse: any;
  let nativeModule: any;
  let recordActionSpy: { mockRestore(): void } & any;
  let recordDoseActionSpy: { mockRestore(): void } & any;

  const snapshot = () => JSON.stringify(medicationStore.getAllDoses());

  beforeEach(async () => {
    responseListeners = [];
    receivedListeners = [];
    lastResponse = null;
    nativeModule = {
      AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3 },
      AndroidNotificationPriority: { MAX: 'max', HIGH: 'high', DEFAULT: 'default' },
      SchedulableTriggerInputTypes: { DAILY: 'daily', TIME_INTERVAL: 'timeInterval', CALENDAR: 'calendar' },
      getPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
      requestPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
      setNotificationChannelAsync: vi.fn().mockResolvedValue(undefined),
      setNotificationHandler: vi.fn(),
      scheduleNotificationAsync: vi.fn().mockImplementation(async (r: any) => r.identifier ?? 'id'),
      cancelScheduledNotificationAsync: vi.fn().mockResolvedValue(undefined),
      getAllScheduledNotificationsAsync: vi.fn().mockResolvedValue([
        { identifier: `med-${med.id}-0800-due` },
        { identifier: `snooze-${med.id}-1` },
      ]),
      getPresentedNotificationsAsync: vi.fn().mockResolvedValue([
        { request: { identifier: `med-${med.id}-0800-due` } },
      ]),
      dismissNotificationAsync: vi.fn().mockResolvedValue(undefined),
      dismissAllNotificationsAsync: vi.fn().mockResolvedValue(undefined),
      getLastNotificationResponseAsync: vi.fn().mockImplementation(async () => lastResponse),
      addNotificationResponseReceivedListener: vi.fn().mockImplementation((fn: any) => {
        responseListeners.push(fn);
        return { remove: () => {} };
      }),
      addNotificationReceivedListener: vi.fn().mockImplementation((fn: any) => {
        receivedListeners.push(fn);
        return { remove: () => {} };
      }),
    };
    setNotificationsModuleForTesting(nativeModule);

    await medicationStore.clearUserStorage();
    await medicationStore.addMedication(med);

    // Give the store a mix of states so an unwanted rewrite of any of them would show.
    const today = medicationStore.getTodayDoses();
    if (today.length >= 3) {
      await medicationStore.recordAction(today[1].id, 'SKIPPED');
      await medicationStore.recordAction(today[2].id, 'SNOOZED');
    }

    recordActionSpy = vi.spyOn(medicationStore, 'recordAction');
    recordDoseActionSpy = vi.spyOn(medicationService, 'recordDoseAction');
  });

  afterEach(() => {
    recordActionSpy.mockRestore();
    recordDoseActionSpy.mockRestore();
    setNotificationsModuleForTesting(null);
  });

  const tick = () => new Promise((r) => setTimeout(r, 0));

  it('has a populated store to protect (test sanity)', () => {
    const doses = medicationStore.getAllDoses().filter((d) => d.medicationId === med.id);
    expect(doses.length).toBeGreaterThanOrEqual(3);
    expect(doses.some((d) => d.status === 'PENDING')).toBe(true);
    expect(doses.some((d) => d.status === 'TAKEN')).toBe(false);
  });

  it.each([
    ['tap on a reminder', DEFAULT_ACTION, { medicationId: med.id, type: 'medication_reminder' }],
    ['tap on a snooze-ended notification', DEFAULT_ACTION, { medicationId: med.id, type: 'medication_snooze' }],
    ['dismiss action', DISMISS_ACTION, { medicationId: med.id, type: 'medication_reminder' }],
    ['custom Snooze button', 'SNOOZE', { medicationId: med.id, type: 'medication_reminder' }],
    ['custom button literally named TAKEN', 'TAKEN', { medicationId: med.id, type: 'medication_reminder' }],
    ['payload that asks for TAKEN', DEFAULT_ACTION, { medicationId: med.id, action: 'TAKEN', status: 'TAKEN' }],
    ['payload naming a dose id', DEFAULT_ACTION, { medicationId: med.id, doseId: medicationStore.getAllDoses()[0]?.id }],
    ['payload without a medication id', DEFAULT_ACTION, {}],
    ['null payload', DEFAULT_ACTION, null],
  ])('%s leaves every dose unchanged', async (_label, actionIdentifier, data) => {
    const navigated: string[] = [];
    const handled: unknown[] = [];
    const unsubHandler = onNotificationResponse((d) => handled.push(d));
    const unsub = registerNotificationResponseListener((id) => navigated.push(id));
    const before = snapshot();

    for (const l of responseListeners) l(response(actionIdentifier, data));
    await tick();

    expect(snapshot()).toBe(before);
    expect(recordActionSpy).not.toHaveBeenCalled();
    expect(recordDoseActionSpy).not.toHaveBeenCalled();
    unsub();
    unsubHandler();
  });

  it('a cold start from a tapped notification leaves every dose unchanged', async () => {
    lastResponse = response(DEFAULT_ACTION, { medicationId: med.id, type: 'medication_reminder' });
    const before = snapshot();
    const navigated: string[] = [];
    const unsub = registerNotificationResponseListener((id) => navigated.push(id));
    await tick();
    expect(navigated).toEqual([med.id]); // navigation happened, so the handler really ran
    expect(snapshot()).toBe(before);
    expect(recordActionSpy).not.toHaveBeenCalled();
    expect(recordDoseActionSpy).not.toHaveBeenCalled();
    unsub();
  });

  it('delivery (notification received while the app is open) leaves every dose unchanged', async () => {
    const unsub = registerNotificationResponseListener();
    const before = snapshot();
    for (const l of receivedListeners) l({ request: { identifier: 'n-1', content: { data: { medicationId: med.id } } } });
    await tick();
    expect(snapshot()).toBe(before);
    expect(recordActionSpy).not.toHaveBeenCalled();
    unsub();
  });

  it('scheduling, dismissing, cancelling and re-syncing notifications leaves every dose unchanged', async () => {
    const before = snapshot();
    await scheduleSnoozeReminder(med.id, med.nameAsWritten, 15);
    await scheduleMedicationReminder(med.id, med.nameAsWritten, '08:00', 'With water');
    await dismissDeliveredNotificationsForMedication(med.id);
    await dismissAllDeliveredNotifications();
    await cancelSnoozeRemindersForMedication(med.id);
    await cancelAllRemindersForMedication(med.id);
    await syncAllMedicationReminders([
      { id: med.id, name: med.nameAsWritten, isActive: true, reminderTimes: ['08:00', '20:00'] },
    ]);
    await tick();
    expect(snapshot()).toBe(before);
    expect(recordActionSpy).not.toHaveBeenCalled();
    expect(recordDoseActionSpy).not.toHaveBeenCalled();
  });

  it('control: an explicit patient TAKEN does change status (the test would notice)', async () => {
    const pending = medicationStore.getAllDoses().find((d) => d.status === 'PENDING')!;
    const before = snapshot();
    await medicationStore.recordAction(pending.id, 'TAKEN');
    expect(snapshot()).not.toBe(before);
    expect(medicationStore.getAllDoses().find((d) => d.id === pending.id)!.status).toBe('TAKEN');
    expect(recordActionSpy).toHaveBeenCalledTimes(1);
  });

  it('the notification service code has no path to a dose status change', () => {
    const dir = path.resolve(__dirname, '../../services/notifications');
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
      const code = fs
        .readFileSync(path.join(dir, file), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      expect(code, `${file} must not record dose actions`).not.toMatch(/recordAction|recordDoseAction|correctDoseAction|addDoseLog|medicationStore/);
      expect(code, `${file} must not mention TAKEN`).not.toMatch(/\bTAKEN\b/);
    }
  });
});
