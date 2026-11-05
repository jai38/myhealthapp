import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ChipGroup } from '../../../design/components/Inputs/ChipGroup';
import { TextField } from '../../../design/components/Inputs/TextField';
import { Icon } from '../../../design/components/Foundations/Icon';
import { Text } from '../../../design/components/Foundations/Text';
import { t } from '../../../design/strings';
import { color, radius, space } from '../../../design/tokens';
import { isAsNeededFrequency } from './reviewLogic';
import { DURATION_PRESETS, FREQUENCY_PRESETS } from './reviewTypes';
import type { EditableMedicine } from './reviewTypes';
import { ReminderTimesEditor } from './ReminderTimesEditor';

export interface MedicineScheduleProps {
  med: EditableMedicine;
  onUpdate: (updates: Partial<EditableMedicine>) => void;
}

const DURATION_OPTIONS = DURATION_PRESETS.map((preset) => ({ value: preset, label: preset }));
const FREQUENCY_OPTIONS = FREQUENCY_PRESETS.map((preset) => ({ value: preset.label, label: preset.label }));

// Course duration, frequency, then either the reminder times or the as-needed notice.
// Only shown for an active medicine.
export function MedicineSchedule({ med, onUpdate }: MedicineScheduleProps) {
  const isAsNeeded = isAsNeededFrequency(med.frequency_text);

  return (
    <View style={styles.container}>
      <ChipGroup
        label={t('prescriptions.review.durationLabel')}
        options={DURATION_OPTIONS}
        selected={med.duration_text ? [med.duration_text] : []}
        onChange={(next) => {
          const [picked] = next;
          if (picked === undefined) return;
          onUpdate({ duration_text: picked });
        }}
      />

      <TextField
        label={t('prescriptions.review.customDurationLabel')}
        value={med.duration_text || ''}
        onChangeText={(val) => onUpdate({ duration_text: val })}
        placeholder={t('prescriptions.review.customDurationPlaceholder')}
      />

      <ChipGroup
        label={t('prescriptions.review.frequencyLabel')}
        options={FREQUENCY_OPTIONS}
        selected={med.frequency_text ? [med.frequency_text] : []}
        onChange={(next) => {
          const [picked] = next;
          const preset = FREQUENCY_PRESETS.find((p) => p.label === picked);
          if (preset === undefined) return;
          if (preset.label === 'As Needed') {
            onUpdate({
              frequency_text: 'As Needed',
              times_per_day: 0,
              reminder_times: [],
            });
          } else {
            onUpdate({
              frequency_text: preset.label,
              times_per_day: preset.times.length,
              reminder_times: [...preset.times],
            });
          }
        }}
      />

      {isAsNeeded ? (
        <View style={styles.asNeededCard}>
          <Icon name="information-circle-outline" tone="link" />
          <View style={styles.flex}>
            <Text variant="caption" tone="primary">
              {t('prescriptions.review.asNeededTitle')}
            </Text>
            <Text variant="caption" tone="secondary">
              {t('prescriptions.review.asNeededText')}
            </Text>
          </View>
        </View>
      ) : (
        <ReminderTimesEditor med={med} onUpdate={onUpdate} />
      )}

      <TextField
        label={t('prescriptions.review.totalCountLabel')}
        value={med.total_count || ''}
        onChangeText={(val) => onUpdate({ total_count: val })}
        placeholder={t('prescriptions.review.totalCountPlaceholder')}
        helper={t('prescriptions.review.totalCountHelp')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: color.bg.subtle,
  },
  asNeededCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: color.tone.success.bg,
  },
  flex: {
    flex: 1,
    gap: space.xxs,
  },
});
