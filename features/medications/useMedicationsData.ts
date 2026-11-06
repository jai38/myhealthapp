import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  medicationService,
  MedicationRecord,
} from '../../services/medications/medication-service';
import { medicationStore } from '../../services/medications/medication-store';
import { buildReminderSyncPayload } from '../../services/medications/reminder-sync';
import { syncAllMedicationReminders } from '../../services/notifications/notification-service';
import { authService } from '../../services/auth/auth-service';
import { t } from '../../design/strings';
import { runDoseAction, type DoseAction } from '../today/useDoseActions';

export function useMedicationsData() {
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [medications, setMedications] = useState<MedicationRecord[]>(() =>
    medicationStore.getMedications()
  );

  // Dose action in-flight state
  const [actionDoseId, setActionDoseId] = useState<string | null>(null);

  // Subscribe to reactive updates from medicationStore
  useEffect(() => {
    const unsub = medicationStore.subscribe(() => {
      setMedications(medicationStore.getMedications());
    });
    return unsub;
  }, []);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      // A failed request still lets the other one sync, and its failure is shown through `error`.
      let loadFailed = false;
      const [allMeds, doses] = await Promise.all([
        medicationService.listMedications().catch(() => {
          loadFailed = true;
          return [];
        }),
        medicationService.getDoseOccurrences().catch(() => {
          loadFailed = true;
          return [];
        }),
      ]);

      if (allMeds.length > 0 || doses.length > 0) {
        await medicationStore.syncFromServer(allMeds, doses);
      }

      setMedications(medicationStore.getMedications());

      // Synchronize device alarms with all active medications
      syncAllMedicationReminders(buildReminderSyncPayload(medicationStore.getMedications())).catch(() => {});

      if (loadFailed) setError(t('medications.loadFailed'));
    } catch {
      setError(t('medications.loadFailed'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = authService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Instant Optimistic Dose Actions (Taken, Snooze, Skip)
  const handleRecordDoseAction = (
    doseId: string,
    action: DoseAction,
    snoozeMinutes?: number
  ) =>
    runDoseAction(medications, doseId, action, snoozeMinutes, {
      setActionNotice,
      setActionDoseId,
      onFailure: () =>
        Alert.alert(t('medications.actionFailedTitle'), t('medications.actionFailedBody')),
    });

  return {
    loading,
    refreshing,
    error,
    actionNotice,
    actionDoseId,
    medications,
    loadData,
    onRefresh,
    handleRecordDoseAction,
  };
}
