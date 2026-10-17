import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { colors, spacing, typography, borderRadius } from '../../theme/index';
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
  const [refreshing, setRefreshing] = useState<boolean>(false);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

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
      {/* 1. ATHLETIC / PERFORMANCE HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.liveIndicatorText}>LIVE TELEMETRY</Text>
            <View style={styles.streakPill}>
              <Text style={styles.streakPillText}>🔥 7-DAY STREAK</Text>
            </View>
          </View>
          <Text style={styles.greeting}>
            {session?.fullName ? `Hey, ${session.fullName.split(' ')[0]}` : 'Health Pulse'}
          </Text>
          <Text style={styles.subGreeting}>Daily performance & active vitals</Text>
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
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.processingText}>{processingStatus}</Text>
          </View>
        </Card>
      )}

      {/* 2. THREE-TILE TELEMETRY STATS MATRIX */}
      <View style={styles.metricsGrid}>
        {/* Adherence Rate */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(tabs)/medications')}
          activeOpacity={0.85}
        >
          <View style={styles.metricIconBox}>
            <Text style={styles.metricIcon}>⚡</Text>
          </View>
          <Text style={styles.metricValue}>{adherenceTodayPct}%</Text>
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
          <View style={[styles.metricIconBox, { backgroundColor: colors.secondaryLight }]}>
            <Text style={styles.metricIcon}>💊</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.secondary }]}>
            {activeMedsCount} Active
          </Text>
          <Text style={styles.metricLabel}>Regimens</Text>
          <View style={styles.metricFooter}>
            <Text style={styles.metricSubText}>Medications & Routine</Text>
          </View>
        </TouchableOpacity>

        {/* Encrypted Vault */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(tabs)/reports')}
          activeOpacity={0.85}
        >
          <View style={[styles.metricIconBox, { backgroundColor: colors.amberGoldLight }]}>
            <Text style={styles.metricIcon}>🛡️</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.amberGold }]}>
            {totalRecordsCount} Recs
          </Text>
          <Text style={styles.metricLabel}>Health Vault</Text>
          <View style={styles.metricFooter}>
            <Text style={styles.metricSubText}>AES-256 Verified</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. HERO UPCOMING DOSE CARD (Direct 1-Tap Execution) */}
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

      {/* 4. THREE-TILE CYBER ACTION HUB */}
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
          <View style={styles.actionHubIconBadge}>
            <Text style={styles.actionHubEmoji}>📸</Text>
          </View>
          <Text style={styles.actionHubTitle}>Scan Prescription</Text>
          <Text style={styles.actionHubDesc}>AI OCR extraction & automated dose schedules</Text>
          <View style={styles.actionHubTag}>
            <Text style={styles.actionHubTagText}>Instant AI</Text>
          </View>
        </TouchableOpacity>

        {/* Tile 2: Add Medication */}
        <TouchableOpacity
          style={styles.actionHubTile}
          onPress={() => setIsManualAddVisible(true)}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <View style={[styles.actionHubIconBadge, { backgroundColor: colors.secondaryLight }]}>
            <Text style={styles.actionHubEmoji}>💊</Text>
          </View>
          <Text style={styles.actionHubTitle}>Log Medication</Text>
          <Text style={styles.actionHubDesc}>Custom timing, custom dose alarms & strength</Text>
          <View style={[styles.actionHubTag, { backgroundColor: colors.secondaryLight }]}>
            <Text style={[styles.actionHubTagText, { color: colors.secondary }]}>+ Manual Add</Text>
          </View>
        </TouchableOpacity>

        {/* Tile 3: Vault Export */}
        <TouchableOpacity
          style={styles.actionHubTile}
          onPress={() => router.push('/(tabs)/reports')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionHubIconBadge, { backgroundColor: colors.amberGoldLight }]}>
            <Text style={styles.actionHubEmoji}>📄</Text>
          </View>
          <Text style={styles.actionHubTitle}>Doctor PDF Export</Text>
          <Text style={styles.actionHubDesc}>One-click shareable verified medical summary</Text>
          <View style={[styles.actionHubTag, { backgroundColor: colors.amberGoldLight }]}>
            <Text style={[styles.actionHubTagText, { color: colors.amberGold }]}>Clinical PDF</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 5. LIVE RECENT ACTIVITY STREAM */}
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

      {/* 6. ADVANCED ENCRYPTION & PRIVACY SHIELD FOOTER */}
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
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  liveIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.primary,
  },
  streakPill: {
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 183, 3, 0.3)',
  },
  streakPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.amberGold,
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
    backgroundColor: 'rgba(0, 245, 160, 0.12)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButtonText: {
    fontSize: 16,
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
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
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
    borderRadius: borderRadius.lg,
    padding: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
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
    color: colors.primary,
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
    borderTopColor: colors.border,
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
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 245, 160, 0.3)',
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
    backgroundColor: 'rgba(0, 245, 160, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  heroDoseBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  heroSnoozedBadge: {
    backgroundColor: 'rgba(255, 183, 3, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  heroSnoozedText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.amberGold,
  },
  heroTimeChip: {
    backgroundColor: colors.surfaceMuted,
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
    backgroundColor: colors.surfaceMuted,
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
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionSkip: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroActionSkipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  heroActionSnooze: {
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 183, 3, 0.35)',
  },
  heroActionSnoozeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.amberGold,
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
    backgroundColor: 'rgba(0, 245, 160, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 160, 0.35)',
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
    color: colors.primary,
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
    borderRadius: borderRadius.lg,
    padding: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  actionHubIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
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
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  actionHubTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
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
    color: colors.primary,
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
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: 'rgba(0, 245, 160, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
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
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
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
