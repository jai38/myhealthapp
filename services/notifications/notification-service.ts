import { Platform } from 'react-native';

// Safe dynamic accessor for expo-notifications to ensure compatibility across all test runners
const getNotificationsModule = (): any => {
  if (Platform.OS === 'web' || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test')) {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return typeof require !== 'undefined' ? require('expo-notifications') : null;
  } catch {
    return null;
  }
};

let handlerConfigured = false;
const configureForegroundHandler = (notifs: any) => {
  if (!handlerConfigured && notifs && typeof notifs.setNotificationHandler === 'function') {
    handlerConfigured = true;
    notifs.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
};

export const MEDICATION_CHANNEL_ID = 'medication-reminders';

/**
 * Requests notification permissions from the patient.
 * On Android 13+, this displays the system notification permission dialog.
 * Also registers high-priority Android notification channel with sound & vibration.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (Platform.OS === 'web' || !Notifications) {
    return false;
  }

  configureForegroundHandler(Notifications);

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Configure dedicated Android notification channel with maximum urgency, sound and vibration
    if (Platform.OS === 'android' && typeof Notifications.setNotificationChannelAsync === 'function') {
      await Notifications.setNotificationChannelAsync(MEDICATION_CHANNEL_ID, {
        name: 'Medication Reminders',
        description: 'Timed alerts and alarms for scheduled medication doses',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0F766E',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });
    }

    return true;
  } catch (err) {
    console.warn('Failed to request notification permissions:', err);
    return false;
  }
}

/**
 * Schedules a daily recurring notification for a specific medication dose time.
 * @param medicationId Unique medication ID
 * @param medicationName Name of medicine (e.g. "Amoxicillin")
 * @param timeString 24-hr time string (e.g. "08:00" or "20:30")
 * @param instructions Dosage instructions (e.g. "Take after food with water")
 */
export async function scheduleMedicationReminder(
  medicationId: string,
  medicationName: string,
  timeString: string,
  instructions?: string
): Promise<string | null> {
  const Notifications = getNotificationsModule();
  if (Platform.OS === 'web' || !Notifications) {
    return null;
  }

  configureForegroundHandler(Notifications);

  const [hourStr, minStr] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  if (isNaN(hour) || isNaN(minute)) {
    return null;
  }

  const identifier = `med-${medicationId}-${timeString.replace(':', '')}`;

  try {
    // Cancel existing identifier if already scheduled
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

    // Ensure permission is granted and channel is ready
    await requestNotificationPermissions();

    const notifId = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `💊 Time for ${medicationName}`,
        body: instructions
          ? `${instructions} (${timeString})`
          : `Time to take your scheduled dose of ${medicationName} (${timeString}).`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { medicationId, time: timeString },
        channelId: MEDICATION_CHANNEL_ID,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: MEDICATION_CHANNEL_ID,
      },
    });

    return notifId;
  } catch (err) {
    console.warn(`Failed to schedule reminder for ${medicationName} at ${timeString}:`, err);
    return null;
  }
}

/**
 * Cancels all scheduled dose notifications for a specific medication.
 */
export async function cancelAllRemindersForMedication(medicationId: string): Promise<void> {
  const Notifications = getNotificationsModule();
  if (Platform.OS === 'web' || !Notifications) {
    return;
  }

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const prefix = `med-${medicationId}`;
    for (const notif of scheduled) {
      if (notif.identifier && notif.identifier.startsWith(prefix)) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier).catch(() => {});
      }
    }
  } catch (err) {
    console.warn(`Failed to cancel reminders for medication ${medicationId}:`, err);
  }
}

/**
 * Synchronizes scheduled system alarms with all currently active patient medications.
 */
export async function syncAllMedicationReminders(
  medications: Array<{
    id: string;
    name: string;
    isActive: boolean;
    reminderTimes: string[];
    instructions?: string;
  }>
): Promise<void> {
  const Notifications = getNotificationsModule();
  if (Platform.OS === 'web' || !Notifications) {
    return;
  }

  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;

    // Clear existing medication alerts first to avoid duplicate notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier && notif.identifier.startsWith('med-')) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier).catch(() => {});
      }
    }

    // Schedule each active medication dose
    for (const med of medications) {
      if (!med.isActive) continue;
      const times = med.reminderTimes || [];
      for (const time of times) {
        await scheduleMedicationReminder(med.id, med.name, time, med.instructions);
      }
    }
  } catch (err) {
    console.warn('Failed to sync all medication reminders:', err);
  }
}
