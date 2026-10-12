import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { colors, spacing, typography, borderRadius } from '../../theme/index';
import { DocumentPickerModal } from '../../components/DocumentPickerModal';
import { ReviewPrescriptionScreen } from '../../features/prescriptions/ReviewPrescriptionScreen';
import { PickedFile } from '../../services/documents/file-validator';
import { MobileDocumentUploadService } from '../../services/documents/upload-service';
import { api } from '../../services/api/client';

export default function HomeScreen() {
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [activeReviewData, setActiveReviewData] = useState<any | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const uploadService = new MobileDocumentUploadService(api);

  const handleFileSelected = async (file: PickedFile) => {
    setIsProcessing(true);
    setProcessingStatus('Uploading document securely with SHA-256 verification...');
    setConfirmationNotice(null);

    try {
      // 1. Upload & trigger extraction job
      const { document, job } = await uploadService.uploadAndExtractPrescription(file);

      setProcessingStatus('Extracting prescription data (Mock AI Provider)...');

      // 2. Poll job until completion
      const completedJob = await uploadService.pollJobUntilComplete(job.id, {
        maxAttempts: 15,
        intervalMs: 800,
      });

      if (completedJob.status === 'FAILED') {
        throw new Error(completedJob.errorMessage || 'AI extraction failed');
      }

      // 3. Retrieve short-lived signed preview URL
      const signedUrl = await uploadService.getPreviewUrl(document.id);

      setActiveReviewData({
        jobId: completedJob.id,
        documentId: document.id,
        documentFilename: document.originalFilename,
        documentMimeType: document.mimeType,
        signedUrl,
        extractedPayload: completedJob.extractedPayload,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      Alert.alert('Upload / Extraction Error', msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPrescription = async (reviewPayload: any) => {
    if (!activeReviewData) return;

    await uploadService.confirmPrescription(activeReviewData.jobId, reviewPayload);

    const medCount = reviewPayload.medicines?.length || 0;
    setConfirmationNotice(
      `Prescription confirmed successfully! ${medCount} medication(s) saved to verified clinical timeline.`
    );
    setActiveReviewData(null);
  };

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.subGreeting}>Here is your health overview for today</Text>
      </View>

      {confirmationNotice && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ {confirmationNotice}</Text>
        </View>
      )}

      {/* Processing State Card */}
      {isProcessing && (
        <Card style={styles.card}>
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[typography.body, { marginLeft: spacing.sm, fontWeight: '600' }]}>
              {processingStatus}
            </Text>
          </View>
        </Card>
      )}

      {/* Today's Schedule Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={typography.h3}>Today's Regimen</Text>
          <Badge label="0 Scheduled" variant="neutral" />
        </View>
        <Text style={[typography.bodyMuted, styles.cardDescription]}>
          No medications currently scheduled for today. You can upload a prescription to have your medicines organized.
        </Text>
        <Button
          title="Upload Prescription"
          variant="primary"
          onPress={() => setIsPickerVisible(true)}
          disabled={isProcessing}
        />
      </Card>

      {/* Medical Timeline Shortcut Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={typography.h3}>Recent Timeline</Text>
          <Badge label="Up to date" variant="info" />
        </View>
        <Text style={[typography.bodyMuted, styles.cardDescription]}>
          Your verified clinical records and prescriptions will appear chronologically in your medical timeline.
        </Text>
      </Card>

      {/* Privacy Notice Card */}
      <Card variant="muted" style={styles.privacyCard}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          Your health records are stored privately and encrypted. The app never makes assumptions or alters your medical history without your review.
        </Text>
      </Card>

      {/* Document Picker Modal */}
      <DocumentPickerModal
        visible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onFileSelected={handleFileSelected}
      />

      {/* Interactive Review Modal */}
      <Modal
        visible={Boolean(activeReviewData)}
        animationType="slide"
        onRequestClose={() => setActiveReviewData(null)}
      >
        {activeReviewData && (
          <ReviewPrescriptionScreen
            jobId={activeReviewData.jobId}
            documentId={activeReviewData.documentId}
            documentFilename={activeReviewData.documentFilename}
            documentMimeType={activeReviewData.documentMimeType}
            signedUrl={activeReviewData.signedUrl}
            initialExtraction={activeReviewData.extractedPayload}
            onConfirm={handleConfirmPrescription}
            onDiscard={() => setActiveReviewData(null)}
          />
        )}
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h1,
  },
  subGreeting: {
    ...typography.bodyMuted,
    marginTop: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardDescription: {
    marginBottom: spacing.md,
  },
  privacyCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  successBanner: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
});
