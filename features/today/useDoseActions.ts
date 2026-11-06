import { useState } from 'react';
import { Alert } from 'react-native';
import { t } from '../../design/strings';
import { MedicationRecord, DoseLog } from '../../services/medications/medication-service';
import { medicationStore } from '../../services/medications/medication-store';

export type DoseAction = 'TAKEN' | 'SKIPPED' | 'SNOOZED';

const NOTICE_MS = 4000;

export interface DoseActionHandlers {
  setActionNotice: (notice: string | null) => void;
  setActionDoseId: (id: string | null) => void;
  /** Called when the save failed. The store has already restored the previous state. */
  onFailure: () => void;
}

/**
 * Records a Taken, Skip or Snooze, then shows a notice. If the server does not save it,
 * the store puts the dose back as it was and throws; we show a calm error and no notice.
 * One copy, used by Today and Medicines.
 */
export async function runDoseAction(
  medications: MedicationRecord[],
  doseId: string,
  action: DoseAction,
  snoozeMinutes: number | undefined,
  handlers: DoseActionHandlers,
): Promise<void> {
  handlers.setActionDoseId(doseId);
  try {
    const updatedDose = await medicationStore.recordAction(doseId, action, snoozeMinutes);
    const targetMed = medications.find((m) => m.id === updatedDose.medicationId);
    const name = targetMed?.nameAsWritten || t('today.unknownMedicine');

    if (action === 'TAKEN') {
      handlers.setActionNotice(t('status.doseNoticeTaken', { name }));
    } else if (action === 'SNOOZED') {
      handlers.setActionNotice(
        t('status.doseNoticeSnoozed', { name, minutes: snoozeMinutes || 15 }),
      );
    } else if (action === 'SKIPPED') {
      handlers.setActionNotice(t('status.doseNoticeSkipped', { name }));
    }

    // Auto-clear feedback notice after 4 seconds
    setTimeout(() => {
      handlers.setActionNotice(null);
    }, NOTICE_MS);
  } catch {
    handlers.setActionNotice(null);
    handlers.onFailure();
  } finally {
    handlers.setActionDoseId(null);
  }
}

/**
 * Notes an as-needed dose. There is no server endpoint for a dose without a scheduled
 * record, so it is saved on this phone only, and the notice says so.
 */
export async function runAsNeededDose(
  med: MedicationRecord,
  handlers: Pick<DoseActionHandlers, 'setActionNotice' | 'onFailure'>,
): Promise<void> {
  try {
    const now = new Date();
    const newDose: DoseLog = {
      id: `prn-${med.id}-${Date.now()}`,
      medicationId: med.id,
      patientProfileId: med.patientProfileId,
      scheduledTime: now.toISOString(),
      status: 'TAKEN',
      actionTime: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    await medicationStore.addDoseLog(newDose);
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    handlers.setActionNotice(
      t('status.doseNoticeSavedOnPhone', { name: med.nameAsWritten, time }),
    );
    setTimeout(() => {
      handlers.setActionNotice(null);
    }, NOTICE_MS);
  } catch {
    handlers.onFailure();
  }
}

export function useDoseActions(medications: MedicationRecord[]) {
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionDoseId, setActionDoseId] = useState<string | null>(null);

  // On-demand logging for As-Needed (PRN / SOS) medications
  const handleRecordAsNeededDose = (med: MedicationRecord) =>
    runAsNeededDose(med, {
      setActionNotice,
      onFailure: () => Alert.alert(t('status.doseActionFailedTitle'), t('status.asNeededFailedBody')),
    });

  // Instant Optimistic Dose Actions (Taken, Snooze 15m, Skip)
  const handleRecordDoseAction = (doseId: string, action: DoseAction, snoozeMinutes?: number) =>
    runDoseAction(medications, doseId, action, snoozeMinutes, {
      setActionNotice,
      setActionDoseId,
      onFailure: () => Alert.alert(t('status.doseActionFailedTitle'), t('status.doseActionFailedBody')),
    });

  return { actionNotice, actionDoseId, handleRecordAsNeededDose, handleRecordDoseAction };
}
