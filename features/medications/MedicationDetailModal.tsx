import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { IconButton } from '../../design/components/Actions/IconButton';
import { ErrorState } from '../../design/components/Feedback/ErrorState';
import { Screen } from '../../design/components/Foundations/Screen';
import { Text } from '../../design/components/Foundations/Text';
import { TopBar } from '../../design/components/Navigation/TopBar';
import { t } from '../../design/strings';
import { color, space } from '../../design/tokens';
import { DoseHistoryCard } from './detail/DoseHistoryCard';
import { InstructionsCard } from './detail/InstructionsCard';
import { MedicationTitleCard } from './detail/MedicationTitleCard';
import { RegimenActionsCard } from './detail/RegimenActionsCard';
import { ReminderCard } from './detail/ReminderCard';
import { useMedicationDetail } from './detail/useMedicationDetail';

export interface MedicationDetailModalProps {
  visible: boolean;
  medicationId: string | null;
  onClose: () => void;
  onStatusChanged?: () => void;
}

export const MedicationDetailModal: React.FC<MedicationDetailModalProps> = ({
  visible,
  medicationId,
  onClose,
  onStatusChanged,
}) => {
  const detail = useMedicationDetail({ visible, medicationId, onStatusChanged });
  const { medication, loading, error } = detail;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <Screen
        header={
          <TopBar
            title={medication?.nameAsWritten || t('medicines.detail.title')}
            right={
              <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={onClose} />
            }
          />
        }
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={color.action.primary} />
            <Text variant="callout" tone="secondary">
              {t('medicines.detail.loading')}
            </Text>
          </View>
        ) : error ? (
          <ErrorState
            title={t('medicines.detail.loadErrorTitle')}
            body={error}
            onRetry={() => {
              if (medicationId) detail.loadMedication(medicationId);
            }}
          />
        ) : medication ? (
          <View style={styles.body}>
            <MedicationTitleCard medication={medication} />

            <InstructionsCard
              medication={medication}
              showDocumentPreview={detail.showDocumentPreview}
              loadingDoc={detail.loadingDoc}
              docError={detail.docError}
              documentUrlInfo={detail.documentUrlInfo}
              onOpenDocument={detail.handleOpenDocument}
              onHideDocument={() => detail.setShowDocumentPreview(false)}
            />

            <ReminderCard
              medication={medication}
              showScheduleForm={detail.showScheduleForm}
              onOpenSchedule={() => detail.setShowScheduleForm(true)}
              selectedTimes={detail.selectedTimes}
              submittingAction={detail.submittingAction}
              onSelectFrequency={detail.handleSelectFrequency}
              onTogglePresetTime={detail.handleTogglePresetTime}
              onRemoveTime={detail.handleRemoveTime}
              onAddCustomTime={detail.handleAddCustomTime}
              onCancel={() => detail.setShowScheduleForm(false)}
              onSave={
                medication.status === 'INACTIVE'
                  ? detail.handleActivate
                  : detail.handleUpdateSchedule
              }
            />

            <DoseHistoryCard
              medication={medication}
              actionDoseId={detail.actionDoseId}
              onDoseAction={detail.handleDoseAction}
            />

            <RegimenActionsCard
              status={medication.status}
              submittingAction={detail.submittingAction}
              showDiscontinuePrompt={detail.showDiscontinuePrompt}
              discontinueReason={detail.discontinueReason}
              onChangeReason={detail.setDiscontinueReason}
              onPause={detail.handlePause}
              onResume={detail.handleResume}
              onComplete={detail.handleComplete}
              onRequestDiscontinue={() => detail.setShowDiscontinuePrompt(true)}
              onCancelDiscontinue={() => detail.setShowDiscontinuePrompt(false)}
              onConfirmDiscontinue={detail.handleDiscontinueConfirm}
            />
          </View>
        ) : null}
      </Screen>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    paddingVertical: space.xxl,
  },
  body: {
    gap: space.md,
  },
});
