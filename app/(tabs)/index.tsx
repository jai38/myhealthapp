import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/index';
import { HorizontalDateStrip } from '../../components/HorizontalDateStrip';
import { AdherenceDonut } from '../../components/AdherenceDonut';
import { AiOmnibar } from '../../components/AiOmnibar';
import { DocumentPickerModal } from '../../components/DocumentPickerModal';
import { ReviewPrescriptionScreen } from '../../features/prescriptions/ReviewPrescriptionScreen';
import { ManualAddMedicationModal } from '../../features/medications/ManualAddMedicationModal';
import { AccountModal } from '../../features/account/AccountModal';
import { PickedFile } from '../../services/documents/file-validator';
import { MobileDocumentUploadService } from '../../services/documents/upload-service';
import { authService, UserSession } from '../../services/auth/auth-service';
import { api } from '../../services/api/client';
import {
  medicationService,
  MedicationRecord,
  DoseLog,
} from '../../services/medications/medication-service';
import {
  timelineService,
  TimelineEvent,
  formatMedicalEventDate,
} from '../../services/timeline/timeline-service';
import { scheduleSnoozeReminder } from '../../services/notifications/notification-service';

export default function HomeScreen() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(authService.getSession());
  const [isAccountModalVisible, setIsAccountModalVisible] = useState<boolean>(false);
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [activeReviewData, setActiveReviewData] = useState<any | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isManualAddVisible, setIsManualAddVisible] = useState<boolean>(false);

  // Live Performance & Telemetry Data
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [todayDoses, setTodayDoses] = useState<DoseLog[]>([]);
  const [recentEvents, setRecentEvents] = useState<TimelineEvent[]>([]);
  const [totalRecordsCount, setTotalRecordsCount] = useState<number>(0);
  const [actionDoseId, setActionDoseId] = useState<string | null>(null);

  const uploadService = new MobileDocumentUploadService(api);

  // Load telemetry metrics
  const loadDashboardData = useCallback(async () => {
    try {
      const [allMeds, doses, timelineRes] = await Promise.all([
        medicationService.listMedications().catch(() => []),
        medicationService.getDoseOccurrences().catch(() => []),
        timelineService.fetchTimeline({ limit: 3 }).catch(() => ({ data: [], pagination: { totalCount: 0 } })),
      ]);
      setMedications(allMeds);
      setTodayDoses(doses);
      setRecentEvents(timelineRes.data);
      setTotalRecordsCount(timelineRes.pagination.totalCount);
    } catch {
      // Keep existing state if offline
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

  const handleFileSelected = async (file: PickedFile) => {
    setIsProcessing(true);
    setProcessingStatus('Uploading document securely with SHA-256 verification...');
    setConfirmationNotice(null);
    setUploadError(null);

    try {
      const { document, job } = await uploadService.uploadAndExtractPrescription(file);

      setProcessingStatus('Extracting prescription data (Mock AI Provider)...');

      const completedJob = await uploadService.pollJobUntilComplete(job.id, {
        maxAttempts: 15,
        intervalMs: 800,
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
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(msg);
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
    loadDashboardData();
  };

  // Dose actions direct from dashboard
  const handleRecordDoseAction = async (
    doseId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes?: number
  ) => {
    setActionDoseId(doseId);
    try {
      await medicationService.recordDoseAction(doseId, {
        action,
        snoozeMinutes,
      });

      if (action === 'SNOOZED') {
        const dose = todayDoses.find((d) => d.id === doseId);
        const med = medications.find((m) => m.id === dose?.medicationId);
        if (med) {
          scheduleSnoozeReminder(med.id, med.nameAsWritten, snoozeMinutes || 15).catch(() => {});
        }
      }

      setTodayDoses((prev) =>
        prev.map((d) =>
          d.id === doseId ? { ...d, status: action, actionTime: new Date().toISOString() } : d
        )
      );
    } catch (err: any) {
      Alert.alert('Action Failed', err?.message || 'Could not record dose action.');
    } finally {
      setActionDoseId(null);
    }
  };

  // Derived metrics
  const totalDosesToday = todayDoses.length;
  const takenDosesToday = todayDoses.filter((d) => d.status === 'TAKEN').length;
  const actionableDoses = todayDoses.filter(
    (d) => d.status === 'PENDING' || d.status === 'SNOOZED'
  );
  const nextDose = actionableDoses[0];
  const nextMed = nextDose ? medications.find((m) => m.id === nextDose.medicationId) : null;
  const nextDoseDate = nextDose ? new Date(nextDose.scheduledTime) : null;
  const nextTimeStr = nextDoseDate
    ? nextDoseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const adherenceTodayPct = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 100;
  const activeMedsCount = medications.filter((m) => m.status === 'ACTIVE').length;

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  if (activeReviewData) {
    return (
      <ReviewPrescriptionScreen
        jobId={activeReviewData.jobId}
        documentId={activeReviewData.documentId}
        documentFilename={activeReviewData.documentFilename}
        documentMimeType={activeReviewData.documentMimeType}
        signedUrl={activeReviewData.signedUrl}
        localUri={activeReviewData.localUri}
        initialExtraction={activeReviewData.extractedPayload}
        onConfirm={handleConfirmPrescription}
        onDiscard={() => setActiveReviewData(null)}
      />
    );
  }

  return (
    <ScreenLayout>
      {/* 1. HEALTH BASELINE OS HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <Text style={styles.dateText}>{todayDateStr}</Text>
            <View style={styles.streakPill}>
              <Text style={styles.streakPillText}>🔥 7 DAYS</Text>
            </View>
          </View>
          <Text style={styles.greeting}>
            {session?.fullName ? `Good Morning, ${session.fullName.split(' ')[0]}` : 'Good Morning'}
          </Text>
          <Text style={styles.subGreeting}>Daily clinical performance & active vitals</Text>
        </View>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => setIsAccountModalVisible(true)}
          accessibilityLabel="Open Patient Account Settings"
          activeOpacity={0.8}
        >
          <Text style={styles.avatarButtonText}>
            {session?.fullName
              ? session.fullName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : '⚡'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Banners */}
      {confirmationNotice && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ {confirmationNotice}</Text>
        </View>
      )}

      {uploadError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {uploadError}</Text>
        </View>
      )}

      {isProcessing && (
        <Card style={styles.processingCard}>
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.accentCoral} />
            <Text style={styles.processingText}>{processingStatus}</Text>
          </View>
        </Card>
      )}

      {/* 2. HORIZONTAL WEEKDAY ADHERENCE CAROUSEL (Ronald Olsen signature) */}
      <HorizontalDateStrip onSelectDate={() => router.push('/(tabs)/timeline')} />

      {/* 3. AI PRESCRIPTION SCANNER & OMNIBAR (Baseline AI signature) */}
      <AiOmnibar
        onScanPress={() => setIsPickerVisible(true)}
        onSubmitPrompt={() => router.push('/(tabs)/medications')}
      />

      {/* 4. HERO ADHERENCE DONUT TARGET (Baseline AI + Ronald Olsen signature) */}
      <AdherenceDonut
        percentage={adherenceTodayPct}
        takenCount={takenDosesToday}
        totalCount={totalDosesToday}
      />

      {/* 5. 1-TAP UPCOMING DOSE CARD (Direct 1-Tap Execution) */}
      {nextDose && nextMed ? (
        <View style={styles.heroDoseCard}>
          <View style={styles.heroDoseHeader}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroDoseBadge}>
                <Text style={styles.heroDoseBadgeText}>NEXT UPCOMING DOSE</Text>
              </View>
              {nextDose.status === 'SNOOZED' && (
                <View style={styles.heroSnoozedBadge}>
                  <Text style={styles.heroSnoozedText}>⏰ SNOOZED</Text>
                </View>
              )}
            </View>
            <View style={styles.heroTimeChip}>
              <Text style={styles.heroTimeChipText}>{nextTimeStr}</Text>
            </View>
          </View>

          <Text style={styles.heroMedName}>{nextMed.nameAsWritten}</Text>
          <Text style={styles.heroMedMeta}>
            {nextMed.strength ? `${nextMed.strength} • ` : ''}Scheduled at {nextTimeStr} • Daily Routine
          </Text>

          {nextMed.prescribedInstructions ? (
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsText}>
                💡 {nextMed.prescribedInstructions}
              </Text>
            </View>
          ) : null}

          {/* Quick 1-Tap Action Row */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={[styles.heroActionBtn, styles.heroActionSkip]}
              onPress={() => handleRecordDoseAction(nextDose.id, 'SKIPPED')}
              disabled={actionDoseId === nextDose.id}
              activeOpacity={0.8}
            >
              <Text style={styles.heroActionSkipText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.heroActionBtn, styles.heroActionSnooze]}
              onPress={() => handleRecordDoseAction(nextDose.id, 'SNOOZED', 15)}
              disabled={actionDoseId === nextDose.id}
              activeOpacity={0.8}
            >
              <Text style={styles.heroActionSnoozeText}>Snooze 15m</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.heroActionBtn, styles.heroActionTaken]}
              onPress={() => handleRecordDoseAction(nextDose.id, 'TAKEN')}
              disabled={actionDoseId === nextDose.id}
              activeOpacity={0.8}
            >
              <Text style={styles.heroActionTakenText}>Taken ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : totalDosesToday > 0 && actionableDoses.length === 0 ? (
        <View style={styles.streakCelebrationCard}>
          <View style={styles.streakRow}>
            <Text style={styles.streakIcon}>🎯</Text>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.streakTitle}>All Doses Logged Today!</Text>
              <Text style={styles.streakSub}>
                100% adherence logged on time. Your daily health streak is protected!
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* 6. THREE-TILE TELEMETRY STATS MATRIX */}
      <View style={styles.metricsGrid}>
        {/* Adherence Rate */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(tabs)/medications')}
          activeOpacity={0.85}
        >
          <View style={[styles.metricIconBox, { backgroundColor: colors.accentMintLight }]}>
            <Text style={styles.metricIcon}>⚡</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.accentMint }]}>{adherenceTodayPct}%</Text>
          <Text style={styles.metricLabel}>Daily Adherence</Text>
          <View style={styles.metricFooter}>
            <Text style={styles.metricSubText}>
              {takenDosesToday}/{totalDosesToday || 0} Doses
            </Text>
          </View>
        </TouchableOpacity>

        {/* Active Regimens */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(tabs)/medications')}
          activeOpacity={0.85}
        >
          <View style={[styles.metricIconBox, { backgroundColor: colors.accentCyanLight }]}>
            <Text style={styles.metricIcon}>💊</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.accentCyan }]}>
            {activeMedsCount} Active
          </Text>
          <Text style={styles.metricLabel}>Regimens</Text>
          <View style={styles.metricFooter}>
            <Text style={styles.metricSubText}>Active Prescriptions</Text>
          </View>
        </TouchableOpacity>

        {/* Encrypted Vault */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(tabs)/reports')}
          activeOpacity={0.85}
        >
          <View style={[styles.metricIconBox, { backgroundColor: colors.accentCustardLight }]}>
            <Text style={styles.metricIcon}>🛡️</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.accentCustard }]}>
            {totalRecordsCount} Recs
          </Text>
          <Text style={styles.metricLabel}>Health Vault</Text>
          <View style={styles.metricFooter}>
            <Text style={styles.metricSubText}>SHA-256 Verified</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 7. THREE-TILE ACTION HUB */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.sectionSub}>Instant tools for prescriptions & records</Text>
      </View>

      <View style={styles.actionHubGrid}>
        {/* Tile 1: AI Prescription Scanner */}
        <TouchableOpacity
          style={styles.actionHubTile}
          onPress={() => setIsPickerVisible(true)}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <View style={[styles.actionHubIconBadge, { backgroundColor: colors.accentCoralLight }]}>
            <Text style={styles.actionHubEmoji}>📸</Text>
          </View>
          <Text style={styles.actionHubTitle}>Scan Prescription</Text>
          <Text style={styles.actionHubDesc}>AI OCR extraction & automated dose schedules</Text>
          <View style={[styles.actionHubTag, { backgroundColor: colors.accentCoralLight }]}>
            <Text style={[styles.actionHubTagText, { color: colors.accentCoral }]}>Instant AI</Text>
          </View>
        </TouchableOpacity>

        {/* Tile 2: Add Medication */}
        <TouchableOpacity
          style={styles.actionHubTile}
          onPress={() => setIsManualAddVisible(true)}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <View style={[styles.actionHubIconBadge, { backgroundColor: colors.accentCyanLight }]}>
            <Text style={styles.actionHubEmoji}>💊</Text>
          </View>
          <Text style={styles.actionHubTitle}>Log Medication</Text>
          <Text style={styles.actionHubDesc}>Custom timing, custom dose alarms & strength</Text>
          <View style={[styles.actionHubTag, { backgroundColor: colors.accentCyanLight }]}>
            <Text style={[styles.actionHubTagText, { color: colors.accentCyan }]}>+ Manual Add</Text>
          </View>
        </TouchableOpacity>

        {/* Tile 3: Vault Export */}
        <TouchableOpacity
          style={styles.actionHubTile}
          onPress={() => router.push('/(tabs)/reports')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionHubIconBadge, { backgroundColor: colors.accentCustardLight }]}>
            <Text style={styles.actionHubEmoji}>📄</Text>
          </View>
          <Text style={styles.actionHubTitle}>Doctor PDF Export</Text>
          <Text style={styles.actionHubDesc}>One-click shareable verified medical summary</Text>
          <View style={[styles.actionHubTag, { backgroundColor: colors.accentCustardLight }]}>
            <Text style={[styles.actionHubTagText, { color: colors.accentCustard }]}>Clinical PDF</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 8. LIVE RECENT ACTIVITY STREAM */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Activity Stream</Text>
          <Text style={styles.sectionSub}>Verified consultations, tests & records</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/timeline')}>
          <Text style={styles.viewAllLink}>View All ›</Text>
        </TouchableOpacity>
      </View>

      {recentEvents.length === 0 ? (
        <Card variant="muted" style={styles.emptyFeedCard}>
          <Text style={styles.emptyFeedEmoji}>📋</Text>
          <Text style={styles.emptyFeedTitle}>No Activity Recorded Yet</Text>
          <Text style={styles.emptyFeedText}>
            When you scan a prescription or complete a doctor consultation, verified chronological events will appear here.
          </Text>
        </Card>
      ) : (
        recentEvents.slice(0, 3).map((event) => {
          const dateInfo = formatMedicalEventDate(
            event.eventDate,
            event.datePrecision,
            event.dateIsUncertain
          );
          return (
            <TouchableOpacity
              key={event.id}
              style={styles.activityCard}
              onPress={() => router.push('/(tabs)/timeline')}
              activeOpacity={0.85}
            >
              <View style={styles.activityTopRow}>
                <View style={styles.activityBadgeRow}>
                  <Badge label={event.eventType} variant="info" />
                  <Text style={styles.activityDate}>{dateInfo.formatted}</Text>
                </View>
                <View style={styles.verifiedPill}>
                  <Text style={styles.verifiedPillText}>✓ Verified</Text>
                </View>
              </View>
              <Text style={styles.activityTitle} numberOfLines={1}>
                {event.title}
              </Text>
              <Text style={styles.activitySummary} numberOfLines={2}>
                {event.summary}
              </Text>
            </TouchableOpacity>
          );
        })
      )}

      {/* 9. ADVANCED ENCRYPTION & PRIVACY SHIELD FOOTER */}
      <View style={styles.securityFooter}>
        <Text style={styles.securityShieldIcon}>🔒</Text>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.securityTitle}>Encrypted Health Vault</Text>
          <Text style={styles.securityText}>
            Your medical records and doses are protected with local and cloud encryption. No data is modified without your explicit clinical review.
          </Text>
        </View>
      </View>

      {/* Modals */}
      <DocumentPickerModal
        visible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onFileSelected={handleFileSelected}
      />

      <ManualAddMedicationModal
        visible={isManualAddVisible}
        onClose={() => setIsManualAddVisible(false)}
        onMedicationCreated={() => {
          setConfirmationNotice('Medication added successfully and scheduled for reminders!');
          loadDashboardData();
        }}
      />

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
            localUri={activeReviewData.localUri}
            initialExtraction={activeReviewData.extractedPayload}
            onConfirm={handleConfirmPrescription}
            onDiscard={() => setActiveReviewData(null)}
          />
        )}
      </Modal>

      <AccountModal
        visible={isAccountModalVisible}
        onClose={() => setIsAccountModalVisible(false)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  header: {
    flex: 1,
    marginRight: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  streakPill: {
    backgroundColor: colors.accentCoralLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  streakPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentCoral,
    letterSpacing: 0.5,
  },
  greeting: {
    ...typography.h1,
    fontSize: 26,
    lineHeight: 32,
    color: colors.textPrimary,
  },
  subGreeting: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
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
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '700',
  },
  processingCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.accentCoral,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  processingText: {
    ...typography.body,
    fontSize: 14,
    marginLeft: spacing.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // 3-Tile Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 16px rgba(17, 20, 24, 0.03)',
        } as any)
      : shadows.sm),
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  metricIcon: {
    fontSize: 16,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricFooter: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  metricSubText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },

  // Hero Dose Card
  heroDoseCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 6px 20px rgba(17, 20, 24, 0.04)',
        } as any)
      : shadows.sm),
  },
  heroDoseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDoseBadge: {
    backgroundColor: colors.accentCoralLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  heroDoseBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentCoral,
    letterSpacing: 0.5,
  },
  heroSnoozedBadge: {
    backgroundColor: colors.accentCustardLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  heroSnoozedText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentCustard,
  },
  heroTimeChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  heroTimeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroMedName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  heroMedMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  instructionsBox: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  instructionsText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionSkip: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  heroActionSkipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  heroActionSnooze: {
    backgroundColor: colors.accentCustardLight,
    borderWidth: 1,
    borderColor: 'rgba(202, 138, 4, 0.2)',
  },
  heroActionSnoozeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentCustard,
  },
  heroActionTaken: {
    backgroundColor: colors.primary,
  },
  heroActionTakenText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textInverse,
  },

  // Streak celebration
  streakCelebrationCard: {
    backgroundColor: colors.accentMintLight,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 28,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accentMint,
  },
  streakSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Action Hub
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionHubGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  actionHubTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 16px rgba(17, 20, 24, 0.03)',
        } as any)
      : shadows.sm),
  },
  actionHubIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionHubEmoji: {
    fontSize: 18,
  },
  actionHubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  actionHubDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
    marginBottom: spacing.sm,
  },
  actionHubTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  actionHubTagText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Activity Stream Section
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentCyan,
  },
  emptyFeedCard: {
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyFeedEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  emptyFeedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyFeedText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 14px rgba(17, 20, 24, 0.03)',
        } as any)
      : shadows.sm),
  },
  activityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  activityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  activityDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  verifiedPill: {
    backgroundColor: colors.accentMintLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentMint,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  activitySummary: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Security Shield Footer
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  securityShieldIcon: {
    fontSize: 24,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  securityText: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
});

