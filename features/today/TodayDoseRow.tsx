import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { ListGroup } from '../../design/components/Containers/ListGroup';
import { ListRow } from '../../design/components/Containers/ListRow';
import { SectionHeader } from '../../design/components/Containers/SectionHeader';
import { MedicineIcon } from '../../design/components/Foundations/MedicineIcon';
import { Text } from '../../design/components/Foundations/Text';
import { StatusPill } from '../../design/components/Trust/StatusPill';
import { space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { MedicationRecord } from '../../services/medications/medication-service';
import { doseStatusDisplayFor, hasScheduledTime, type TodayDose } from './todayModel';
import { formatTodayTime, medicineFormFor } from './todaySections';
import type { RecordFn } from './TodayNextDose';

// Which buttons a row offers. Upcoming and later doses need none.
export type RowActions = 'none' | 'taken' | 'takenOrSkip';

// The pill already shows a time for these states, so the row does not repeat it.
const TIME_IN_PILL: ReadonlyArray<TodayDose['state']['kind']> = ['upcoming', 'snoozed', 'taken'];

export interface TodayDoseRowProps {
  item: TodayDose;
  medication: MedicationRecord | null | undefined;
  actions: RowActions;
  actionDoseId: string | null;
  onRecord: RecordFn;
}

export function TodayDoseRow({ item, medication, actions, actionDoseId, onRecord }: TodayDoseRowProps) {
  const { dose, state } = item;
  const busy = actionDoseId === dose.id;
  const otherBusy = actionDoseId !== null && !busy;
  const subtitle = TIME_IN_PILL.includes(state.kind)
    ? undefined
    : hasScheduledTime(dose)
      ? t('today.scheduledAt', { time: formatTodayTime(new Date(item.scheduledMs)) })
      : t('status.timeUnknown');

  return (
    <View style={styles.row} testID={`today-row-${dose.id}`}>
      <ListRow
        title={medication?.nameAsWritten ?? t('today.unknownMedicine')}
        subtitle={subtitle}
        leading={<MedicineIcon form={medicineFormFor(medication?.dosageForm)} />}
        trailing={<StatusPill display={doseStatusDisplayFor(dose, state, formatTodayTime)} />}
      />
      {actions !== 'none' ? (
        <View style={styles.actions}>
          <Button
            label={t('today.taken')}
            onPress={() => onRecord(dose.id, 'TAKEN')}
            loading={busy}
            disabled={otherBusy}
            testID={`today-row-${dose.id}-taken`}
          />
          {actions === 'takenOrSkip' ? (
            <Button
              label={t('today.skip')}
              variant="text"
              onPress={() => onRecord(dose.id, 'SKIPPED')}
              disabled={busy || otherBusy}
              testID={`today-row-${dose.id}-skip`}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export interface TodayDoseSectionProps {
  title: string;
  note?: string;
  items: TodayDose[];
  medicationFor: (medicationId: string) => MedicationRecord | null | undefined;
  actions: RowActions;
  actionDoseId: string | null;
  onRecord: RecordFn;
  testID?: string;
}

// A titled list of dose rows, grouped in one card with hairlines between rows.
export function TodayDoseSection({
  title,
  note,
  items,
  medicationFor,
  actions,
  actionDoseId,
  onRecord,
  testID,
}: TodayDoseSectionProps) {
  return (
    <View style={styles.section} testID={testID}>
      <SectionHeader title={title} />
      {note !== undefined ? (
        <Text variant="callout" tone="secondary">
          {note}
        </Text>
      ) : null}
      <ListGroup>
        {items.map((item) => (
          <TodayDoseRow
            key={item.dose.id}
            item={item}
            medication={medicationFor(item.dose.medicationId)}
            actions={actions}
            actionDoseId={actionDoseId}
            onRecord={onRecord}
          />
        ))}
      </ListGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: space.sm,
    marginTop: space.xl,
  },
  row: {
    gap: space.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingBottom: space.sm,
    paddingHorizontal: space.lg,
  },
});
