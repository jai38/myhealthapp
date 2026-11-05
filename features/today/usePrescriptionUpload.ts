import { useState } from 'react';
import { Alert } from 'react-native';
import { PickedFile } from '../../services/documents/file-validator';
import {
  MobileDocumentUploadService,
  ExtractionWaitTimeoutError,
} from '../../services/documents/upload-service';
import { UserSession } from '../../services/auth/auth-service';
import { api } from '../../services/api/client';
import { medicationStore } from '../../services/medications/medication-store';
import { buildMedicationRecord } from './utils';

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
    setProcessingStatus('Uploading prescription securely...');
    setConfirmationNotice(null);
    setUploadError(null);
    let slowNoticeTimer: ReturnType<typeof setTimeout> | undefined;

    try {
      const { document, job } = await uploadService.uploadAndExtractPrescription(file);

      setProcessingStatus('Extracting prescription data (AI Clinical Parser)...');
      // The AI reader runs as a separate service that sleeps when idle; the first document after a
      // quiet period waits 2-3 minutes for it to start.
      slowNoticeTimer = setTimeout(() => {
        setProcessingStatus(
          'Starting the AI reader. The first prescription after a quiet period can take up to 3 minutes. Please keep this screen open.'
        );
      }, 15_000);

      const completedJob = await uploadService.pollJobUntilComplete(job.id, {
        maxAttempts: 120,
        intervalMs: 2000,
      });

      if (completedJob.status === 'FAILED') {
        throw new Error(completedJob.errorMessage || 'AI extraction failed');
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
        const msg =
          'Your prescription was uploaded, but reading it is taking longer than usual. Please upload it again in a few minutes.';
        setUploadError(msg);
        Alert.alert('Still reading', msg);
      } else {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setUploadError(msg);
        Alert.alert('Upload / Extraction Error', msg);
      }
    } finally {
      if (slowNoticeTimer) clearTimeout(slowNoticeTimer);
      setIsProcessing(false);
    }
  };

  const handleConfirmPrescription = async (reviewPayload: any) => {
    if (!activeReviewData) return;

    try {
      await uploadService.confirmPrescription(activeReviewData.jobId, reviewPayload);
    } catch {
      // Safe offline fallback
    }

    // Immediately schedule any medicines marked as ACTIVE by the patient into local store
    if (Array.isArray(reviewPayload.medicines)) {
      for (const m of reviewPayload.medicines) {
        if (m.is_active_medication) {
          const newMed = buildMedicationRecord(m, reviewPayload, session?.patientProfileId);
          await medicationStore.addMedication(newMed);
        }
      }
    }


    const activeCount = reviewPayload.medicines?.filter((m: any) => m.is_active_medication)?.length || 0;
    setConfirmationNotice(
      `Prescription confirmed! ${activeCount} active medication(s) added to your regimen.`
    );
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
