import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { t } from '../../../design/strings';
import {
  DocumentSignedUrl,
  MedicationDetail,
  medicationService,
} from '../../../services/medications/medication-service';
import {
  scheduleMedicationReminder,
  cancelAllRemindersForMedication,
  scheduleSnoozeReminder,
} from '../../../services/notifications/notification-service';
import { formatTime12Hour } from '../reminder-time-utils';

export interface UseMedicationDetailArgs {
  visible: boolean;
  medicationId: string | null;
  onStatusChanged?: () => void;
}

// State and handlers for the medication detail modal. Moved from the modal unchanged;
// only user-facing alert and error text now comes from t().
export function useMedicationDetail({ visible, medicationId, onStatusChanged }: UseMedicationDetailArgs) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [medication, setMedication] = useState<MedicationDetail | null>(null);

  // Document preview state
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [documentUrlInfo, setDocumentUrlInfo] = useState<DocumentSignedUrl | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState<boolean>(false);

  // Schedule / Action Sub-views
  const [showScheduleForm, setShowScheduleForm] = useState<boolean>(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00', '20:00']);
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  // Discontinue reason input
  const [showDiscontinuePrompt, setShowDiscontinuePrompt] = useState<boolean>(false);
  const [discontinueReason, setDiscontinueReason] = useState<string>('');

  const [actionDoseId, setActionDoseId] = useState<string | null>(null);

  useEffect(() => {
    if (visible && medicationId) {
      loadMedication(medicationId);
    } else {
      setMedication(null);
      setError(null);
      setShowScheduleForm(false);
      setShowDiscontinuePrompt(false);
      setDocumentUrlInfo(null);
      setShowDocumentPreview(false);
    }
  }, [visible, medicationId]);

  const loadMedication = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await medicationService.getMedicationDetails(id);
      setMedication(detail);
      if (detail.reminderTimes && detail.reminderTimes.length > 0) {
        setSelectedTimes(detail.reminderTimes);
      } else {
        setSelectedTimes(['08:00', '20:00']);
      }
    } catch (err: any) {
      setError(err?.message || t('medicines.detail.loadErrorFallback'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = async () => {
    if (!medicationId) return;
    setLoadingDoc(true);
    setDocError(null);
    setShowDocumentPreview(true);
    try {
      const urlInfo = await medicationService.getDocumentSignedUrl(medicationId);
      setDocumentUrlInfo(urlInfo);
    } catch (err: any) {
      setDocError(err?.message || t('medicines.detail.docErrorFallback'));
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleSelectFrequency = (times: readonly string[]) => {
    setSelectedTimes([...times]);
  };

  const handleTogglePresetTime = (time24: string) => {
    if (selectedTimes.includes(time24)) {
      if (selectedTimes.length === 1) {
        Alert.alert(
          t('medicines.detail.alert.reminderRequiredTitle'),
          t('medicines.detail.alert.keepOneTime')
        );
        return;
      }
      setSelectedTimes(selectedTimes.filter((t) => t !== time24));
    } else {
      setSelectedTimes([...selectedTimes, time24].sort());
    }
  };

  const handleRemoveTime = (time24: string) => {
    if (selectedTimes.length <= 1) {
      Alert.alert(
        t('medicines.detail.alert.reminderRequiredTitle'),
        t('medicines.detail.alert.keepOneTime')
      );
      return;
    }
    setSelectedTimes(selectedTimes.filter((t) => t !== time24));
  };

  const handleAddCustomTime = (time24: string) => {
    if (selectedTimes.includes(time24)) {
      Alert.alert(
        t('medicines.detail.alert.alreadyAddedTitle'),
        t('medicines.detail.alert.alreadyAddedBody', { time: formatTime12Hour(time24) })
      );
      return;
    }
    setSelectedTimes([...selectedTimes, time24].sort());
  };

  const handleActivate = async () => {
    if (!medicationId) return;
    if (selectedTimes.length === 0) {
      Alert.alert(
        t('medicines.detail.alert.chooseTimeTitle'),
        t('medicines.detail.alert.chooseTimeBody')
      );
      return;
    }

    setSubmittingAction(true);
    try {
      await medicationService.activateMedication(medicationId, {
        reminderTimes: selectedTimes,
      });

      // Synchronize alarms for activated medication
      cancelAllRemindersForMedication(medicationId).catch(() => {});
      for (const t of selectedTimes) {
        scheduleMedicationReminder(
          medicationId,
          medication?.nameAsWritten || 'Medication',
          t,
          medication?.prescribedInstructions || undefined
        ).catch(() => {});
      }

      setShowScheduleForm(false);
      await loadMedication(medicationId);
      onStatusChanged?.();
      Alert.alert(
        t('medicines.detail.alert.activatedTitle'),
        t('medicines.detail.alert.activatedBody')
      );
    } catch (err: any) {
      Alert.alert(
        t('medicines.detail.alert.activationFailed'),
        err?.message || t('medicines.detail.alert.activateFallback')
      );
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!medicationId) return;
    if (selectedTimes.length === 0) {
      Alert.alert(
        t('medicines.detail.alert.chooseTimeTitle'),
        t('medicines.detail.alert.selectTimeBody')
      );
      return;
    }

    setSubmittingAction(true);
    try {
      await medicationService.updateReminderPreferences(medicationId, {
        reminderTimes: selectedTimes,
      });

      // Reschedule alarms for new reminder times
      cancelAllRemindersForMedication(medicationId).catch(() => {});
      for (const t of selectedTimes) {
        scheduleMedicationReminder(
          medicationId,
          medication?.nameAsWritten || 'Medication',
          t,
          medication?.prescribedInstructions || undefined
        ).catch(() => {});
      }

      setShowScheduleForm(false);
      await loadMedication(medicationId);
      onStatusChanged?.();
      Alert.alert(
        t('medicines.detail.alert.updatedTitle'),
        t('medicines.detail.alert.updatedBody')
      );
    } catch (err: any) {
      Alert.alert(
        t('medicines.detail.alert.updateFailed'),
        err?.message || t('medicines.detail.alert.updateFallback')
      );
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDoseAction = async (
    doseLogId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes?: number
  ) => {
    if (!medicationId) return;
    setActionDoseId(doseLogId);
    try {
      await medicationService.recordDoseAction(doseLogId, {
        action,
        snoozeMinutes,
      });

      if (action === 'SNOOZED' && medication) {
        scheduleSnoozeReminder(
          medication.id,
          medication.nameAsWritten,
          snoozeMinutes || 15
        ).catch(() => {});
      }

      await loadMedication(medicationId);
      onStatusChanged?.();
    } catch (err: any) {
      Alert.alert(
        t('medicines.detail.alert.actionFailed'),
        err?.message || t('medicines.detail.alert.doseFallback')
      );
    } finally {
      setActionDoseId(null);
    }
  };

  const handlePause = async () => {
    if (!medicationId) return;
    Alert.alert(
      t('medicines.detail.alert.pauseTitle'),
      t('medicines.detail.alert.pauseBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('medicines.detail.alert.pause'),
          style: 'destructive',
          onPress: async () => {
            setSubmittingAction(true);
            try {
              await medicationService.pauseMedication(medicationId);
              cancelAllRemindersForMedication(medicationId).catch(() => {});
              await loadMedication(medicationId);
              onStatusChanged?.();
            } catch (err: any) {
              Alert.alert(
                t('medicines.detail.alert.pauseFailed'),
                err?.message || t('medicines.detail.alert.pauseFallback')
              );
            } finally {
              setSubmittingAction(false);
            }
          },
        },
      ]
    );
  };

  const handleResume = async () => {
    if (!medicationId) return;
    setSubmittingAction(true);
    try {
      await medicationService.resumeMedication(medicationId);
      for (const t of selectedTimes) {
        scheduleMedicationReminder(
          medicationId,
          medication?.nameAsWritten || 'Medication',
          t,
          medication?.prescribedInstructions || undefined
        ).catch(() => {});
      }
      await loadMedication(medicationId);
      onStatusChanged?.();
      Alert.alert(
        t('medicines.detail.alert.resumedTitle'),
        t('medicines.detail.alert.resumedBody')
      );
    } catch (err: any) {
      Alert.alert(
        t('medicines.detail.alert.resumeFailed'),
        err?.message || t('medicines.detail.alert.resumeFallback')
      );
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleComplete = async () => {
    if (!medicationId) return;
    Alert.alert(
      t('medicines.detail.alert.completeTitle'),
      t('medicines.detail.alert.completeBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('medicines.detail.markCompleted'),
          onPress: async () => {
            setSubmittingAction(true);
            try {
              await medicationService.completeMedication(medicationId);
              cancelAllRemindersForMedication(medicationId).catch(() => {});
              await loadMedication(medicationId);
              onStatusChanged?.();
            } catch (err: any) {
              Alert.alert(
                t('medicines.detail.alert.actionFailed'),
                err?.message || t('medicines.detail.alert.completeFallback')
              );
            } finally {
              setSubmittingAction(false);
            }
          },
        },
      ]
    );
  };

  const handleDiscontinueConfirm = async () => {
    if (!medicationId) return;
    setSubmittingAction(true);
    try {
      await medicationService.discontinueMedication(medicationId, discontinueReason);
      cancelAllRemindersForMedication(medicationId).catch(() => {});
      setShowDiscontinuePrompt(false);
      await loadMedication(medicationId);
      onStatusChanged?.();
      Alert.alert(
        t('medicines.detail.alert.discontinuedTitle'),
        t('medicines.detail.alert.discontinuedBody')
      );
    } catch (err: any) {
      Alert.alert(
        t('medicines.detail.alert.actionFailed'),
        err?.message || t('medicines.detail.alert.discontinueFallback')
      );
    } finally {
      setSubmittingAction(false);
    }
  };

  return {
    loading,
    error,
    medication,
    loadMedication,
    loadingDoc,
    docError,
    documentUrlInfo,
    showDocumentPreview,
    setShowDocumentPreview,
    handleOpenDocument,
    showScheduleForm,
    setShowScheduleForm,
    selectedTimes,
    submittingAction,
    handleSelectFrequency,
    handleTogglePresetTime,
    handleRemoveTime,
    handleAddCustomTime,
    handleActivate,
    handleUpdateSchedule,
    actionDoseId,
    handleDoseAction,
    handlePause,
    handleResume,
    handleComplete,
    showDiscontinuePrompt,
    setShowDiscontinuePrompt,
    discontinueReason,
    setDiscontinueReason,
    handleDiscontinueConfirm,
  };
}
