// S06 Today (04b task 13; designes/design/screens.md). Built on todayModel and doseStatusDisplay,
// unchanged. Clinical rules (CLAUDE.md 10-15):
// - A dose becomes Taken only when the user taps Mark as Taken (or Taken in a row's menu). That
//   logs the current time; Undo puts the dose back to PENDING within about 5 seconds.
// - An unrecorded past dose shows Not confirmed. Nothing here marks a dose Missed.
// - The hero counts recorded Taken doses only.
// - Paused and stopped medicines' doses never appear (todayModel leaves them out).
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../design/components/Foundations/Screen';
import { Text } from '../../design/components/Foundations/Text';
import { Button } from '../../design/components/Actions/Button';
import { UndoToast } from '../../design/components/Actions/UndoToast';
import { BottomSheet } from '../../design/components/Containers/BottomSheet';
import { NoticeSlot } from '../../design/components/Glass';
import { space } from '../../design/tokens';
import { t } from '../../design/strings';
import { DocumentPickerModal } from '../documents/DocumentPickerModal';
import { ReviewPrescriptionScreen } from '../prescriptions/ReviewPrescriptionScreen';
import { ManualAddMedicationModal } from '../medications/ManualAddMedicationModal';
import { medicationStore } from '../../services/medications/medication-store';
import { medicineOpenTarget } from '../shell/tabs';
import { useToday } from './useToday';
import { usePrescriptionUpload } from './usePrescriptionUpload';
import { useDoseActions } from './useDoseActions';
import type { TodayDose } from './todayModel';
import { asNeededMedications, formatTodayTime } from './todaySections';
import {
  allTodayItems,
  heroModel,
  markTakenDoseId,
  todayGroups,
  todayNotices,
} from './todayView';
import type { DayPart } from './todayView';
import { TodayNewUser } from './TodayStates';
import { TodayAsNeeded } from './TodayActions';
import {
  TodayGreetingV4,
  TodayGroupCard,
  TodayHero,
  TodayQuickActionsV4,
  TodaySkeleton,
} from './TodayParts';

/** Kinds a row's menu can record now: Taken or Skip. Upcoming doses can't be recorded yet. */
const ACTIONABLE = new Set<TodayDose['state']['kind']>(['dueNow', 'notConfirmed', 'snoozed']);

