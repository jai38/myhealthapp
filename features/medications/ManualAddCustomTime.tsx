import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { Text } from '../../design/components/Foundations/Text';
import type { Time24 } from '../../design/components/Inputs/time';
import { TimeField } from '../../design/components/Inputs/TimeField';
import { t } from '../../design/strings';
import { space } from '../../design/tokens';
import { formatTime12Hour } from './reminder-time-utils';

export interface ManualAddCustomTimeProps {
  onAddTime: (time24: string) => void;
  existingTimes: string[];
}

const DEFAULT_TIME: Time24 = { hour: 8, minute: 0 };
const FEEDBACK_MS = 2500;

// "HH:mm" in 24-hour form, the format the reminder list stores.
function toTime24(time: Time24): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
}

// Mounted only while the modal is open, so the chosen time resets on each open.
export function ManualAddCustomTime({ onAddTime, existingTimes }: ManualAddCustomTimeProps) {
  const [time, setTime] = useState<Time24 | null>(DEFAULT_TIME);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAdd = () => {
    if (!time) return;
    const time24 = toTime24(time);
    const formatted12h = formatTime12Hour(time24);

    if (existingTimes.includes(time24)) {
      Alert.alert(
        t('medicines.manual.timeExistsTitle'),
        t('medicines.manual.timeExistsBody', { time: formatted12h })
      );
      return;
    }
    onAddTime(time24);
    setFeedback(t('medicines.manual.timeAdded', { time: formatted12h }));
    setTimeout(() => setFeedback(null), FEEDBACK_MS);
  };

  return (
    <View style={styles.wrap}>
      <Text variant="title3">{t('medicines.manual.customTitle')}</Text>
      <TimeField label={t('medicines.manual.customLabel')} value={DEFAULT_TIME} onChange={setTime} />
      <Button
        label={t('medicines.manual.addTime')}
        variant="secondary"
        onPress={handleAdd}
        disabled={!time}
        fullWidth
      />
      {feedback ? (
        <Text variant="caption" tone="secondary" accessibilityLiveRegion="polite">
          {feedback}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.md,
  },
});
