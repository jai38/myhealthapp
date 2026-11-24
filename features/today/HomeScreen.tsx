// S06 Today (04b task 13; designes/design/screens.md). Built on todayModel and doseStatusDisplay,
// unchanged. Clinical rules (CLAUDE.md 10-15):
// - A dose becomes Taken only when the user taps Mark as Taken (or Taken in a row's menu). That
//   logs the current time; Undo puts the dose back to PENDING within about 5 seconds.
// - An unrecorded past dose shows Not confirmed. Nothing here marks a dose Missed.
// - The hero counts recorded Taken doses only.
// - Paused and stopped medicines' doses never appear (todayModel leaves them out).
import React, { useEffect, useState } from 'react';
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
import { previewDoseUpdate } from '../dev-preview/previewSeam';
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
import { DoseUpdateSheet } from './DoseUpdateSheet';
import { canOpenDoseUpdate } from './doseUpdate';
import type { DoseUpdateRequest } from './doseUpdate';
import type { DoseLog } from '../../services/medications/medication-service';
import { TodayAsNeeded } from './TodayActions';
import {
  TodayGreetingV4,
  TodayGroupCard,
  TodayHero,
  TodayQuickActionsV4,
  TodaySkeleton,
} from './TodayParts';

const SAVED_NOTICE_MS = 4000;

export default function HomeScreen() {
  const router = useRouter();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isManualAddVisible, setIsManualAddVisible] = useState(false);
  const [expanded, setExpanded] = useState<ReadonlySet<DayPart>>(new Set());
  const [undo, setUndo] = useState<{ doseId: string; message: string } | null>(null);
  const [menuFor, setMenuFor] = useState<TodayDose | null>(null);
  const [updating, setUpdating] = useState<TodayDose | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

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
  const { actionNotice, handleRecordAsNeededDose } = useDoseActions(medications);

  // Dev preview only (null in release): open S07 for one dose once it has loaded.
  const previewSheet = previewDoseUpdate();
  const [previewOpened, setPreviewOpened] = useState(false);
  useEffect(() => {
    if (!previewSheet || previewOpened) return;
    const item = allTodayItems(groups).find((d) => d.dose.id === previewSheet.doseId);
    if (item) {
      setPreviewOpened(true);
      setUpdating(item);
    }
  }, [previewSheet, previewOpened, groups]);

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
    saved: savedNotice ?? confirmationNotice ?? actionNotice,
  });

  const openUpload = () => setIsPickerVisible(true);
  const openManualAdd = () => setIsManualAddVisible(true);
  const openMedicine = (item: TodayDose) =>
    router.push(medicineOpenTarget(item.dose.medicationId, Date.now().toString()));
  // S07 opens only for a Due now or Not confirmed dose; other rows open the medicine.
  const canUpdate = (item: TodayDose) =>
    canOpenDoseUpdate(item.dose, medicationFor(item.dose.medicationId), nowMs);
  const openRow = (item: TodayDose) => (canUpdate(item) ? setUpdating(item) : openMedicine(item));

  // S07 Save: records exactly what the patient chose. Throws when not saved, so the sheet
  // offers Retry; the store has already put the dose back as it was.
  const saveUpdate = async (dose: DoseLog, request: DoseUpdateRequest) => {
    await medicationStore.recordAction(
      dose.id,
      request.action,
      undefined,
      request.action === 'TAKEN'
        ? { actionTime: request.actionTime }
        : request.action === 'SKIPPED' && request.skipReason
          ? { skipReason: request.skipReason }
          : {},
    );
    setUpdating(null);
    const name = medicationFor(dose.medicationId)?.nameAsWritten || t('today.unknownMedicine');
    setSavedNotice(t('doseUpdate.saved', { name }));
    setTimeout(() => setSavedNotice(null), SAVED_NOTICE_MS);
  };

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
                onOpen={openRow}
                canUpdate={canUpdate}
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
          {menuFor && canUpdate(menuFor) ? (
            <Button
              label={t('today.updateDose')}
              onPress={() => {
                const item = menuFor;
                setMenuFor(null);
                setUpdating(item);
              }}
              testID="today-row-menu-update"
            />
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

      <DoseUpdateSheet
        dose={updating?.dose ?? null}
        medication={updating ? (medicationFor(updating.dose.medicationId) ?? null) : null}
        nowMs={nowMs}
        offline={isOffline}
        onClose={() => setUpdating(null)}
        onSave={saveUpdate}
        initialDraft={previewSheet && updating?.dose.id === previewSheet.doseId ? previewSheet.draft : undefined}
      />

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
