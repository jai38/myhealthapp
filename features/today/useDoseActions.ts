import { useState } from 'react';
import { Alert } from 'react-native';
import { MedicationRecord, DoseLog } from '../../services/medications/medication-service';
import { medicationStore } from '../../services/medications/medication-store';

export function useDoseActions(medications: MedicationRecord[]) {
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionDoseId, setActionDoseId] = useState<string | null>(null);

  // On-demand logging for As-Needed (PRN / SOS) medications
  const handleRecordAsNeededDose = async (med: MedicationRecord) => {
    try {
      const now = new Date();
      const doseId = `prn-${med.id}-${Date.now()}`;
      const newDose: DoseLog = {
        id: doseId,
        medicationId: med.id,
        patientProfileId: med.patientProfileId,
        scheduledTime: now.toISOString(),
        status: 'TAKEN',
        actionTime: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      await medicationStore.addDoseLog(newDose);
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setActionNotice(`✓ Logged dose of ${med.nameAsWritten} taken at ${timeStr}`);
      setTimeout(() => {
        setActionNotice(null);
      }, 4000);
    } catch {
      Alert.alert('Action Failed', 'Could not record as-needed dose.');
    }
  };

  // Instant Optimistic Dose Actions (Taken, Snooze 15m, Skip)
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

      // Auto-clear feedback notice after 4 seconds
      setTimeout(() => {
        setActionNotice(null);
      }, 4000);
    } catch {
      Alert.alert('Action Failed', 'Could not record dose action.');
    } finally {
      setActionDoseId(null);
    }
  };

  return { actionNotice, actionDoseId, handleRecordAsNeededDose, handleRecordDoseAction };
}
