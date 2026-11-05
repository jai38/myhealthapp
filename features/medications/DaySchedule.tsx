import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { ListGroup } from '../../design/components/Containers/ListGroup';
import { SectionHeader } from '../../design/components/Containers/SectionHeader';
import { EmptyState } from '../../design/components/Feedback/EmptyState';
import { MedicineIcon } from '../../design/components/Foundations/MedicineIcon';
import type { MedicineForm } from '../../design/components/Foundations/iconNames';
import { Text } from '../../design/components/Foundations/Text';
import { StatusPill } from '../../design/components/Trust/StatusPill';
import { t } from '../../design/strings';
import { space } from '../../design/tokens';
import type { DoseLog, MedicationRecord } from '../../services/medications/medication-service';
import { doseStatusFor, formatDoseClock } from './dose-display';

// Icon for the dose row, from the medicine's dosage form. Pills are the default.
function formFor(dosageForm: string | undefined): MedicineForm {
  const form = dosageForm?.toLowerCase() ?? '';
  if (form.includes('syrup')) return 'liquid';
  if (form.includes('drop')) return 'drops';
  return 'capsule';
}

export function DaySchedule({
  isSelectedToday,
  formattedSelectedDate,
  todayDateStr,
  setSelectedDate,
  actionableDoses,
  dayDoses,
  medications,
  actionDoseId,
  handleRecordDoseAction,
  onAddMedicine,
  nowMs,
}: {
  isSelectedToday: boolean;
  formattedSelectedDate: string;
  todayDateStr: string;
  setSelectedDate: (date: string) => void;
  actionableDoses: DoseLog[];
  dayDoses: DoseLog[];
  medications: MedicationRecord[];
  actionDoseId: string | null;
  handleRecordDoseAction: (
    doseId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes?: number
  ) => Promise<void>;
  onAddMedicine: () => void;
  nowMs: number;
}) {
  return (
    <View style={styles.root} testID="medicines-day">
      <SectionHeader
        title={
          isSelectedToday
            ? t('medicines.todayTitle')
            : t('medicines.dayTitle', { date: formattedSelectedDate })
        }
        onViewAll={isSelectedToday ? undefined : () => setSelectedDate(todayDateStr)}
        viewAllLabel={t('medicines.resetToToday')}
      />
      <Text variant="caption" tone="secondary">
        {actionableDoses.length === 0
          ? t('medicines.allRecorded')
          : t('medicines.pendingCount', { count: actionableDoses.length })}
      </Text>

      {dayDoses.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title={t('medicines.noDosesTitle', { date: formattedSelectedDate })}
          body={t('medicines.noDosesBody')}
          action={{ label: t('medicines.addRoutine'), onPress: onAddMedicine }}
          testID="medicines-day-empty"
        />
      ) : (
        <ListGroup>
          {dayDoses.map((dose) => (
            <DoseRow
              key={dose.id}
              dose={dose}
              med={medications.find((m) => m.id === dose.medicationId)}
              nowMs={nowMs}
              isBusy={actionDoseId === dose.id}
              onRecord={handleRecordDoseAction}
            />
          ))}
        </ListGroup>
      )}
    </View>
  );
}

// One scheduled dose. The status comes from doseStatusFor. Taken and Skip are the user's own taps.
function DoseRow({
  dose,
  med,
  nowMs,
  isBusy,
  onRecord,
}: {
  dose: DoseLog;
  med: MedicationRecord | undefined;
  nowMs: number;
  isBusy: boolean;
  onRecord: (
    doseId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes?: number
  ) => Promise<void>;
}) {
  const timeStr = formatDoseClock(new Date(dose.scheduledTime));
  const isTaken = dose.status === 'TAKEN';
  const isSkipped = dose.status === 'SKIPPED';
  const meta = med?.strength
    ? t('medicines.doseMeta', { strength: med.strength, time: timeStr })
    : timeStr;

  return (
    <View style={styles.row} testID={`medicines-dose-${dose.id}`}>
      <View style={styles.top}>
        <MedicineIcon form={formFor(med?.dosageForm)} size="md" tone="secondary" />
        <View style={styles.text}>
          <Text variant="title3" numberOfLines={1}>
            {med?.nameAsWritten || t('medicines.medicationFallback')}
          </Text>
          <Text variant="callout" tone="secondary">
            {meta}
          </Text>
          <StatusPill display={doseStatusFor(dose, nowMs, med)} />
        </View>
      </View>

      {!isTaken && !isSkipped ? (
        <View style={styles.actions}>
          <View style={styles.actionSlot}>
            <Button
              label={t('medicines.taken')}
              variant="primary"
              icon="checkmark"
              fullWidth
              disabled={isBusy}
              onPress={() => onRecord(dose.id, 'TAKEN')}
            />
          </View>
          <View style={styles.actionSlot}>
            <Button
              label={t('medicines.skip')}
              variant="secondary"
              fullWidth
              disabled={isBusy}
              onPress={() => onRecord(dose.id, 'SKIPPED')}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.sm,
  },
  row: {
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  text: {
    flex: 1,
    gap: space.xxs,
    alignItems: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    gap: space.sm,
  },
  actionSlot: {
    flex: 1,
  },
});
