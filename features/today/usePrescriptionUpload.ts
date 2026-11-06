import { useState } from 'react';
import { Alert } from 'react-native';
import { PickedFile } from '../../services/documents/file-validator';
import {
  MobileDocumentUploadService,
  ExtractionWaitTimeoutError,
} from '../../services/documents/upload-service';
import { UserSession } from '../../services/auth/auth-service';
import { api } from '../../services/api/client';
import { medicationService } from '../../services/medications/medication-service';
import { medicationStore } from '../../services/medications/medication-store';
import { buildMedicationRecord } from './utils';
import { confirmPrescriptionDraft } from './prescription-confirmation';
import { t } from '../../design/strings';

export function usePrescriptionUpload({
  session,
  onPrescriptionChanged,
}: {
  session: UserSession | null;
  onPrescriptionChanged: () => void;
}) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [activeReviewData, setActiveReviewData] = useState<any | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadService = new MobileDocumentUploadService(api);

  const handleFileSelected = async (file: PickedFile) => {
    setIsProcessing(true);
    setProcessingStatus(t('prescription.uploading'));
    setConfirmationNotice(null);
    setUploadError(null);
    let slowNoticeTimer: ReturnType<typeof setTimeout> | undefined;

    try {
      const { document, job } = await uploadService.uploadAndExtractPrescription(file);

      setProcessingStatus(t('prescription.extracting'));
      // The AI reader runs as a separate service that sleeps when idle; the first document after a
      // quiet period waits 2-3 minutes for it to start.
      slowNoticeTimer = setTimeout(() => {
        setProcessingStatus(t('prescription.slowReader'));
      }, 15_000);

      const completedJob = await uploadService.pollJobUntilComplete(job.id, {
        maxAttempts: 120,
        intervalMs: 2000,
      });

      if (completedJob.status === 'FAILED') {
        // The server's own failure text is not shown; the patient sees a generic message.
        throw new Error(t('prescription.extractionFailed'));
      }

      const signedUrl = await uploadService.getPreviewUrl(document.id);

      setActiveReviewData({
        jobId: completedJob.id,
        documentId: document.id,
        documentFilename: document.originalFilename,
        documentMimeType: document.mimeType,
        signedUrl,
        localUri: file.uri,
        extractedPayload: completedJob.extractedPayload,
      });
    } catch (err: unknown) {
      if (err instanceof ExtractionWaitTimeoutError) {
        const msg = t('prescription.stillReading');
        setUploadError(msg);
        Alert.alert(t('prescription.stillReadingTitle'), msg);
      } else {
        // Error text from the network or server is not shown raw; the patient sees a generic message.
        const msg = err instanceof Error && err.message === t('prescription.extractionFailed')
          ? err.message
          : t('prescription.uploadFailed');
        setUploadError(msg);
        Alert.alert(t('prescription.uploadErrorTitle'), msg);
      }
    } finally {
      if (slowNoticeTimer) clearTimeout(slowNoticeTimer);
      setIsProcessing(false);
    }
  };

  const handleConfirmPrescription = async (reviewPayload: any) => {
    if (!activeReviewData) return;

    const outcome = await confirmPrescriptionDraft({
      payload: reviewPayload,
      confirmOnServer: () => uploadService.confirmPrescription(activeReviewData.jobId, reviewPayload),
      fetchServerMedicines: () => medicationService.listMedications(),
      addActiveMedicine: async (m, serverMedicine) => {
        const newMed = buildMedicationRecord(m, reviewPayload, session?.patientProfileId, serverMedicine);
        await medicationStore.addMedication(newMed);
      },
    });

    if (!outcome.ok) {
      // Keep the review draft open so the patient can retry; the review screen shows this message.
      throw new Error(outcome.message);
    }

    const activeCount = outcome.activeCount;
    setConfirmationNotice(t('prescription.confirmed', { count: activeCount }));
    setActiveReviewData(null);
    onPrescriptionChanged();
  };

  return {
    isProcessing,
    processingStatus,
    activeReviewData,
    setActiveReviewData,
    confirmationNotice,
    setConfirmationNotice,
    uploadError,
    handleFileSelected,
    handleConfirmPrescription,
  };
}
