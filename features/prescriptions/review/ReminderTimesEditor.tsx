import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../../design/components/Actions/Button';
import { ChipGroup } from '../../../design/components/Inputs/ChipGroup';
import { TextField } from '../../../design/components/Inputs/TextField';
import { Icon } from '../../../design/components/Foundations/Icon';
import { Text } from '../../../design/components/Foundations/Text';
import { t } from '../../../design/strings';
import type { StringKey } from '../../../design/strings';
import { color, radius, space } from '../../../design/tokens';
import { formatTime12Hour } from '../../medications/reminder-time-utils';
import { DEFAULT_REMINDER_TIME, TIME_PRESET_VALUES } from './reviewTypes';
import type { EditableMedicine } from './reviewTypes';
import { TextAction } from './TextAction';

export interface ReminderTimesEditorProps {
  med: EditableMedicine;
  onUpdate: (updates: Partial<EditableMedicine>) => void;
}

const TIME_PRESET_LABEL_KEYS: Record<(typeof TIME_PRESET_VALUES)[number], StringKey> = {
  '08:00': 'prescriptions.review.timeMorning',
  '13:00': 'prescriptions.review.timeNoon',
  '18:00': 'prescriptions.review.timeEvening',
  '21:00': 'prescriptions.review.timeBedtime',
};

const TIME_PRESET_OPTIONS = TIME_PRESET_VALUES.map((time) => ({
  value: time,
  label: t(TIME_PRESET_LABEL_KEYS[time]),
}));

// One card per daily dose: a quick preset row, then a free-typed HH:MM value.
// The value is stored as typed, the same as before.
export function ReminderTimesEditor({ med, onUpdate }: ReminderTimesEditorProps) {
  const timesToShow =
    med.reminder_times && med.reminder_times.length > 0 ? med.reminder_times : [DEFAULT_REMINDER_TIME];

  return (
    <View style={styles.container}>
      <Text variant="caption" tone="primary">
        {t('prescriptions.review.remindersLabel')}
      </Text>
      <Text variant="caption" tone="secondary">
        {t('prescriptions.review.remindersHelp')}
      </Text>

      {timesToShow.map((timeStr, timeIdx) => (
        <View key={timeIdx} style={styles.doseCard}>
          <View style={styles.doseHeader}>
            <View style={styles.doseLabel}>
              <Icon name="time-outline" size="sm" tone="link" />
              <Text variant="bodyStrong">{t('prescriptions.review.doseLabel', { n: timeIdx + 1 })}</Text>
              <Text variant="bodyStrong" tone="link">
                {formatTime12Hour(timeStr)}
              </Text>
            </View>

            {med.reminder_times && med.reminder_times.length > 1 && (
              <TextAction
                label={t('prescriptions.review.removeDose')}
                icon="close"
                tone="danger"
                onPress={() => {
                  const updated = (med.reminder_times || []).filter((_, i) => i !== timeIdx);
                  onUpdate({
                    reminder_times: updated,
                    times_per_day: updated.length,
                  });
                }}
              />
            )}
          </View>

          <ChipGroup
            options={TIME_PRESET_OPTIONS}
            selected={[timeStr]}
            onChange={(next) => {
              const [picked] = next;
              if (picked === undefined) return;
              const newTimes = [...(med.reminder_times || [DEFAULT_REMINDER_TIME])];
              newTimes[timeIdx] = picked;
              onUpdate({ reminder_times: newTimes });
            }}
          />

          <TextField
            label={t('prescriptions.review.customTimeLabel')}
            value={timeStr}
            placeholder={t('prescriptions.review.timePlaceholder')}
            helper={t('prescriptions.review.timePreview', { time: formatTime12Hour(timeStr) })}
            maxLength={5}
            autoCapitalize="none"
            onChangeText={(val) => {
              const newTimes = [...(med.reminder_times || [DEFAULT_REMINDER_TIME])];
              newTimes[timeIdx] = val;
              onUpdate({ reminder_times: newTimes });
            }}
          />
        </View>
      ))}

      <View style={styles.addRow}>
        <Button
          label={t('prescriptions.review.addReminderTime')}
          icon="add"
          variant="secondary"
          onPress={() => {
            const current = med.reminder_times || [];
            const defaultNext =
              current.length === 1 ? '20:00' : current.length === 2 ? '13:00' : '22:00';
            const updated = [...current, defaultNext];
            onUpdate({
              reminder_times: updated,
              times_per_day: updated.length,
            });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.sm,
  },
  doseCard: {
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: color.bg.subtle,
  },
  doseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  doseLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    flexShrink: 1,
  },
  addRow: {
    alignItems: 'flex-start',
  },
});
