import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../design/components/Foundations/Screen';
import { Text } from '../../design/components/Foundations/Text';
import { size, space } from '../../design/tokens';
import { t } from '../../design/strings';
import { DocumentPickerModal } from '../../components/DocumentPickerModal';
import { ReviewPrescriptionScreen } from '../prescriptions/ReviewPrescriptionScreen';
import { ManualAddMedicationModal } from '../medications/ManualAddMedicationModal';
import { medicationStore } from '../../services/medications/medication-store';
import { useToday } from './useToday';
import { usePrescriptionUpload } from './usePrescriptionUpload';
import { useDoseActions } from './useDoseActions';
import { dueNowRest, asNeededMedications, formatTodayTime, todaySections } from './todaySections';
import type { TodaySection } from './todaySections';
import { TodayGreeting } from './TodayGreeting';
import { TodayNextDose } from './TodayNextDose';
import { TodayDoseSection } from './TodayDoseRow';
import {
  TodayAllDone,
  TodayError,
  TodayLoading,
  TodayNewUser,
  TodayNothingDue,
} from './TodayStates';
import { TodayAsNeeded, TodayQuickActions } from './TodayActions';
import { TodayNotices, TodayProcessing } from './TodayNotices';

export default function HomeScreen() {
  const router = useRouter();
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);
  const [isManualAddVisible, setIsManualAddVisible] = useState<boolean>(false);

  const {
    screenState,
    groups,
    next,
    greeting,
    isOffline,
    lastUpdatedAt,
    retry,
    nowMs,
    medications,
    session,
    loadDashboardData,
  } = useToday();
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

  const now = new Date(nowMs);
  const medicationFor = (id: string) =>
    medications.find((m) => m.id === id) ?? medicationStore.getMedicationById(id);
  const allMeds = medications.length > 0 ? medications : medicationStore.getMedications();
  const asNeeded = asNeededMedications(allMeds);
  const sections = todaySections(screenState, groups, asNeeded.length > 0);
  const show = (section: TodaySection) => sections.includes(section);
  const openScan = () => setIsPickerVisible(true);
  const openManualAdd = () => setIsManualAddVisible(true);
  // `next` comes from useToday, which applies the shared next-dose rule (pickNextDose in todayModel).
  const dueRest = dueNowRest(groups);

  return (
    <Screen testID="today-screen">
      <TodayGreeting
        greeting={greeting}
        now={now}
        onOpenProfile={() => router.push('/profile')}
      />

      {lastUpdatedAt !== null && isOffline ? (
        <Text variant="caption" tone="secondary" testID="today-last-updated">
          {t('feedback.lastUpdated', { time: formatTodayTime(new Date(lastUpdatedAt)) })}
        </Text>
      ) : null}

      <TodayNotices
        actionNotice={actionNotice}
        confirmationNotice={confirmationNotice}
        uploadError={uploadError}
      />
      {isProcessing ? <TodayProcessing status={processingStatus} /> : null}

      {show('loading') ? <TodayLoading /> : null}
      {show('error') ? <TodayError onRetry={retry} /> : null}
      {show('newUser') ? <TodayNewUser onScan={openScan} onAddManual={openManualAdd} /> : null}
      {show('nothingDue') ? <TodayNothingDue /> : null}
      {show('allDone') ? <TodayAllDone /> : null}

      {show('next') && next ? (
        <TodayNextDose next={next} actionDoseId={actionDoseId} onRecord={handleRecordDoseAction} />
      ) : null}

      {show('dueNow') ? (
        <TodayDoseSection
          title={t('today.dueNowTitle')}
          items={dueRest}
          medicationFor={medicationFor}
          actions="taken"
          actionDoseId={actionDoseId}
          onRecord={handleRecordDoseAction}
          testID="today-due-now"
        />
      ) : null}

      {show('earlierNotConfirmed') ? (
        <TodayDoseSection
          title={t('today.earlierTitle')}
          note={t('today.earlierNote')}
          items={groups.earlierNotConfirmed}
          medicationFor={medicationFor}
          actions="takenOrSkip"
          actionDoseId={actionDoseId}
          onRecord={handleRecordDoseAction}
          testID="today-earlier"
        />
      ) : null}

      {show('later') ? (
        <TodayDoseSection
          title={t('today.laterTitle')}
          items={groups.later}
          medicationFor={medicationFor}
          actions="none"
          actionDoseId={actionDoseId}
          onRecord={handleRecordDoseAction}
          testID="today-later"
        />
      ) : null}

      {show('done') ? (
        <TodayDoseSection
          title={t('today.doneTitle')}
          items={groups.done}
          medicationFor={medicationFor}
          actions="none"
          actionDoseId={actionDoseId}
          onRecord={handleRecordDoseAction}
          testID="today-done"
        />
      ) : null}

      {show('asNeeded') ? (
        <TodayAsNeeded
          medications={asNeeded}
          onTookDose={(med) => {
            void handleRecordAsNeededDose(med);
          }}
        />
      ) : null}

      {show('quickActions') ? (
        <TodayQuickActions onScan={openScan} onAddManual={openManualAdd} disabled={isProcessing} />
      ) : null}

      <View style={styles.bottomInset} />

      <DocumentPickerModal
        visible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onFileSelected={handleFileSelected}
      />

      <ManualAddMedicationModal
        visible={isManualAddVisible}
        onClose={() => setIsManualAddVisible(false)}
        onMedicationCreated={() => {
          setConfirmationNotice(t('today.medicationAdded'));
          loadDashboardData();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Clears the tab bar so the last item is never hidden behind it.
  bottomInset: {
    height: size.tabBarHeight + space.xl,
  },
});
