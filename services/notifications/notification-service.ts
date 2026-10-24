import { Platform } from 'react-native';

// Safe dynamic accessor for expo-notifications to ensure compatibility across all test runners
let customNotificationsModule: any = null;

export function setNotificationsModuleForTesting(mock: any) {
  customNotificationsModule = mock;
}

const getNotificationsModule = (): any => {
  if (customNotificationsModule !== null) {
    return customNotificationsModule;
  }
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
  if (!Notifications) {
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
    if (
      (Platform.OS === 'android' || customNotificationsModule !== null) &&
      typeof Notifications.setNotificationChannelAsync === 'function'
    ) {
      await Notifications.setNotificationChannelAsync(MEDICATION_CHANNEL_ID, {
        name: 'Medication Reminders',
        description: 'Timed alerts and alarms for scheduled medication doses',
        importance: Notifications.AndroidImportance?.MAX ?? 5,
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
 * 
 * Uses Expo DailyTriggerInput { type: 'daily', hour, minute } to ensure notifications
 * repeat daily at the scheduled clock time rather than firing immediately.
 * 
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
  if (!Notifications) {
    return null;
  }

  configureForegroundHandler(Notifications);

  const [hourStr, minStr] = (timeString || '').split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
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

    const dailyTriggerType =
      Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily';

    await Notifications.scheduleNotificationAsync({
      identifier: `${baseIdentifier}-adv`,
      content: {
        title: `🔔 Upcoming in 15m: ${medicationName}`,
        body: `Scheduled for ${timeString}. ${instructions ? instructions : 'Prepare to take with water.'}`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.HIGH ?? 'high',
        data: { medicationId, time: timeString, type: 'advance_reminder' },
        channelId: MEDICATION_CHANNEL_ID,
      },
      trigger: {
        type: dailyTriggerType,
        hour: advanceHour,
        minute: advanceMinute,
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
        priority: Notifications.AndroidNotificationPriority?.MAX ?? 'max',
        data: { medicationId, time: timeString, type: 'dose_due' },
        channelId: MEDICATION_CHANNEL_ID,
      },
      trigger: {
        type: dailyTriggerType,
        hour,
        minute,
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
 * Dismisses any currently presented (visible in status bar / lock screen)
 * notifications for a specific medication.
 */
export async function dismissDeliveredNotificationsForMedication(medicationId: string): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    if (
      typeof Notifications.getPresentedNotificationsAsync === 'function' &&
      typeof Notifications.dismissNotificationAsync === 'function'
    ) {
      const presented = await Notifications.getPresentedNotificationsAsync();
      const medPrefix = `med-${medicationId}`;
      const snoozePrefix = `snooze-${medicationId}`;
      for (const notif of presented) {
        const id = notif.request?.identifier || notif.identifier;
        if (id && (id.startsWith(medPrefix) || id.startsWith(snoozePrefix))) {
          await Notifications.dismissNotificationAsync(id).catch(() => {});
        }
      }
    }
  } catch (err) {
    // Non-blocking best-effort cleanup
  }
}

/**
 * Dismisses all currently presented notifications for the entire app from the status bar / tray.
 */
export async function dismissAllDeliveredNotifications(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    if (typeof Notifications.dismissAllNotificationsAsync === 'function') {
      await Notifications.dismissAllNotificationsAsync().catch(() => {});
    }
  } catch {
    // Non-blocking best-effort cleanup
  }
}

/**
 * Cancels all pending snooze alarms for a specific medication.
 */
export async function cancelSnoozeRemindersForMedication(medicationId: string): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const snoozePrefix = `snooze-${medicationId}`;
    for (const notif of scheduled) {
      if (notif.identifier && notif.identifier.startsWith(snoozePrefix)) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier).catch(() => {});
      }
    }
  } catch (err) {
    console.warn(`Failed to cancel snooze reminders for medication ${medicationId}:`, err);
  }
}

/**
 * Cancels all scheduled dose notifications and snooze alarms for a specific medication.
 * Also clears any delivered notifications for this medication from the notification tray.
 */
export async function cancelAllRemindersForMedication(medicationId: string): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const medPrefix = `med-${medicationId}`;
    const snoozePrefix = `snooze-${medicationId}`;
    for (const notif of scheduled) {
      if (
        notif.identifier &&
        (notif.identifier.startsWith(medPrefix) || notif.identifier.startsWith(snoozePrefix))
      ) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier).catch(() => {});
      }
    }
    // Also clear from notification tray
    await dismissDeliveredNotificationsForMedication(medicationId);
  } catch (err) {
    console.warn(`Failed to cancel reminders for medication ${medicationId}:`, err);
  }
}

let lastSyncedScheduleKey = '';

/**
 * Synchronizes scheduled system alarms with all currently active patient medications.
 * Respects medication course duration (endDate) so alarms do not fire after completion.
 * Avoids thrashing the native alarm scheduler if medications and reminder times have not changed.
 */
export async function syncAllMedicationReminders(
  medications: Array<{
    id: string;
    name: string;
    isActive: boolean;
    reminderTimes: string[];
    instructions?: string;
    endDate?: string | null;
  }>,
  force: boolean = false
): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    const activeMeds = medications.filter((m) => m.isActive);
    const scheduleKey = activeMeds
      .map(
        (m) =>
          `${m.id}:${(m.reminderTimes || []).slice().sort().join(',')}:${m.endDate || ''}`
      )
      .sort()
      .join('|');

    // Skip redundant alarm rescheduling if active medications and their reminder times have not changed
    if (!force && scheduleKey === lastSyncedScheduleKey && lastSyncedScheduleKey !== '') {
      return;
    }

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    // Clear any previously delivered immediate spam notifications lingering in status tray
    await dismissAllDeliveredNotifications();

    // Clear existing medication alerts first to avoid duplicate notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (
        notif.identifier &&
        (notif.identifier.startsWith('med-') || notif.identifier.startsWith('snooze-'))
      ) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier).catch(() => {});
      }
    }

    const now = Date.now();

    // Schedule each active medication dose within its active course
    for (const med of activeMeds) {
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

    lastSyncedScheduleKey = scheduleKey;
  } catch (err) {
    console.warn('Failed to sync all medication reminders:', err);
  }
}

/**
 * Schedules a one-time snooze alarm/notification for a dose occurrence.
 * Triggers once after snoozeMinutes elapsed time.
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
  if (!Notifications) {
    return null;
  }

  configureForegroundHandler(Notifications);

  try {
    await requestNotificationPermissions();

    const identifier = `snooze-${medicationId}-${Date.now()}`;
    const timeIntervalTriggerType =
      Notifications.SchedulableTriggerInputTypes?.TIME_INTERVAL || 'timeInterval';

    const notifId = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `⏰ Snoozed Medication: ${medicationName}`,
        body: `Your ${snoozeMinutes}-minute snooze has ended. Tap to record your dose.`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX ?? 'max',
        data: { medicationId, type: 'medication_snooze' },
        channelId: MEDICATION_CHANNEL_ID,
      },
      trigger: {
        type: timeIntervalTriggerType,
        seconds: Math.max(snoozeMinutes * 60, 60),
        repeats: false,
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
  if (!Notifications) {
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