export default function HomeScreen() {
  const router = useRouter();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isManualAddVisible, setIsManualAddVisible] = useState(false);
  const [expanded, setExpanded] = useState<ReadonlySet<DayPart>>(new Set());
  const [undo, setUndo] = useState<{ doseId: string; message: string } | null>(null);
  const [menuFor, setMenuFor] = useState<TodayDose | null>(null);

  const {
    screenState,
    groups,
    next,
    greeting,
    isOffline,
    lastUpdatedAt,
    retry,
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
  const { actionNotice, handleRecordAsNeededDose, handleRecordDoseAction } = useDoseActions(medications);

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

  const medicationFor = (id: string) =>
    medications.find((m) => m.id === id) ?? medicationStore.getMedicationById(id);
  const allMeds = medications.length > 0 ? medications : medicationStore.getMedications();
  const asNeeded = asNeededMedications(allMeds);
  const items = allTodayItems(groups);
  const nextName = next ? next.medication?.nameAsWritten || t('today.unknownMedicine') : null;
  const hero = heroModel({
    screenState,
    items,
    next: next && nextName ? { name: nextName, time: formatTodayTime(new Date(next.scheduledMs)) } : null,
  });
  const markTakenId = markTakenDoseId(groups);
  const offlineReason = isOffline ? t('today.offlineNoMark') : null;

  const notices = todayNotices({
    toastVisible: undo !== null,
    loadError: screenState === 'error' ? t('feedback.errorBody') : null,
    uploadError,
    uploading: isProcessing ? processingStatus : null,
    saved: confirmationNotice ?? actionNotice,
  });

  const openUpload = () => setIsPickerVisible(true);
  const openManualAdd = () => setIsManualAddVisible(true);
  const openMedicine = (item: TodayDose) =>
    router.push(medicineOpenTarget(item.dose.medicationId, Date.now().toString()));

  // Mark as Taken: the user's explicit tap logs the current time, then offers Undo.
  const markTaken = async (doseId: string) => {
    try {
      const saved = await medicationStore.recordAction(doseId, 'TAKEN');
      const name = medicationFor(saved.medicationId)?.nameAsWritten || t('today.unknownMedicine');
      const time = formatTodayTime(new Date(saved.actionTime ?? Date.now()));
      setUndo({ doseId, message: t('today.markedTaken', { name, time }) });
    } catch {
      Alert.alert(t('status.doseActionFailedTitle'), t('status.doseActionFailedBody'));
    }
  };

  const undoTaken = async () => {
    const current = undo;
    setUndo(null);
    if (!current) return;
    try {
      await medicationStore.undoAction(current.doseId);
    } catch {
      Alert.alert(t('status.doseActionFailedTitle'), t('status.doseActionFailedBody'));
    }
  };

  const toggle = (part: DayPart) =>
    setExpanded((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(part)) nextSet.delete(part);
      else nextSet.add(part);
      return nextSet;
    });

  const showDay = screenState === 'due' || screenState === 'allDone' || screenState === 'nothingDue';

  return (
    <Screen
      testID="today-screen"
      overlay={
        <UndoToast
          visible={undo !== null}
          message={undo?.message ?? ''}
          onUndo={() => void undoTaken()}
          onDismiss={() => setUndo(null)}
          testID="today-undo-toast"
        />
      }
    >
      <View style={styles.page}>
        <TodayGreetingV4 text={t(greeting.key, greeting.params)} />

        {/* Offline: the app's offline banner says so; Today adds when its data is from. */}
        {isOffline && lastUpdatedAt !== null ? (
          <Text variant="caption" tone="secondary" tabular testID="today-last-updated">
            {t('feedback.lastUpdated', { time: formatTodayTime(new Date(lastUpdatedAt)) })}
          </Text>
        ) : null}

        <NoticeSlot
          testID="today-notice"
          notices={notices}
          action={{ label: t('common.retry'), onPress: () => void retry(), forKind: 'error' }}
        />

        {screenState === 'loading' ? <TodaySkeleton /> : null}

        {screenState === 'newUser' ? <TodayNewUser onScan={openUpload} onAddManual={openManualAdd} /> : null}

        {showDay ? (
          <>
            <TodayHero model={hero} />
            {todayGroups(items).map((group) => (
              <TodayGroupCard
                key={group.part}
                group={group}
                expanded={expanded.has(group.part)}
                onToggle={() => toggle(group.part)}
                medicationFor={medicationFor}
                markTakenId={markTakenId}
                markTakenDisabledReason={offlineReason}
                onMarkTaken={(id) => void markTaken(id)}
                onOpen={openMedicine}
                onMore={setMenuFor}
              />
            ))}
            {asNeeded.length > 0 ? (
              <TodayAsNeeded medications={asNeeded} onTookDose={(med) => void handleRecordAsNeededDose(med)} />
            ) : null}
            <TodayQuickActionsV4 onUpload={openUpload} onAdd={openManualAdd} disabled={isProcessing} />
          </>
        ) : null}
      </View>

      <BottomSheet
        visible={menuFor !== null}
        onClose={() => setMenuFor(null)}
        title={menuFor ? medicationFor(menuFor.dose.medicationId)?.nameAsWritten : undefined}
        testID="today-row-menu"
      >
        <View style={styles.menu}>
          {menuFor && ACTIONABLE.has(menuFor.state.kind) ? (
            <>
              <Button
                label={t('today.taken')}
                disabled={isOffline}
                onPress={() => {
                  const id = menuFor.dose.id;
                  setMenuFor(null);
                  void handleRecordDoseAction(id, 'TAKEN');
                }}
                testID="today-row-menu-taken"
              />
              <Button
                label={t('today.skip')}
                variant="secondary"
                disabled={isOffline}
                onPress={() => {
                  const id = menuFor.dose.id;
                  setMenuFor(null);
                  void handleRecordDoseAction(id, 'SKIPPED');
                }}
                testID="today-row-menu-skip"
              />
            </>
          ) : null}
          {menuFor ? (
            <Button
              label={t('today.openMedicine')}
              variant="secondary"
              onPress={() => {
                const item = menuFor;
                setMenuFor(null);
                openMedicine(item);
              }}
              testID="today-row-menu-open"
            />
          ) : null}
        </View>
      </BottomSheet>

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
  page: { gap: space.xl, paddingTop: space.sm },
  menu: { gap: space.md, paddingVertical: space.md },
});
