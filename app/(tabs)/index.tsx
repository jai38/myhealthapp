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
import { medicationStore, toLocalDateString } from '../../services/medications/medication-store';
import {
  timelineService,
  TimelineEvent,
  formatMedicalEventDate,
} from '../../services/timeline/timeline-service';
import { syncAllMedicationReminders } from '../../services/notifications/notification-service';

export default function HomeScreen() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(authService.getSession());
  const [isAccountModalVisible, setIsAccountModalVisible] = useState<boolean>(false);
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [activeReviewData, setActiveReviewData] = useState<any | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isManualAddVisible, setIsManualAddVisible] = useState<boolean>(false);

  // Selected calendar date (Defaults to Today YYYY-MM-DD using timezone-safe local date)
  const todayDateStr = toLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);

  // Store data
  const [medications, setMedications] = useState<MedicationRecord[]>(() =>
    medicationStore.getMedications()
  );
  const [allDoses, setAllDoses] = useState<DoseLog[]>(() => medicationStore.getAllDoses());
  const [recentEvents, setRecentEvents] = useState<TimelineEvent[]>([]);
  const [totalRecordsCount, setTotalRecordsCount] = useState<number>(0);
  const [actionDoseId, setActionDoseId] = useState<string | null>(null);

  const uploadService = new MobileDocumentUploadService(api);

  // Subscribe to reactive updates from medication store
  useEffect(() => {
    const unsub = medicationStore.subscribe(() => {
      setMedications(medicationStore.getMedications());
      setAllDoses(medicationStore.getAllDoses());
    });
    return unsub;
  }, []);

  // Sync with remote backend when available
  const loadDashboardData = useCallback(async () => {
    try {
      const [serverMeds, serverDoses, timelineRes] = await Promise.all([
        medicationService.listMedications().catch(() => []),
        medicationService.getDoseOccurrences().catch(() => []),
        timelineService
          .fetchTimeline({ limit: 3 })
          .catch(() => ({ data: [], pagination: { totalCount: 0 } })),
      ]);

      if (serverMeds.length > 0 || serverDoses.length > 0) {
        await medicationStore.syncFromServer(serverMeds, serverDoses);
      }

      setRecentEvents(timelineRes.data);
      setTotalRecordsCount(timelineRes.pagination.totalCount);
    } catch {
      // Offline fallback: keep existing store data
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

  // Automatically sync local system notification alarms whenever active medications change
  useEffect(() => {
    const activeMeds = (medications.length > 0 ? medications : medicationStore.getMedications())
      .filter((m) => m.status === 'ACTIVE')
      .map((m) => ({
        id: m.id,
        name: m.nameAsWritten,
        isActive: true,
        reminderTimes: m.reminderTimes || [],
        instructions: m.prescribedInstructions || undefined,
        endDate: m.endDate || null,
      }));
    syncAllMedicationReminders(activeMeds).catch(() => {});
  }, [medications]);

  const handleFileSelected = async (file: PickedFile) => {
    setIsProcessing(true);
    setProcessingStatus('Uploading prescription securely...');
    setConfirmationNotice(null);
    setUploadError(null);

    try {
      const { document, job } = await uploadService.uploadAndExtractPrescription(file);

      setProcessingStatus('Extracting prescription data (AI Clinical Parser)...');

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

    try {
      await uploadService.confirmPrescription(activeReviewData.jobId, reviewPayload);
    } catch {
      // Safe offline fallback
    }

    // Immediately schedule any medicines marked as ACTIVE by the patient into local store
    if (Array.isArray(reviewPayload.medicines)) {
      for (const m of reviewPayload.medicines) {
        if (m.is_active_medication) {
          const isAsNeeded =
            m.frequency_text?.toLowerCase().includes('as needed') ||
            m.frequency_text?.toLowerCase().includes('sos') ||
            m.instructions?.toLowerCase().includes('as needed') ||
            m.instructions?.toLowerCase().includes('sos') ||
            (Array.isArray(m.reminder_times) && m.reminder_times.length === 0 && m.times_per_day === 0);

          const reminderTimes = isAsNeeded
            ? []
            : Array.isArray(m.reminder_times) && m.reminder_times.length > 0
            ? m.reminder_times
            : ['08:00'];

          const newMed: MedicationRecord = {
            id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            patientProfileId: session?.patientProfileId || 'patient-local',
            nameAsWritten: m.name_as_written,
            normalizedMedicineName: m.normalized_medicine_name || m.name_as_written,
            strength: m.strength || '',
            dosageForm: m.dosage_form || 'TABLET',
            route: m.route || 'ORAL',
            prescribedInstructions:
              m.instructions ||
              m.frequency_text ||
              (isAsNeeded ? 'Take as needed (SOS)' : 'Take as prescribed'),
            status: 'ACTIVE',
            startDate: reviewPayload.prescription_date || new Date().toISOString(),
            reminderTimes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await medicationStore.addMedication(newMed);
        }
      }
    }

    const activeCount = reviewPayload.medicines?.filter((m: any) => m.is_active_medication)?.length || 0;
    setConfirmationNotice(
      `Prescription confirmed! ${activeCount} active medication(s) added to your regimen.`
    );
    setActiveReviewData(null);
    loadDashboardData();
  };

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

  // Calendar date context
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const formattedSelectedDate = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const isSelectedDateToday = selectedDate === todayDateStr;

  // Doses and adherence for the selected calendar date
  const dayDoses = medicationStore.getDosesForDate(selectedDate);
  const { percentage: adherencePct, taken: takenDosesCount, total: totalDosesCount } =
    medicationStore.getAdherenceForDate(selectedDate);

  const actionableDoses = dayDoses.filter(
    (d) => d.status === 'PENDING' || d.status === 'SNOOZED'
  );

  const now = new Date();
  const nowMs = now.getTime();

  let spotlightDose: DoseLog | null = null;
  let doseTemporalState: 'OVERDUE' | 'DUE_NOW' | 'SNOOZED' | 'UPCOMING' = 'UPCOMING';
  let diffMinutes = 0;

  if (actionableDoses.length > 0) {
    if (isSelectedDateToday) {
      // Prioritization for Today:
      // 1. Due Now: Scheduled time has arrived, within past 15 mins (diff <= 0 && diff >= -15)
      const dueNow = actionableDoses.find((d) => {
        const diff = Math.round((new Date(d.scheduledTime).getTime() - nowMs) / 60000);
        return diff <= 0 && diff >= -15;
      });
      // 2. Active snoozed doses
      const snoozed = actionableDoses.find((d) => d.status === 'SNOOZED');
      // 3. Overdue doses: Scheduled time is more than 15 mins in the past (diff < -15)
      const overdue = actionableDoses.find((d) => {
        const diff = Math.round((new Date(d.scheduledTime).getTime() - nowMs) / 60000);
        return diff < -15;
      });
      // 4. Earliest upcoming dose in the future (diff > 0)
      const upcoming = actionableDoses.find((d) => {
        const diff = Math.round((new Date(d.scheduledTime).getTime() - nowMs) / 60000);
        return diff > 0;
      });

      if (dueNow) {
        spotlightDose = dueNow;
        doseTemporalState = 'DUE_NOW';
        diffMinutes = Math.round((new Date(dueNow.scheduledTime).getTime() - nowMs) / 60000);
      } else if (snoozed) {
        spotlightDose = snoozed;
        doseTemporalState = 'SNOOZED';
        diffMinutes = Math.round((new Date(snoozed.scheduledTime).getTime() - nowMs) / 60000);
      } else if (overdue) {
        spotlightDose = overdue;
        doseTemporalState = 'OVERDUE';
        diffMinutes = Math.round((new Date(overdue.scheduledTime).getTime() - nowMs) / 60000);
      } else {
        spotlightDose = upcoming || actionableDoses[0];
        doseTemporalState = 'UPCOMING';
        diffMinutes = Math.round((new Date(spotlightDose.scheduledTime).getTime() - nowMs) / 60000);
      }
    } else {
      spotlightDose = actionableDoses[0];
      doseTemporalState = 'UPCOMING';
      diffMinutes = Math.round((new Date(spotlightDose.scheduledTime).getTime() - nowMs) / 60000);
    }
  }

  const nextDose = spotlightDose;
  const nextMed = nextDose
    ? medications.find((m) => m.id === nextDose.medicationId) ||
      medicationStore.getMedicationById(nextDose.medicationId)
    : null;
  const nextDoseDate = nextDose ? new Date(nextDose.scheduledTime) : null;
  const nextTimeStr = nextDoseDate
    ? nextDoseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const formatTimeDifference = (mins: number) => {
    if (mins < 0) {
      const absMins = Math.abs(mins);
      if (absMins < 60) return `${absMins}m overdue`;
      const hrs = Math.floor(absMins / 60);
      const rem = absMins % 60;
      return rem > 0 ? `${hrs}h ${rem}m overdue` : `${hrs}h overdue`;
    } else {
      if (mins < 60) return `in ${mins}m`;
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return rem > 0 ? `in ${hrs}h ${rem}m` : `in ${hrs}h`;
    }
  };

  const allCurrentMeds = medications.length > 0 ? medications : medicationStore.getMedications();
  const activeMedsCount = allCurrentMeds.filter((m) => m.status === 'ACTIVE').length;
  const hasActiveMedications = activeMedsCount > 0;

  const asNeededMeds = allCurrentMeds.filter(
    (m) =>
      m.status === 'ACTIVE' &&
      ((!m.reminderTimes || m.reminderTimes.length === 0) ||
        m.prescribedInstructions?.toLowerCase().includes('as needed') ||
        m.prescribedInstructions?.toLowerCase().includes('sos'))
  );

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
      {/* 1. HEALTH OS HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <Text style={styles.dateText}>{formattedSelectedDate}</Text>
            <View style={styles.streakPill}>
              <Text style={styles.streakPillText}>⏱️ MEDICATION SCHEDULE</Text>
            </View>
          </View>
          <Text style={styles.greeting}>
            {session?.fullName ? `Hello, ${session.fullName.split(' ')[0]}` : 'Welcome Back'}
          </Text>
          <Text style={styles.subGreeting}>
            Keep your medications and health records on track today.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => setIsAccountModalVisible(true)}
          accessibilityLabel="Open Account Settings"
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
              : '👤'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instant Action Feedback Toast */}
      {actionNotice && (
        <View style={styles.actionNoticeBanner}>
          <Text style={styles.actionNoticeText}>{actionNotice}</Text>
        </View>
      )}

      {/* Confirmation Banner */}
      {confirmationNotice && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ {confirmationNotice}</Text>
        </View>
      )}

      {/* Upload Error Banner */}
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

      {!hasActiveMedications ? (
        /* NEW USER ONBOARDING HERO: Upload Prescription */
        <View style={styles.newPatientOnboardingHero}>
          <View style={styles.onboardingIconCircle}>
            <Text style={styles.onboardingHeroEmoji}>📸</Text>
          </View>
          <Text style={styles.onboardingHeroTitle}>Upload Your Prescription</Text>
          <Text style={styles.onboardingHeroSubtitle}>
            Snap a photo or upload an image of your prescription slip. MyHealth extracts your medicines, dosages, and sets up your personalized reminder schedule.
          </Text>

          <TouchableOpacity
            style={styles.onboardingPrimaryBtn}
            onPress={() => setIsPickerVisible(true)}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <Text style={styles.onboardingPrimaryBtnText}>📸 Scan / Upload Prescription</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.onboardingSecondaryBtn}
            onPress={() => setIsManualAddVisible(true)}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <Text style={styles.onboardingSecondaryBtnText}>+ Add Medication Manually</Text>
          </TouchableOpacity>

          {/* 3-Step Simple Patient Guide */}
          <View style={styles.onboardingStepsCard}>
            <Text style={styles.onboardingStepsTitle}>How MyHealth Works:</Text>
            <View style={styles.onboardingStepItem}>
              <View style={styles.onboardingStepNumBadge}>
                <Text style={styles.onboardingStepNum}>1</Text>
              </View>
              <Text style={styles.onboardingStepText}>
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Upload Prescription: </Text>
                Camera or file upload of any doctor's prescription slip.
              </Text>
            </View>
            <View style={styles.onboardingStepItem}>
              <View style={styles.onboardingStepNumBadge}>
                <Text style={styles.onboardingStepNum}>2</Text>
              </View>
              <Text style={styles.onboardingStepText}>
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Review & Confirm: </Text>
                Pick your course duration (e.g. 5 days, 1 month) and exact reminder times.
              </Text>
            </View>
            <View style={styles.onboardingStepItem}>
              <View style={styles.onboardingStepNumBadge}>
                <Text style={styles.onboardingStepNum}>3</Text>
              </View>
              <Text style={styles.onboardingStepText}>
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Daily Tracker & Alarms: </Text>
                Receive 15-minute advance alerts, and 1-tap track every dose from your dashboard.
              </Text>
            </View>
          </View>
        </View>
      ) : (
        /* RETURNING USER DASHBOARD (Active Medications Regimen) */
        <>
          {/* Quick Upload / Add Bar for returning users */}
          <View style={styles.compactActionBar}>
            <TouchableOpacity
              style={styles.compactUploadBtn}
              onPress={() => setIsPickerVisible(true)}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <Text style={styles.compactUploadBtnText}>📸 Upload Prescription</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.compactAddBtn}
              onPress={() => setIsManualAddVisible(true)}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <Text style={styles.compactAddBtnText}>+ Add Med</Text>
            </TouchableOpacity>
          </View>

          {/* 2. INTERACTIVE WEEKDAY CALENDAR STRIP */}
          <View style={styles.calendarContainer}>
            <HorizontalDateStrip
              selectedDate={selectedDate}
              onSelectDate={(newDate) => {
                setSelectedDate(newDate);
              }}
            />

            {/* Selected Date Context & Reset to Today Button */}
            <View style={styles.dateContextRow}>
              <Text style={styles.dateContextText}>
                {isSelectedDateToday
                  ? "Showing Today's Prescribed Schedule"
                  : `Showing Schedule for ${formattedSelectedDate}`}
              </Text>
              {!isSelectedDateToday && (
                <TouchableOpacity
                  style={styles.jumpTodayBtn}
                  onPress={() => setSelectedDate(todayDateStr)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.jumpTodayBtnText}>Jump to Today ›</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 4. HERO ADHERENCE DONUT (Calm medical teal/blue) */}
          <AdherenceDonut
            percentage={adherencePct}
            takenCount={takenDosesCount}
            totalCount={totalDosesCount}
            label={isSelectedDateToday ? 'Medication Adherence' : `${formattedSelectedDate} Adherence`}
          />

          {/* 5. 1-TAP UPCOMING / DUE DOSE CARD */}
          {nextDose && nextMed ? (
            <View style={styles.heroDoseCard}>
              <View style={styles.heroDoseHeader}>
                <View style={styles.heroBadgeRow}>
                  {doseTemporalState === 'OVERDUE' ? (
                    <View style={[styles.heroDoseBadge, styles.badgeOverdue]}>
                      <Text style={styles.badgeOverdueText}>⚠️ OVERDUE DOSE</Text>
                    </View>
                  ) : doseTemporalState === 'DUE_NOW' ? (
                    <View style={[styles.heroDoseBadge, styles.badgeDueNow]}>
                      <Text style={styles.badgeDueNowText}>🔔 DUE NOW</Text>
                    </View>
                  ) : doseTemporalState === 'SNOOZED' ? (
                    <View style={[styles.heroDoseBadge, styles.badgeSnoozed]}>
                      <Text style={styles.badgeSnoozedText}>⏰ SNOOZED (15m)</Text>
                    </View>
                  ) : (
                    <View style={styles.heroDoseBadge}>
                      <Text style={styles.heroDoseBadgeText}>
                        {isSelectedDateToday
                          ? diffMinutes <= 15 && diffMinutes > 0
                            ? `UPCOMING IN ${diffMinutes}m ⏱️`
                            : 'UPCOMING DOSE ⏱️'
                          : 'SCHEDULED DOSE ⏱️'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.heroTimeChip}>
                  <Text style={styles.heroTimeChipText}>{nextTimeStr}</Text>
                </View>
              </View>

              <Text style={styles.heroMedName}>{nextMed.nameAsWritten}</Text>
              <Text style={styles.heroMedMeta}>
                {nextMed.strength ? `${nextMed.strength} • ` : ''}
                {doseTemporalState === 'OVERDUE'
                  ? `Scheduled at ${nextTimeStr} (${formatTimeDifference(diffMinutes)}) • Action needed`
                  : doseTemporalState === 'DUE_NOW'
                  ? `Scheduled at ${nextTimeStr} • Time for your dose`
                  : doseTemporalState === 'SNOOZED'
                  ? `Scheduled at ${nextTimeStr} • Snooze active`
                  : diffMinutes <= 15 && diffMinutes > 0
                  ? `Scheduled at ${nextTimeStr} (in ${diffMinutes}m) • Alarm will sound at dose time`
                  : `Scheduled at ${nextTimeStr} (${formatTimeDifference(diffMinutes)}) • Daily Regimen`}
              </Text>

              {nextMed.prescribedInstructions ? (
                <View style={styles.instructionsBox}>
                  <Text style={styles.instructionsText}>💡 {nextMed.prescribedInstructions}</Text>
                </View>
              ) : null}

              {doseTemporalState === 'UPCOMING' && (
                <View style={styles.upcomingNoticeBox}>
                  <Text style={styles.upcomingNoticeText}>
                    🔔 Reminder notification is scheduled for {nextTimeStr}. You can record early or wait until due.
                  </Text>
                </View>
              )}

              <View style={styles.heroActionsRow}>
                <TouchableOpacity
                  style={[styles.heroActionBtn, styles.heroActionSkip]}
                  onPress={() => handleRecordDoseAction(nextDose.id, 'SKIPPED')}
                  disabled={actionDoseId === nextDose.id}
                  activeOpacity={0.75}
                >
                  <Text style={styles.heroActionSkipText}>Skip</Text>
                </TouchableOpacity>

                {doseTemporalState !== 'UPCOMING' && (
                  <TouchableOpacity
                    style={[styles.heroActionBtn, styles.heroActionSnooze]}
                    onPress={() => handleRecordDoseAction(nextDose.id, 'SNOOZED', 15)}
                    disabled={actionDoseId === nextDose.id}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.heroActionSnoozeText}>
                      {doseTemporalState === 'SNOOZED' ? 'Snooze +15m' : 'Snooze 15m'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.heroActionBtn, styles.heroActionTaken]}
                  onPress={() => handleRecordDoseAction(nextDose.id, 'TAKEN')}
                  disabled={actionDoseId === nextDose.id}
                  activeOpacity={0.75}
                >
                  <Text style={styles.heroActionTakenText}>
                    {doseTemporalState === 'UPCOMING' ? 'Take Early ✓' : 'Taken ✓'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : totalDosesCount > 0 && actionableDoses.length === 0 ? (
            <View style={styles.streakCelebrationCard}>
              <View style={styles.streakRow}>
                <Text style={styles.streakIcon}>🎯</Text>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.streakTitle}>All Doses Completed! ✓</Text>
                  <Text style={styles.streakSub}>
                    {takenDosesCount} of {totalDosesCount} medications recorded for {formattedSelectedDate}.
                    Great consistency maintaining your schedule.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Card variant="muted" style={styles.emptyDayCard}>
              <Text style={styles.emptyDayText}>
                No doses scheduled for {formattedSelectedDate}.
              </Text>
              <TouchableOpacity
                style={styles.addMedQuickBtn}
                onPress={() => setIsManualAddVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.addMedQuickBtnText}>+ Add Medication</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* 5b. COMPLETE DAILY MEDICATION REGIMEN LIST */}
          {dayDoses.length > 0 && (
            <View style={styles.dailyScheduleContainer}>
              <View style={styles.dailyScheduleHeader}>
                <View>
                  <Text style={styles.dailyScheduleTitle}>
                    {isSelectedDateToday ? "Today's Schedule" : `${formattedSelectedDate} Schedule`}
                  </Text>
                  <Text style={styles.dailyScheduleSub}>
                    {takenDosesCount} of {totalDosesCount} doses recorded
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.manageScheduleLink}
                  onPress={() => router.push('/(tabs)/medications')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.manageScheduleLinkText}>View All ›</Text>
                </TouchableOpacity>
              </View>

              {dayDoses.map((dose) => {
                const med =
                  medications.find((m) => m.id === dose.medicationId) ||
                  medicationStore.getMedicationById(dose.medicationId);
                if (!med) return null;

                const doseDate = new Date(dose.scheduledTime);
                const timeStr = doseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <View key={dose.id} style={styles.doseScheduleCard}>
                    <View style={styles.doseScheduleTimeBox}>
                      <Text style={styles.doseScheduleTimeText}>{timeStr}</Text>
                      <View
                        style={[
                          styles.doseScheduleDot,
                          dose.status === 'TAKEN' && styles.doseScheduleDotTaken,
                          dose.status === 'SNOOZED' && styles.doseScheduleDotSnoozed,
                          dose.status === 'SKIPPED' && styles.doseScheduleDotSkipped,
                        ]}
                      />
                    </View>

                    <View style={styles.doseScheduleInfo}>
                      <Text style={styles.doseScheduleMedName}>{med.nameAsWritten}</Text>
                      <Text style={styles.doseScheduleInstructions} numberOfLines={1}>
                        {med.strength ? `${med.strength} • ` : ''}
                        {med.prescribedInstructions || 'Follow prescribed routine'}
                      </Text>
                    </View>

                    <View style={styles.doseScheduleActionBox}>
                      {dose.status === 'TAKEN' ? (
                        <View style={styles.scheduleBadgeTaken}>
                          <Text style={styles.scheduleBadgeTakenText}>✓ Taken</Text>
                        </View>
                      ) : dose.status === 'SNOOZED' ? (
                        <View style={styles.scheduleBadgeSnoozed}>
                          <Text style={styles.scheduleBadgeSnoozedText}>⏰ Snoozed</Text>
                        </View>
                      ) : dose.status === 'SKIPPED' ? (
                        <View style={styles.scheduleBadgeSkipped}>
                          <Text style={styles.scheduleBadgeSkippedText}>Skipped</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.scheduleTakeBtn}
                          onPress={() => handleRecordDoseAction(dose.id, 'TAKEN')}
                          disabled={actionDoseId === dose.id}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.scheduleTakeBtnText}>
                            {new Date(dose.scheduledTime).getTime() > Date.now()
                              ? 'Take Early'
                              : 'Take ✓'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* 5c. AS-NEEDED MEDICINES (SOS / ON-DEMAND) */}
          {asNeededMeds.length > 0 && (
            <View style={styles.asNeededSectionContainer}>
              <View style={styles.asNeededHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.asNeededSectionTitle}>As-Needed Medicines (SOS)</Text>
                  <Text style={styles.asNeededSectionSub}>
                    Taken on-demand when symptoms arise. No fixed daily alarm.
                  </Text>
                </View>
                <View style={styles.asNeededHeaderBadge}>
                  <Text style={styles.asNeededHeaderBadgeText}>PRN / SOS</Text>
                </View>
              </View>

              {asNeededMeds.map((med) => {
                const todayDosesForMed = dayDoses.filter(
                  (d) => d.medicationId === med.id && d.status === 'TAKEN'
                );
                return (
                  <View key={med.id} style={styles.asNeededCard}>
                    <View style={styles.asNeededInfo}>
                      <Text style={styles.asNeededMedName}>{med.nameAsWritten}</Text>
                      <Text style={styles.asNeededMedSub}>
                        {med.strength ? `${med.strength} • ` : ''}
                        {med.dosageForm ? `${med.dosageForm} • ` : ''}
                        {med.prescribedInstructions || 'Take as needed when symptoms occur'}
                      </Text>
                      {todayDosesForMed.length > 0 && (
                        <Text style={styles.asNeededTakenNotice}>
                          ✓ {todayDosesForMed.length} dose{todayDosesForMed.length > 1 ? 's' : ''} recorded today
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.asNeededLogBtn}
                      onPress={() => handleRecordAsNeededDose(med)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.asNeededLogBtnText}>+ Log Dose</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}

      {/* 6. THREE-TILE STATS MATRIX (Clean, cohesive clinical slate) */}
      <View style={styles.metricsGrid}>
        {/* Adherence Rate */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(tabs)/medications')}
          activeOpacity={0.85}
        >
          <View style={[styles.metricIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Text style={styles.metricIcon}>⏱️</Text>
          </View>
          <Text style={styles.metricValue}>{adherencePct}%</Text>
          <Text style={styles.metricLabel}>Adherence</Text>
          <View style={styles.metricFooter}>
            <Text style={styles.metricSubText}>
              {takenDosesCount}/{totalDosesCount || 0} Doses Done
            </Text>
          </View>
        </TouchableOpacity>

        {/* Active Medications */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(tabs)/medications')}
          activeOpacity={0.85}
        >
          <View style={[styles.metricIconBox, { backgroundColor: '#F0F9FF' }]}>
            <Text style={styles.metricIcon}>💊</Text>
          </View>
          <Text style={styles.metricValue}>{activeMedsCount}</Text>
          <Text style={styles.metricLabel}>Active Meds</Text>
          <View style={styles.metricFooter}>
            <Text style={styles.metricSubText}>Prescriptions</Text>
          </View>
        </TouchableOpacity>

        {/* Verified Health Records */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(tabs)/reports')}
          activeOpacity={0.85}
        >
          <View style={[styles.metricIconBox, { backgroundColor: '#F8FAFC' }]}>
            <Text style={styles.metricIcon}>📋</Text>
          </View>
          <Text style={styles.metricValue}>{totalRecordsCount}</Text>
          <Text style={styles.metricLabel}>Records</Text>
          <View style={styles.metricFooter}>
            <Text style={styles.metricSubText}>Labs & Summaries</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 7. THREE-TILE ACTION HUB */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.sectionSub}>Prescription scanner, medicine logs & health records</Text>
      </View>

      <View style={styles.actionHubGrid}>
        {/* Tile 1: AI Prescription Scanner */}
        <TouchableOpacity
          style={styles.actionHubTile}
          onPress={() => setIsPickerVisible(true)}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <View style={[styles.actionHubIconBadge, { backgroundColor: '#F0F9FF' }]}>
            <Text style={styles.actionHubEmoji}>📸</Text>
          </View>
          <Text style={styles.actionHubTitle}>Scan Prescription</Text>
          <Text style={styles.actionHubDesc}>Instant OCR extraction to verify medicines</Text>
          <View style={[styles.actionHubTag, { backgroundColor: '#F0F9FF' }]}>
            <Text style={[styles.actionHubTagText, { color: colors.accentCoral }]}>Smart OCR</Text>
          </View>
        </TouchableOpacity>

        {/* Tile 2: Add Medication */}
        <TouchableOpacity
          style={styles.actionHubTile}
          onPress={() => setIsManualAddVisible(true)}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <View style={[styles.actionHubIconBadge, { backgroundColor: '#F0F9FF' }]}>
            <Text style={styles.actionHubEmoji}>💊</Text>
          </View>
          <Text style={styles.actionHubTitle}>Add Medication</Text>
          <Text style={styles.actionHubDesc}>Custom timing, dose reminders & instructions</Text>
          <View style={[styles.actionHubTag, { backgroundColor: '#F0F9FF' }]}>
            <Text style={[styles.actionHubTagText, { color: colors.accentCoral }]}>+ Add Med</Text>
          </View>
        </TouchableOpacity>

        {/* Tile 3: Doctor Summary Export */}
        <TouchableOpacity
          style={styles.actionHubTile}
          onPress={() => router.push('/(tabs)/reports')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionHubIconBadge, { backgroundColor: '#F8FAFC' }]}>
            <Text style={styles.actionHubEmoji}>📄</Text>
          </View>
          <Text style={styles.actionHubTitle}>Doctor Summary</Text>
          <Text style={styles.actionHubDesc}>Shareable overview for your next clinic visit</Text>
          <View style={[styles.actionHubTag, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[styles.actionHubTagText, { color: colors.textSecondary }]}>Export PDF</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 8. LIVE RECENT ACTIVITY STREAM */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Recent Health Activity</Text>
          <Text style={styles.sectionSub}>Verified prescriptions, doctor visits & lab tests</Text>
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
  actionNoticeBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionNoticeText: {
    ...typography.caption,
    color: '#15803D',
    fontWeight: '700',
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

  // Calendar
  calendarContainer: {
    marginBottom: spacing.md,
  },
  dateContextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginTop: -4,
    marginBottom: spacing.xs,
  },
  dateContextText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  jumpTodayBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accentCoralLight,
  },
  jumpTodayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentCoral,
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
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
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
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
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
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.15)',
  },
  heroDoseBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentCoral,
    letterSpacing: 0.5,
  },
  badgeOverdue: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  badgeOverdueText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  badgeDueNow: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  badgeDueNowText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  badgeSnoozed: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  badgeSnoozedText: {
    color: '#D97706',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  upcomingNoticeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  upcomingNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 16,
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
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroMedName: {
    fontSize: 20,
    fontWeight: '800',
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
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  instructionsText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    fontWeight: '500',
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
    borderColor: 'rgba(217, 119, 6, 0.2)',
  },
  heroActionSnoozeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentCustard,
  },
  heroActionTaken: {
    backgroundColor: colors.accentCoral,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
        } as any)
      : {}),
  },
  heroActionTakenText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: 0.3,
  },

  // Streak celebration
  streakCelebrationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.08)',
        } as any)
      : shadows.sm),
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
    fontWeight: '800',
    color: colors.accentMint,
  },
  streakSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyDayCard: {
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyDayText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  addMedQuickBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  addMedQuickBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },

  // Complete Daily Schedule List
  dailyScheduleContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        } as any)
      : shadows.sm),
  },
  dailyScheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  dailyScheduleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dailyScheduleSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  manageScheduleLink: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  manageScheduleLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentCoral,
  },
  doseScheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  doseScheduleTimeBox: {
    width: 64,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: spacing.xs,
  },
  doseScheduleTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  doseScheduleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
    marginTop: 4,
  },
  doseScheduleDotTaken: {
    backgroundColor: colors.accentMint,
  },
  doseScheduleDotSnoozed: {
    backgroundColor: colors.accentCustard,
  },
  doseScheduleDotSkipped: {
    backgroundColor: colors.textMuted,
  },
  doseScheduleInfo: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  doseScheduleMedName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  doseScheduleInstructions: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  doseScheduleActionBox: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  scheduleBadgeTaken: {
    backgroundColor: colors.accentMintLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  scheduleBadgeTakenText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentMint,
  },
  scheduleBadgeSnoozed: {
    backgroundColor: colors.accentCustardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  scheduleBadgeSnoozedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentCustard,
  },
  scheduleBadgeSkipped: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  scheduleBadgeSkippedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  scheduleTakeBtn: {
    backgroundColor: colors.accentCoral,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
        } as any)
      : {}),
  },
  scheduleTakeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
  },

  // Action Hub
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
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
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
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
    color: colors.accentCoral,
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
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
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

  // Compact Action Bar for Returning Users
  compactActionBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  compactUploadBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 2px 6px rgba(15, 76, 129, 0.25)' } as any)
      : shadows.sm),
  },
  compactUploadBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  compactAddBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  compactAddBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },

  // New Patient Onboarding Hero
  newPatientOnboardingHero: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 8px 24px rgba(15, 76, 129, 0.08)' } as any)
      : shadows.md),
  },
  onboardingIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F1F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  onboardingHeroEmoji: {
    fontSize: 32,
  },
  onboardingHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  onboardingHeroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  onboardingPrimaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 4px 12px rgba(15, 76, 129, 0.3)' } as any)
      : shadows.sm),
  },
  onboardingPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  onboardingSecondaryBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  onboardingSecondaryBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  onboardingStepsCard: {
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  onboardingStepsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  onboardingStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    gap: spacing.xs + 2,
  },
  onboardingStepNumBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  onboardingStepNum: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  onboardingStepText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // As-Needed Medicines (SOS)
  asNeededSectionContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 4px 16px rgba(15, 76, 129, 0.06)' } as any)
      : shadows.sm),
  },
  asNeededHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  asNeededSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  asNeededSectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  asNeededHeaderBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  asNeededHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  asNeededCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  asNeededInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  asNeededMedName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  asNeededMedSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  asNeededTakenNotice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
  asNeededLogBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  asNeededLogBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
