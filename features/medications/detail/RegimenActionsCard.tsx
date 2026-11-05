import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../../design/components/Actions/Button';
import { Card } from '../../../design/components/Containers/Card';
import { Text } from '../../../design/components/Foundations/Text';
import { TextField } from '../../../design/components/Inputs/TextField';
import { t } from '../../../design/strings';
import { space } from '../../../design/tokens';
import type { MedicationStatus } from '../../../services/medications/medication-service';

export interface RegimenActionsCardProps {
  status: MedicationStatus;
  submittingAction: boolean;
  showDiscontinuePrompt: boolean;
  discontinueReason: string;
  onChangeReason: (text: string) => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onRequestDiscontinue: () => void;
  onCancelDiscontinue: () => void;
  onConfirmDiscontinue: () => void;
}

export function RegimenActionsCard({
  status,
  submittingAction,
  showDiscontinuePrompt,
  discontinueReason,
  onChangeReason,
  onPause,
  onResume,
  onComplete,
  onRequestDiscontinue,
  onCancelDiscontinue,
  onConfirmDiscontinue,
}: RegimenActionsCardProps) {
  return (
    <Card style={styles.stack}>
      <Text variant="title3">{t('medicines.detail.actionsTitle')}</Text>
      <Text variant="caption" tone="secondary">
        {t('medicines.detail.actionsDisclaimer')}
      </Text>

      {status === 'ACTIVE' ? (
        <View style={styles.stack}>
          <Button
            label={t('medicines.detail.pauseRegimen')}
            variant="secondary"
            fullWidth
            loading={submittingAction}
            onPress={onPause}
          />
          <Button
            label={t('medicines.detail.markCourseCompleted')}
            variant="secondary"
            fullWidth
            loading={submittingAction}
            onPress={onComplete}
          />
          <Button
            label={t('medicines.detail.discontinue')}
            variant="danger"
            fullWidth
            loading={submittingAction}
            onPress={onRequestDiscontinue}
          />
        </View>
      ) : null}

      {status === 'PAUSED' ? (
        <View style={styles.stack}>
          <Button
            label={t('medicines.detail.resumeRegimen')}
            variant="primary"
            fullWidth
            loading={submittingAction}
            onPress={onResume}
          />
          <Button
            label={t('medicines.detail.markCompleted')}
            variant="secondary"
            fullWidth
            loading={submittingAction}
            onPress={onComplete}
          />
          <Button
            label={t('medicines.detail.discontinue')}
            variant="danger"
            fullWidth
            loading={submittingAction}
            onPress={onRequestDiscontinue}
          />
        </View>
      ) : null}

      {showDiscontinuePrompt ? (
        <View style={styles.stack}>
          <Text variant="title3" tone="danger">
            {t('medicines.detail.discontinue')}
          </Text>
          <Text variant="caption" tone="secondary">
            {t('medicines.detail.discontinueHelp')}
          </Text>
          <TextField
            label={t('medicines.detail.reasonLabel')}
            value={discontinueReason}
            onChangeText={onChangeReason}
          />
          <View style={styles.actionRow}>
            <View style={styles.actionCell}>
              <Button
                label={t('common.cancel')}
                variant="secondary"
                fullWidth
                onPress={onCancelDiscontinue}
              />
            </View>
            <View style={styles.actionCell}>
              <Button
                label={t('medicines.detail.confirmDiscontinue')}
                variant="danger"
                fullWidth
                loading={submittingAction}
                onPress={onConfirmDiscontinue}
              />
            </View>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  actionCell: {
    flex: 1,
  },
});
