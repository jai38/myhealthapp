/**
 * Discrete Occurrence Notification Scheduler
 *
 * Implements ADR-006:
 * Counts actual discrete upcoming dose timestamps rather than approximating by daily dose counts.
 * Enforces strict platform caps:
 * - iOS: Maximum 60 scheduled notifications (respecting system limit of 64 with a 4-slot buffer).
 * - Android: Maximum 100 scheduled notifications.
 * Delivery is best-effort. Exact alarms are never an unconditional blocker.
 */

export interface MedicationScheduleOccurrence {
  scheduleId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: Date; // Exact UTC timestamp
}

export type SupportedPlatform = 'ios' | 'android' | 'web';

export interface SchedulerPlatformLimits {
  readonly maxScheduledNotifications: number;
}

export const PLATFORM_LIMITS: Record<SupportedPlatform, SchedulerPlatformLimits> = {
  ios: { maxScheduledNotifications: 60 }, // 64 hard ceiling minus 4 safety slots
  android: { maxScheduledNotifications: 100 },
  web: { maxScheduledNotifications: 0 },
};

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  triggerDate: Date;
  scheduleId: string;
}

export class DiscreteOccurrenceScheduler {
  private platform: SupportedPlatform;

  constructor(platform: SupportedPlatform = 'ios') {
    this.platform = platform;
  }

  /**
   * Takes raw projected occurrences from all active medication schedules,
   * sorts them chronologically, filters out past occurrences, and slices
   * the exact next occurrences that fit within platform limits.
   */
  public projectSchedulableOccurrences(
    allProjectedOccurrences: MedicationScheduleOccurrence[],
    now: Date = new Date()
  ): MedicationScheduleOccurrence[] {
    const limit = PLATFORM_LIMITS[this.platform].maxScheduledNotifications;
    if (limit === 0) return [];

    // Filter to future timestamps only
    const futureOccurrences = allProjectedOccurrences.filter(
      (occ) => occ.scheduledTime.getTime() > now.getTime()
    );

    // Sort chronologically ascending
    futureOccurrences.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

    // Slice to exact platform capacity
    return futureOccurrences.slice(0, limit);
  }

  /**
   * Formats discrete occurrences into privacy-preserving notification payloads.
   * Default text does NOT leak specific drug names or dosages on the lock screen.
   */
  public formatNotificationPayloads(
    occurrences: MedicationScheduleOccurrence[]
  ): NotificationPayload[] {
    return occurrences.map((occ) => ({
      id: `notif_${occ.scheduleId}_${occ.scheduledTime.getTime()}`,
      title: 'Medication Reminder',
      body: 'It is time for your scheduled medication.', // Generic text by default for PHI privacy
      triggerDate: occ.scheduledTime,
      scheduleId: occ.scheduleId,
    }));
  }

  /**
   * Determines if replenishment is required based on remaining notification count.
   * If remaining count drops below 20% of limit or below 5 items, replenishment is triggered.
   */
  public needsReplenishment(currentlyScheduledCount: number): boolean {
    const limit = PLATFORM_LIMITS[this.platform].maxScheduledNotifications;
    if (limit === 0) return false;
    const threshold = Math.max(5, Math.floor(limit * 0.2));
    return currentlyScheduledCount <= threshold;
  }
}
