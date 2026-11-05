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
      const [allMeds, doses] = await Promise.all([
        medicationService.listMedications().catch(() => []),
        medicationService.getDoseOccurrences().catch(() => []),
      ]);

      if (allMeds.length > 0 || doses.length > 0) {
        await medicationStore.syncFromServer(allMeds, doses);
      }

      setMedications(medicationStore.getMedications());

      // Synchronize device alarms with all active medications
      syncAllMedicationReminders(buildReminderSyncPayload(medicationStore.getMedications())).catch(() => {});
    } catch (err: any) {
      setError(err?.message || 'Failed to load medication records.');
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
  const handleRecordDoseAction = async (
    doseId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes?: number
  ) => {
    setActionDoseId(doseId);
    try {
      const updatedDose = await medicationStore.recordAction(doseId, action, snoozeMinutes);
      const targetMed = medications.find((m) => m.id === updatedDose.medicationId);
      const medName = targetMed?.nameAsWritten || 'Medication';

      if (action === 'TAKEN') {
        setActionNotice(`✓ ${medName} marked as taken!`);
      } else if (action === 'SNOOZED') {
        setActionNotice(`⏰ ${medName} snoozed for ${snoozeMinutes || 15} minutes.`);
      } else if (action === 'SKIPPED') {
        setActionNotice(`Skipped ${medName} for this dose.`);
      }

      setTimeout(() => {
        setActionNotice(null);
      }, 4000);
    } catch {
      Alert.alert('Action Failed', 'Could not record dose action.');
    } finally {
      setActionDoseId(null);
    }
  };

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
