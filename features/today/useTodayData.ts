import { useState, useEffect, useCallback } from 'react';
import { authService, UserSession } from '../../services/auth/auth-service';
import {
  medicationService,
  MedicationRecord,
} from '../../services/medications/medication-service';
import { medicationStore } from '../../services/medications/medication-store';
import { timelineService, TimelineEvent } from '../../services/timeline/timeline-service';
import { buildReminderSyncPayload } from '../../services/medications/reminder-sync';
import { syncAllMedicationReminders } from '../../services/notifications/notification-service';

export function useTodayData() {
  const [session, setSession] = useState<UserSession | null>(authService.getSession());
  const [medications, setMedications] = useState<MedicationRecord[]>(() =>
    medicationStore.getMedications()
  );
  const [initialized, setInitialized] = useState<boolean>(() => medicationStore.isInitialized());
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  // Time of the last successful server load. Kept in memory only.
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [recentEvents, setRecentEvents] = useState<TimelineEvent[]>([]);
  const [totalRecordsCount, setTotalRecordsCount] = useState<number>(0);

  // Subscribe to reactive updates from medication store
  useEffect(() => {
    const unsub = medicationStore.subscribe(() => {
      setMedications(medicationStore.getMedications());
      setInitialized(medicationStore.isInitialized());
    });
    return unsub;
  }, []);

  // Sync with remote backend when available
  const loadDashboardData = useCallback(async () => {
    try {
      // Both medicine calls failing means the load failed; cached store data is kept either way.
      let medsFailed = false;
      let dosesFailed = false;
      const [serverMeds, serverDoses, timelineRes] = await Promise.all([
        medicationService.listMedications().catch(() => {
          medsFailed = true;
          return [];
        }),
        medicationService.getDoseOccurrences().catch(() => {
          dosesFailed = true;
          return [];
        }),
        timelineService
          .fetchTimeline({ limit: 3 })
          .catch(() => ({ data: [], pagination: { totalCount: 0 } })),
      ]);

      if (serverMeds.length > 0 || serverDoses.length > 0) {
        await medicationStore.syncFromServer(serverMeds, serverDoses);
      }

      if (medsFailed && dosesFailed) {
        setLoadFailed(true);
      } else {
        setLoadFailed(false);
        setLastUpdatedAt(Date.now());
      }

      setRecentEvents(timelineRes.data);
      setTotalRecordsCount(timelineRes.pagination.totalCount);
    } catch {
      // Offline fallback: keep existing store data
      setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const unsubscribe = authService.subscribe((currentSession) => {
      setSession(currentSession);
      loadDashboardData();
    });
    return unsubscribe;
  }, [loadDashboardData]);

  // Automatically sync local system notification alarms whenever active medications change
  useEffect(() => {
    if (!medicationStore.isInitialized() && medications.length === 0) {
      return;
    }
    const activeMeds = buildReminderSyncPayload(
      medications.length > 0 ? medications : medicationStore.getMedications()
    );
    syncAllMedicationReminders(activeMeds).catch(() => {});
  }, [medications]);

  return {
    session,
    medications,
    initialized,
    loadFailed,
    lastUpdatedAt,
    recentEvents,
    totalRecordsCount,
    loadDashboardData,
  };
}
