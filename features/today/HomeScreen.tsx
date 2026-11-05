import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { DocumentPickerModal } from '../../components/DocumentPickerModal';
import { ReviewPrescriptionScreen } from '../../features/prescriptions/ReviewPrescriptionScreen';
import { ManualAddMedicationModal } from '../../features/medications/ManualAddMedicationModal';
import { AccountModal } from '../../features/account/AccountModal';
import { colors } from '../../theme/index';
import { medicationStore, toLocalDateString } from '../../services/medications/medication-store';
import { useToday } from './useToday';
import { usePrescriptionUpload } from './usePrescriptionUpload';
import { useDoseActions } from './useDoseActions';
import { doseDisplayStateFor, pickNextDose } from './todayModel';
import { styles } from './styles-header';
import { TodayHeader } from './TodayHeader';
import { OnboardingHero } from './OnboardingHero';
import { ActiveRegimenSection } from './ActiveRegimenSection';
import { MetricsGrid } from './MetricsGrid';
import { ActionHub } from './ActionHub';
import { RecentActivity } from './RecentActivity';
import { SecurityFooter } from './SecurityFooter';

export default function HomeScreen() {
  const [isAccountModalVisible, setIsAccountModalVisible] = useState<boolean>(false);
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);
  const [isManualAddVisible, setIsManualAddVisible] = useState<boolean>(false);

  // Selected calendar date (Defaults to Today YYYY-MM-DD using timezone-safe local date)
  const todayDateStr = toLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);

  const { session, medications, recentEvents, totalRecordsCount, loadDashboardData, nowMs } =
    useToday();
  const {
    isProcessing,
    processingStatus,
    activeReviewData,
    setActiveReviewData,
    confirmationNotice,
    setConfirmationNotice,
    uploadError,
    handleFileSelected,
    handleConfirmPrescription,
  } = usePrescriptionUpload({ session, onPrescriptionChanged: loadDashboardData });
  const { actionNotice, actionDoseId, handleRecordAsNeededDose, handleRecordDoseAction } =
    useDoseActions(medications);

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

  // The one next-dose rule, shared with Medicines. Unrecorded past doses are never "next".
  const medFor = (id: string) =>
    medications.find((m) => m.id === id) || medicationStore.getMedicationById(id);
  const nextDose = pickNextDose(actionableDoses, nowMs, medFor);
  const nextDoseState = nextDose ? doseDisplayStateFor(nextDose, nowMs, medFor(nextDose.medicationId)) : null;
  const diffMinutes = nextDose
    ? Math.round((new Date(nextDose.scheduledTime).getTime() - nowMs) / 60000)
    : 0;
  const nextMed = nextDose
    ? medications.find((m) => m.id === nextDose.medicationId) ||
      medicationStore.getMedicationById(nextDose.medicationId)
    : null;
  const nextDoseDate = nextDose ? new Date(nextDose.scheduledTime) : null;
  const nextTimeStr = nextDoseDate
    ? nextDoseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

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
      <TodayHeader
        session={session}
        formattedSelectedDate={formattedSelectedDate}
        onOpenAccount={() => setIsAccountModalVisible(true)}
      />

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
        <OnboardingHero
          isProcessing={isProcessing}
          onScanPrescription={() => setIsPickerVisible(true)}
          onAddManual={() => setIsManualAddVisible(true)}
        />
      ) : (
        <ActiveRegimenSection
          isProcessing={isProcessing}
          onScanPrescription={() => setIsPickerVisible(true)}
          onAddManual={() => setIsManualAddVisible(true)}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          todayDateStr={todayDateStr}
          isSelectedDateToday={isSelectedDateToday}
          formattedSelectedDate={formattedSelectedDate}
          adherencePct={adherencePct}
          takenDosesCount={takenDosesCount}
          totalDosesCount={totalDosesCount}
          nextDose={nextDose}
          nextMed={nextMed}
          nextDoseState={nextDoseState}
          diffMinutes={diffMinutes}
          nextTimeStr={nextTimeStr}
          actionableDoses={actionableDoses}
          actionDoseId={actionDoseId}
          handleRecordDoseAction={handleRecordDoseAction}
          dayDoses={dayDoses}
          medications={medications}
          asNeededMeds={asNeededMeds}
          handleRecordAsNeededDose={handleRecordAsNeededDose}
        />
      )}

      <MetricsGrid
        totalDosesCount={totalDosesCount}
        adherencePct={adherencePct}
        takenDosesCount={takenDosesCount}
        activeMedsCount={activeMedsCount}
        totalRecordsCount={totalRecordsCount}
      />

      <ActionHub
        isProcessing={isProcessing}
        onScanPrescription={() => setIsPickerVisible(true)}
        onAddManual={() => setIsManualAddVisible(true)}
      />

      <RecentActivity recentEvents={recentEvents} />

      <SecurityFooter />

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

      <AccountModal
        visible={isAccountModalVisible}
        onClose={() => setIsAccountModalVisible(false)}
      />
    </ScreenLayout>
  );
}
