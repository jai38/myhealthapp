/**
 * Invariant 14 (foreground path): the handler that decides how a notification is shown while the
 * app is open only returns display options. It must never touch dose status.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

import { medicationStore } from '../../services/medications/medication-store';
import type { MedicationRecord } from '../../services/medications/medication-service';
import {
  requestNotificationPermissions,
  setNotificationsModuleForTesting,
} from '../../services/notifications/notification-service';

const med: MedicationRecord = {
  id: 'med-fg-1',
  patientProfileId: 'pat-1',
  nameAsWritten: 'Tab Foreground 5mg',
  normalizedMedicineName: 'Foreground',
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

describe('Invariant: the foreground notification handler never marks a dose TAKEN', () => {
  let handler: { handleNotification: (n: any) => Promise<Record<string, boolean>> } | undefined;
  let recordActionSpy: any;

  beforeEach(async () => {
    handler = undefined;
    setNotificationsModuleForTesting({
      AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3 },
      getPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
      requestPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
      setNotificationChannelAsync: vi.fn().mockResolvedValue(undefined),
      setNotificationHandler: vi.fn((h: any) => {
        handler = h;
      }),
    });
    await medicationStore.clearUserStorage();
    await medicationStore.addMedication(med);
    recordActionSpy = vi.spyOn(medicationStore, 'recordAction');
  });

  afterEach(() => {
    recordActionSpy.mockRestore();
    setNotificationsModuleForTesting(null);
  });

  it('shows the reminder in the foreground and leaves every dose unchanged', async () => {
    await requestNotificationPermissions();
    expect(handler).toBeDefined();

    const before = JSON.stringify(medicationStore.getAllDoses());
    const behavior = await handler!.handleNotification({
      request: { identifier: 'n-1', content: { data: { medicationId: med.id, status: 'TAKEN' } } },
    });

    expect(behavior).toMatchObject({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    });
    expect(JSON.stringify(medicationStore.getAllDoses())).toBe(before);
    expect(medicationStore.getAllDoses().some((d) => d.status === 'TAKEN')).toBe(false);
    expect(recordActionSpy).not.toHaveBeenCalled();
  });
});
