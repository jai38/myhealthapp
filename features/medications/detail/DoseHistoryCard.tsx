import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../../design/components/Actions/Button';
import { Card } from '../../../design/components/Containers/Card';
import { Divider } from '../../../design/components/Foundations/Divider';
import { Icon } from '../../../design/components/Foundations/Icon';
import { Text } from '../../../design/components/Foundations/Text';
import { StatusPill } from '../../../design/components/Trust/StatusPill';
import { t } from '../../../design/strings';
import { color, radius, space } from '../../../design/tokens';
import type { DoseLog, MedicationDetail } from '../../../services/medications/medication-service';
import { canActOnDose, doseStatusFor } from '../dose-display';

export interface DoseHistoryCardProps {
  medication: MedicationDetail;
  actionDoseId: string | null;
  onDoseAction: (
    doseLogId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes?: number
  ) => void;
}

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export function DoseHistoryCard({ medication, actionDoseId, onDoseAction }: DoseHistoryCardProps) {
  const doses = medication.doseLogs ?? [];

  return (
    <Card style={styles.stack}>
      <Text variant="title3">{t('medicines.detail.doseTitle')}</Text>
      {doses.length > 0 ? (
        doses.slice(0, 10).map((dl, index) => (
          <React.Fragment key={dl.id}>
            {index > 0 ? <Divider /> : null}
            <DoseRow
              medication={medication}
              dose={dl}
              isBusy={actionDoseId === dl.id}
              onDoseAction={onDoseAction}
            />
          </React.Fragment>
        ))
      ) : (
        <Text variant="callout" tone="secondary">
          {t('medicines.detail.noDoses')}
        </Text>
      )}
    </Card>
  );
}

interface DoseRowProps {
  medication: MedicationDetail;
  dose: DoseLog;
  isBusy: boolean;
  onDoseAction: DoseHistoryCardProps['onDoseAction'];
}

function DoseRow({ medication, dose, isBusy, onDoseAction }: DoseRowProps) {
  const isActionable = canActOnDose(dose, medication);
  const scheduledMs = new Date(dose.scheduledTime).getTime();
  const isEarly = scheduledMs > Date.now() + THIRTY_MINUTES_MS;
  const canSnooze = scheduledMs <= Date.now() + THIRTY_MINUTES_MS || dose.status === 'SNOOZED';
  const scheduled = new Date(dose.scheduledTime);

  return (
    <View style={styles.doseItem}>
      <View style={styles.doseRow}>
        <View style={styles.doseMeta}>
          <Text variant="callout">
            {t('medicines.detail.doseWhen', {
              date: scheduled.toLocaleDateString([], { month: 'short', day: 'numeric' }),
              time: scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })}
          </Text>
          {dose.notes ? (
            <Text variant="caption" tone="secondary">
              {t('medicines.detail.doseNote', { note: dose.notes })}
            </Text>
          ) : null}
        </View>
        <StatusPill display={doseStatusFor(dose, Date.now(), medication)} />
      </View>

      {dose.status === 'SNOOZED' && isActionable ? (
        <View style={styles.snoozeNotice}>
          <Icon name="alarm-outline" size="sm" color={color.tone.caution.fg} />
          <Text variant="caption" style={[styles.flex, styles.snoozeText]}>
            {t('medicines.detail.snoozeActive')}
          </Text>
        </View>
      ) : null}

      {isActionable ? (
        <View style={styles.actionRow}>
          <View style={styles.actionCell}>
            <Button
              label={isEarly ? t('medicines.detail.takeEarly') : t('medicines.detail.taken')}
              variant="primary"
              fullWidth
              disabled={isBusy}
              onPress={() => onDoseAction(dose.id, 'TAKEN')}
            />
          </View>

          <View style={styles.actionCell}>
            <Button
              label={t('medicines.detail.skip')}
              variant="secondary"
              fullWidth
              disabled={isBusy}
              onPress={() => onDoseAction(dose.id, 'SKIPPED')}
            />
          </View>

          {canSnooze ? (
            <View style={styles.actionCell}>
              <Button
                label={
                  dose.status === 'SNOOZED'
                    ? t('medicines.detail.snoozeAgain')
                    : t('medicines.detail.snooze')
                }
                variant="secondary"
                fullWidth
                disabled={isBusy}
                onPress={() => onDoseAction(dose.id, 'SNOOZED', 15)}
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space.sm,
  },
  doseItem: {
    gap: space.xs,
    paddingVertical: space.xs,
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  doseMeta: {
    flex: 1,
    gap: space.xxs,
  },
  flex: {
    flex: 1,
  },
  snoozeText: {
    color: color.tone.caution.fg,
  },
  snoozeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: color.tone.caution.bg,
    borderRadius: radius.sm,
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space.xs,
  },
  actionCell: {
    flex: 1,
  },
});
