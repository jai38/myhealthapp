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
 * Schedules daily recurring notifications for a specific medication dose time:
 * 1. 15-minute advance reminder ("Upcoming in 15m")
 * 2. Exact dose-time alarm ("Time for [Med]")
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

  const baseIdentifier = `med-${medicationId}-${timeString.replace(':', '')}`;

  try {
    // Cancel existing identifiers if already scheduled
    await Notifications.cancelScheduledNotificationAsync(`${baseIdentifier}-adv`).catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(`${baseIdentifier}-due`).catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(baseIdentifier).catch(() => {});

    // Ensure permission is granted and channel is ready
    await requestNotificationPermissions();

    // 1. Advance reminder: exactly 15 minutes before scheduled dose time
    let advanceHour = hour;
    let advanceMinute = minute - 15;
    if (advanceMinute < 0) {
      advanceMinute += 60;
      advanceHour = (advanceHour - 1 + 24) % 24;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: `${baseIdentifier}-adv`,
      content: {
        title: `🔔 Upcoming in 15m: ${medicationName}`,
        body: `Scheduled for ${timeString}. ${instructions ? instructions : 'Prepare to take with water.'}`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { medicationId, time: timeString, type: 'advance_reminder' },
        channelId: MEDICATION_CHANNEL_ID,
      },
      trigger: {
        hour: advanceHour,
        minute: advanceMinute,
        repeats: true,
        channelId: MEDICATION_CHANNEL_ID,
      },
    }).catch(() => {});

    // 2. Exact dose-time alert (Take, Skip, Snooze)
    const notifId = await Notifications.scheduleNotificationAsync({
      identifier: `${baseIdentifier}-due`,
      content: {
        title: `💊 Time for ${medicationName}`,
        body: instructions
          ? `${instructions} (${timeString}) • Open app to record Taken, Skip, or Snooze.`
          : `Time to take your scheduled dose of ${medicationName} (${timeString}). Open to record.`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { medicationId, time: timeString, type: 'dose_due' },
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
 * Respects medication course duration (endDate) so alarms do not fire after completion.
 */
export async function syncAllMedicationReminders(
  medications: Array<{
    id: string;
    name: string;
    isActive: boolean;
    reminderTimes: string[];
    instructions?: string;
    endDate?: string | null;
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

    const now = Date.now();

    // Schedule each active medication dose within its active course
    for (const med of medications) {
      if (!med.isActive) continue;

      // Check course duration: if endDate is in the past, do not schedule alarms
      if (med.endDate) {
        const endDateTime = new Date(`${med.endDate}T23:59:59`).getTime();
        if (!isNaN(endDateTime) && endDateTime < now) {
          continue;
        }
      }

      const times = med.reminderTimes || [];
      for (const time of times) {
        await scheduleMedicationReminder(med.id, med.name, time, med.instructions);
      }
    }
  } catch (err) {
    console.warn('Failed to sync all medication reminders:', err);
  }
}

/**
 * Schedules a one-time snooze alarm/notification for a dose occurrence.
 * @param medicationId Unique medication ID
 * @param medicationName Name of medication
 * @param snoozeMinutes Snooze interval in minutes (default 15)
 */
export async function scheduleSnoozeReminder(
  medicationId: string,
  medicationName: string,
  snoozeMinutes: number = 15
): Promise<string | null> {
  const Notifications = getNotificationsModule();
  if (Platform.OS === 'web' || !Notifications) {
    return null;
  }

  configureForegroundHandler(Notifications);

  try {
    await requestNotificationPermissions();

    const identifier = `snooze-${medicationId}-${Date.now()}`;
    const notifId = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `⏰ Snoozed Medication: ${medicationName}`,
        body: `Your ${snoozeMinutes}-minute snooze has ended. Tap to record your dose.`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { medicationId, type: 'medication_snooze' },
        channelId: MEDICATION_CHANNEL_ID,
      },
      trigger: {
        seconds: Math.max(snoozeMinutes * 60, 60),
        channelId: MEDICATION_CHANNEL_ID,
      },
    });

    return notifId;
  } catch (err) {
    console.warn(`Failed to schedule snooze reminder for ${medicationName}:`, err);
    return null;
  }
}

type NotificationResponseHandler = (data: { medicationId?: string; [key: string]: any }) => void;
const responseHandlers = new Set<NotificationResponseHandler>();

/**
 * Subscribes to notification response events (e.g. when patient taps notification).
 */
export function onNotificationResponse(handler: NotificationResponseHandler): () => void {
  responseHandlers.add(handler);
  return () => {
    responseHandlers.delete(handler);
  };
}

/**
 * Registers the global Expo Notifications response listener.
 * Handles both background/foreground taps and cold-start app launches from notification.
 */
export function registerNotificationResponseListener(
  navigationCallback?: (medicationId: string) => void
): () => void {
  const Notifications = getNotificationsModule();
  if (Platform.OS === 'web' || !Notifications) {
    return () => {};
  }

  const handleResponse = (response: any) => {
    const data = response?.notification?.request?.content?.data;
    if (data?.medicationId) {
      if (navigationCallback) {
        navigationCallback(data.medicationId);
      }
      for (const h of responseHandlers) {
        try {
          h(data);
        } catch (e) {
          console.warn('Error in notification response handler:', e);
        }
      }
    }
  };

  // Cold start: Check if the application was opened by tapping a notification
  if (typeof Notifications.getLastNotificationResponseAsync === 'function') {
    Notifications.getLastNotificationResponseAsync()
      .then((response: any) => {
        if (response) {
          handleResponse(response);
        }
      })
      .catch(() => {});
  }

  // Active listener: Listen for user tapping a notification while app is running
  if (typeof Notifications.addNotificationResponseReceivedListener === 'function') {
    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }

  return () => {};
}
