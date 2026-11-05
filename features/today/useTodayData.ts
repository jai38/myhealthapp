import { useState, useEffect, useCallback } from 'react';
import { authService, UserSession } from '../../services/auth/auth-service';
import {
  medicationService,
  MedicationRecord,
  DoseLog,
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
  const [allDoses, setAllDoses] = useState<DoseLog[]>(() => medicationStore.getAllDoses());
  const [recentEvents, setRecentEvents] = useState<TimelineEvent[]>([]);
  const [totalRecordsCount, setTotalRecordsCount] = useState<number>(0);

  // Subscribe to reactive updates from medication store
  useEffect(() => {
    const unsub = medicationStore.subscribe(() => {
      setMedications(medicationStore.getMedications());
      setAllDoses(medicationStore.getAllDoses());
    });
    return unsub;
  }, []);

  // Sync with remote backend when available
  const loadDashboardData = useCallback(async () => {
    try {
      const [serverMeds, serverDoses, timelineRes] = await Promise.all([
        medicationService.listMedications().catch(() => []),
        medicationService.getDoseOccurrences().catch(() => []),
        timelineService
          .fetchTimeline({ limit: 3 })
          .catch(() => ({ data: [], pagination: { totalCount: 0 } })),
      ]);

      if (serverMeds.length > 0 || serverDoses.length > 0) {
        await medicationStore.syncFromServer(serverMeds, serverDoses);
      }

      setRecentEvents(timelineRes.data);
      setTotalRecordsCount(timelineRes.pagination.totalCount);
    } catch {
      // Offline fallback: keep existing store data
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

  return { session, medications, allDoses, recentEvents, totalRecordsCount, loadDashboardData };
}
