import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { Card } from '../../design/components/Containers/Card';
import { IconTile } from '../../design/components/Containers/IconTile';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { StatusPill } from '../../design/components/Trust/StatusPill';
import { t } from '../../design/strings';
import { color, radius, space } from '../../design/tokens';
import type { DoseLog, MedicationRecord } from '../../services/medications/medication-service';
import { doseStatusFor } from './dose-display';

export function NextDoseCard({
  nextDose,
  nextMed,
  nextTimeStr,
  nowMs,
  isSelectedToday,
  formattedSelectedDate,
  totalDosesCount,
  takenDosesCount,
  actionableDoses,
  actionDoseId,
  handleRecordDoseAction,
}: {
  nextDose: DoseLog | undefined;
  nextMed: MedicationRecord | null | undefined;
  nextTimeStr: string;
  nowMs: number;
  isSelectedToday: boolean;
  formattedSelectedDate: string;
  totalDosesCount: number;
  takenDosesCount: number;
  actionableDoses: DoseLog[];
  actionDoseId: string | null;
  handleRecordDoseAction: (
    doseId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes?: number
  ) => Promise<void>;
}) {
  if (nextDose && nextMed) {
    const busy = actionDoseId === nextDose.id;
    const subtitle = nextMed.strength
      ? t('medicines.heroTimeWithStrength', { strength: nextMed.strength, time: nextTimeStr })
      : t('medicines.heroTime', { time: nextTimeStr });

    return (
      <Card variant="hero" testID="medicines-next-dose">
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Icon name="alarm" size="sm" tone="info" />
            <Text variant="overline" tone="link">
              {isSelectedToday ? t('medicines.nextReminder') : t('medicines.scheduledDose')}
            </Text>
          </View>
          <View style={styles.timeChip}>
            <Text variant="bodyStrong" tone="link">
              {nextTimeStr}
            </Text>
          </View>
        </View>

        <Text variant="title2" style={styles.title}>
          {nextMed.nameAsWritten}
        </Text>
        <Text variant="callout" tone="secondary">
          {subtitle}
        </Text>

        <View style={styles.pillRow}>
          <StatusPill display={doseStatusFor(nextDose, nowMs, nextMed)} testID="medicines-next-status" />
        </View>

        <View style={styles.actionRow}>
          <View style={styles.actionSlot}>
            <Button
              label={t('medicines.skip')}
              variant="secondary"
              fullWidth
              disabled={busy}
              onPress={() => handleRecordDoseAction(nextDose.id, 'SKIPPED')}
            />
          </View>
          <View style={styles.actionSlot}>
            <Button
              label={nextDose.status === 'SNOOZED' ? t('medicines.snoozeAgain') : t('medicines.snooze')}
              variant="secondary"
              fullWidth
              disabled={busy}
              onPress={() => handleRecordDoseAction(nextDose.id, 'SNOOZED', 15)}
            />
          </View>
          <View style={styles.actionSlot}>
            <Button
              label={t('medicines.taken')}
              variant="primary"
              icon="checkmark"
              fullWidth
              disabled={busy}
              onPress={() => handleRecordDoseAction(nextDose.id, 'TAKEN')}
            />
          </View>
        </View>
      </Card>
    );
  }

  if (totalDosesCount > 0 && actionableDoses.length === 0) {
    return (
      <Card testID="medicines-all-logged">
        <View style={styles.caughtRow}>
          <IconTile icon="checkmark" tone="green" />
          <View style={styles.caughtText}>
            <Text variant="title3">{t('medicines.allLoggedTitle')}</Text>
            <Text variant="callout" tone="secondary">
              {t('medicines.allLoggedBody', {
                taken: takenDosesCount,
                total: totalDosesCount,
                date: formattedSelectedDate,
              })}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  timeChip: {
    backgroundColor: color.bg.card,
    borderRadius: radius.full,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  title: {
    marginBottom: space.xxs,
  },
  pillRow: {
    marginTop: space.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.lg,
  },
  actionSlot: {
    flex: 1,
  },
  caughtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  caughtText: {
    flex: 1,
    gap: space.xxs,
  },
});
