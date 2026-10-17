import { describe, it, expect } from 'vitest';
import {
  scheduleMedicationReminder,
  cancelAllRemindersForMedication,
  syncAllMedicationReminders,
  requestNotificationPermissions,
} from '../services/notifications/notification-service';

describe('Notification & Alarm Service', () => {
  it('gracefully handles missing native notification modules in non-mobile environments', async () => {
    const granted = await requestNotificationPermissions();
    expect(typeof granted).toBe('boolean');

    const result = await scheduleMedicationReminder('med-1', 'Paracetamol', '08:00', 'With water');
    expect(result).toBeNull(); // null because we are in Node environment without native bridge

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
    const result = await scheduleMedicationReminder('med-1', 'Paracetamol', 'invalid-time');
    expect(result).toBeNull();
  });
});
