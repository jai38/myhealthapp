import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { Card } from '../../design/components/Containers/Card';
import { StatusPill } from '../../design/components/Trust/StatusPill';
import { Text } from '../../design/components/Foundations/Text';
import { doseStatusDisplay } from '../../design/status';
import { space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { MedicationRecord } from '../../services/medications/medication-service';
import type { TodayDose } from './todayModel';
import { formatTodayTime } from './todaySections';

export type RecordAction = 'TAKEN' | 'SKIPPED' | 'SNOOZED';
export type RecordFn = (doseId: string, action: RecordAction, snoozeMinutes?: number) => void;

export interface TodayNextDoseProps {
  next: TodayDose & { medication: MedicationRecord | null };
  actionDoseId: string | null;
  onRecord: RecordFn;
}

// The one dose to act on now. Its status label comes from doseStatusDisplay only.
export function TodayNextDose({ next, actionDoseId, onRecord }: TodayNextDoseProps) {
  const { dose, state, scheduledMs, medication } = next;
  const busy = actionDoseId === dose.id;
  const otherBusy = actionDoseId !== null && !busy;
  const scheduled = formatTodayTime(new Date(scheduledMs));

  return (
    <Card variant="hero" testID="today-next-dose">
      <View style={styles.body}>
        <Text variant="overline" tone="secondary">
          {t('today.nextDose')}
        </Text>
        <Text variant="title2" testID="today-next-name">
          {medication?.nameAsWritten ?? t('today.unknownMedicine')}
        </Text>
        {medication?.strength ? (
          <Text variant="callout" tone="secondary">
            {medication.strength}
          </Text>
        ) : null}
        <Text variant="callout" tone="secondary">
          {t('today.scheduledAt', { time: scheduled })}
        </Text>
        <StatusPill display={doseStatusDisplay(state, formatTodayTime)} testID="today-next-status" />
      </View>
      <View style={styles.actions}>
        <Button
          label={t('today.taken')}
          onPress={() => onRecord(dose.id, 'TAKEN')}
          loading={busy}
          disabled={otherBusy}
          testID="today-next-taken"
        />
        <Button
          label={t('today.snooze15')}
          variant="secondary"
          onPress={() => onRecord(dose.id, 'SNOOZED', 15)}
          disabled={busy || otherBusy}
          testID="today-next-snooze"
        />
        <Button
          label={t('today.skip')}
          variant="text"
          onPress={() => onRecord(dose.id, 'SKIPPED')}
          disabled={busy || otherBusy}
          testID="today-next-skip"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: space.xs,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.lg,
  },
});
