import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../../design/components/Actions/Button';
import { Card } from '../../../design/components/Containers/Card';
import { Icon } from '../../../design/components/Foundations/Icon';
import { Text } from '../../../design/components/Foundations/Text';
import { t } from '../../../design/strings';
import { color, radius, space } from '../../../design/tokens';
import type { MedicationDetail } from '../../../services/medications/medication-service';
import { formatTime12Hour } from '../reminder-time-utils';
import { ScheduleForm } from './ScheduleForm';
import type { ScheduleFormProps } from './ScheduleForm';

export interface ReminderCardProps extends Omit<ScheduleFormProps, 'status'> {
  medication: MedicationDetail;
  showScheduleForm: boolean;
  onOpenSchedule: () => void;
  // Activate for an inactive medicine, update for an active one. Chosen by the modal.
  onSave: () => void;
}

export function ReminderCard({
  medication,
  showScheduleForm,
  onOpenSchedule,
  ...formProps
}: ReminderCardProps) {
  const times = medication.reminderTimes ?? [];
  const canEditSchedule = medication.status === 'ACTIVE' || medication.status === 'INACTIVE';

  return (
    <Card style={styles.stack}>
      <View style={styles.headerRow}>
        <Text variant="title3">{t('medicines.detail.reminderTitle')}</Text>
        {times.length > 0 ? (
          <Text variant="caption" tone="secondary">
            {times.length > 1
              ? t('medicines.detail.reminderCountMany', { count: times.length })
              : t('medicines.detail.reminderCountOne')}
          </Text>
        ) : null}
      </View>
      <Text variant="caption" tone="secondary">
        {t('medicines.detail.reminderDisclaimer')}
      </Text>

      {times.length > 0 ? (
        <View style={styles.timesRow}>
          {times.map((time, idx) => (
            <View key={idx} style={styles.timeChip}>
              <Icon name="time" size="sm" tone="link" />
              <Text variant="callout" tone="link">
                {formatTime12Hour(time)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text variant="callout" tone="secondary">
          {t('medicines.detail.noSchedule')}
        </Text>
      )}

      {medication.startDate ? (
        <Text variant="caption" tone="secondary">
          {t('medicines.detail.startDate', { date: medication.startDate })}
        </Text>
      ) : null}
      {medication.endDate ? (
        <Text variant="caption" tone="secondary">
          {t('medicines.detail.endDate', { date: medication.endDate })}
        </Text>
      ) : null}

      {showScheduleForm ? (
        <ScheduleForm {...formProps} status={medication.status} />
      ) : canEditSchedule ? (
        <Button
          label={
            medication.status === 'INACTIVE'
              ? t('medicines.detail.setReminders')
              : t('medicines.detail.adjustTimes')
          }
          variant="secondary"
          fullWidth
          onPress={onOpenSchedule}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: color.border.subtle,
  },
});
