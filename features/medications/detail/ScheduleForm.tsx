import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button } from '../../../design/components/Actions/Button';
import { Icon } from '../../../design/components/Foundations/Icon';
import { Text } from '../../../design/components/Foundations/Text';
import { ChipGroup } from '../../../design/components/Inputs/ChipGroup';
import { t } from '../../../design/strings';
import { color, radius, space } from '../../../design/tokens';
import type { MedicationStatus } from '../../../services/medications/medication-service';
import {
  FREQUENCY_PRESETS,
  QUICK_TIME_PRESETS,
  formatTime12Hour,
} from '../reminder-time-utils';
import { ManualAddCustomTime } from '../ManualAddCustomTime';
import { FREQUENCY_LABEL_KEYS, QUICK_LABEL_KEYS } from './detailDisplay';

export interface ScheduleFormProps {
  status: MedicationStatus;
  selectedTimes: string[];
  submittingAction: boolean;
  onSelectFrequency: (times: readonly string[]) => void;
  onTogglePresetTime: (time24: string) => void;
  onRemoveTime: (time24: string) => void;
  onAddCustomTime: (time24: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

const FREQUENCY_OPTIONS = FREQUENCY_PRESETS.map((p) => ({
  value: p.label,
  label: t(FREQUENCY_LABEL_KEYS[p.label]),
}));

const QUICK_OPTIONS = QUICK_TIME_PRESETS.map((q) => ({
  value: q.time,
  label: t('medicines.detail.quickChip', {
    label: t(QUICK_LABEL_KEYS[q.label]),
    time: formatTime12Hour(q.time),
  }),
}));

// Shown only while the schedule is being edited. Holds no state of its own
// beyond what the parent passes in, so the parent's handlers stay the source of truth.
export function ScheduleForm({
  status,
  selectedTimes,
  submittingAction,
  onSelectFrequency,
  onTogglePresetTime,
  onRemoveTime,
  onAddCustomTime,
  onCancel,
  onSave,
}: ScheduleFormProps) {
  const matchingFrequency = FREQUENCY_PRESETS.find(
    (p) =>
      selectedTimes.length === p.times.length && p.times.every((time) => selectedTimes.includes(time))
  );

  // ChipGroup reports the whole next selection, so find the quick time that was tapped.
  const handleQuickChange = (next: string[]) => {
    const changed = QUICK_TIME_PRESETS.find(
      (q) => next.includes(q.time) !== selectedTimes.includes(q.time)
    );
    if (changed) onTogglePresetTime(changed.time);
  };

  return (
    <View style={styles.form}>
      <Text variant="title3">
        {status === 'INACTIVE'
          ? t('medicines.detail.formHeadingActivate')
          : t('medicines.detail.formHeadingAdjust')}
      </Text>
      <Text variant="caption" tone="secondary">
        {t('medicines.detail.formSubtext')}
      </Text>

      {/* 1. Daily frequency presets */}
      <ChipGroup
        label={t('medicines.detail.frequencyTitle')}
        options={FREQUENCY_OPTIONS}
        selected={matchingFrequency ? [matchingFrequency.label] : []}
        onChange={(next) => {
          const picked = FREQUENCY_PRESETS.find((p) => p.label === next[0]);
          if (picked) onSelectFrequency(picked.times);
        }}
      />

      {/* 2. Quick preset chips */}
      <ChipGroup
        label={t('medicines.detail.quickTitle')}
        multi
        options={QUICK_OPTIONS}
        selected={selectedTimes}
        onChange={handleQuickChange}
      />

      {/* 3. Selected reminders */}
      <View style={styles.stackTight}>
        <Text variant="overline" tone="secondary">
          {t('medicines.detail.scheduledTitle', { count: selectedTimes.length })}
        </Text>
        <View style={styles.tagRow}>
          {selectedTimes.map((time) => (
            <View key={time} style={styles.timeTag}>
              <Icon name="time" size="sm" tone="link" />
              <Text variant="callout" tone="link">
                {formatTime12Hour(time)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('medicines.detail.removeTime', {
                  time: formatTime12Hour(time),
                })}
                hitSlop={8}
                onPress={() => onRemoveTime(time)}
              >
                <Icon name="close" size="sm" tone="link" />
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* 4. Add custom time */}
      <ManualAddCustomTime onAddTime={onAddCustomTime} existingTimes={selectedTimes} />

      {/* Form actions */}
      <View style={styles.actionRow}>
        <View style={styles.actionCell}>
          <Button label={t('common.cancel')} variant="secondary" fullWidth onPress={onCancel} />
        </View>
        <View style={styles.actionCell}>
          <Button
            label={status === 'INACTIVE' ? t('medicines.detail.confirmActivate') : t('medicines.detail.saveTimes')}
            fullWidth
            loading={submittingAction}
            onPress={onSave}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border.subtle,
  },
  stackTight: {
    gap: space.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.sm,
    backgroundColor: color.tone.info.bg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  actionCell: {
    flex: 1,
  },
});
