import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { spacing } from '../../theme/index';
import { MedicationRecord, DoseLog } from '../../services/medications/medication-service';
import { styles } from './styles-hero';
import { formatTimeDifference } from './utils';
import { doseStatusDisplay, type DoseDisplayState } from '../../design/status';
import { t } from '../../design/strings';

export function DoseHeroSection({
  nextDose,
  nextMed,
  nextDoseState,
  diffMinutes,
  nextTimeStr,
  isSelectedDateToday,
  formattedSelectedDate,
  actionableDoses,
  totalDosesCount,
  takenDosesCount,
  actionDoseId,
  handleRecordDoseAction,
  onAddManual,
}: {
  nextDose: DoseLog | null;
  nextMed: MedicationRecord | null | undefined;
  nextDoseState: DoseDisplayState | null;
  diffMinutes: number;
  nextTimeStr: string;
  isSelectedDateToday: boolean;
  formattedSelectedDate: string;
  actionableDoses: DoseLog[];
  totalDosesCount: number;
  takenDosesCount: number;
  actionDoseId: string | null;
  handleRecordDoseAction: (
    doseId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes?: number
  ) => Promise<void>;
  onAddManual: () => void;
}) {
  const statusDisplay = nextDoseState
    ? doseStatusDisplay(nextDoseState, (d) =>
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      )
    : null;
  const statusLabel = statusDisplay ? t(statusDisplay.labelKey, statusDisplay.labelParams) : '';
  return (
    <>
          {/* 5. 1-TAP UPCOMING / DUE DOSE CARD */}
          {nextDose && nextMed ? (
            <View style={styles.heroDoseCard}>
              <View style={styles.heroDoseHeader}>
                <View style={styles.heroBadgeRow}>
                  <View
                    style={[
                      styles.heroDoseBadge,
                      nextDoseState?.kind === 'dueNow' && styles.badgeDueNow,
                      nextDoseState?.kind === 'snoozed' && styles.badgeSnoozed,
                    ]}
                  >
                    <Text
                      style={
                        nextDoseState?.kind === 'dueNow'
                          ? styles.badgeDueNowText
                          : nextDoseState?.kind === 'snoozed'
                          ? styles.badgeSnoozedText
                          : styles.heroDoseBadgeText
                      }
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </View>
                <View style={styles.heroTimeChip}>
                  <Text style={styles.heroTimeChipText}>{nextTimeStr}</Text>
                </View>
              </View>

              <Text style={styles.heroMedName}>{nextMed.nameAsWritten}</Text>
              <Text style={styles.heroMedMeta}>
                {nextMed.strength ? `${nextMed.strength} • ` : ''}
                {nextDoseState?.kind === 'dueNow'
                  ? `Scheduled at ${nextTimeStr} • Time for your dose`
                  : nextDoseState?.kind === 'snoozed'
                  ? `Scheduled at ${nextTimeStr} • Snooze active`
                  : diffMinutes <= 15 && diffMinutes > 0
                  ? `Scheduled at ${nextTimeStr} (in ${diffMinutes}m) • Alarm will sound at dose time`
                  : `Scheduled at ${nextTimeStr} (${formatTimeDifference(diffMinutes)}) • Daily Regimen`}
              </Text>

              {nextMed.prescribedInstructions ? (
                <View style={styles.instructionsBox}>
                  <Text style={styles.instructionsText}>💡 {nextMed.prescribedInstructions}</Text>
                </View>
              ) : null}

              {nextDoseState?.kind === 'upcoming' && (
                <View style={styles.upcomingNoticeBox}>
                  <Text style={styles.upcomingNoticeText}>
                    🔔 Reminder notification is scheduled for {nextTimeStr}. You can record early or wait until due.
                  </Text>
                </View>
              )}

              <View style={styles.heroActionsRow}>
                <TouchableOpacity
                  style={[styles.heroActionBtn, styles.heroActionSkip]}
                  onPress={() => handleRecordDoseAction(nextDose.id, 'SKIPPED')}
                  disabled={actionDoseId === nextDose.id}
                  activeOpacity={0.75}
                >
                  <Text style={styles.heroActionSkipText}>Skip</Text>
                </TouchableOpacity>

                {nextDoseState?.kind !== 'upcoming' && (
                  <TouchableOpacity
                    style={[styles.heroActionBtn, styles.heroActionSnooze]}
                    onPress={() => handleRecordDoseAction(nextDose.id, 'SNOOZED', 15)}
                    disabled={actionDoseId === nextDose.id}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.heroActionSnoozeText}>
                      {nextDoseState?.kind === 'snoozed' ? 'Snooze +15m' : 'Snooze 15m'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.heroActionBtn, styles.heroActionTaken]}
                  onPress={() => handleRecordDoseAction(nextDose.id, 'TAKEN')}
                  disabled={actionDoseId === nextDose.id}
                  activeOpacity={0.75}
                >
                  <Text style={styles.heroActionTakenText}>
                    {nextDoseState?.kind === 'upcoming' ? 'Take Early ✓' : 'Taken ✓'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : totalDosesCount > 0 && actionableDoses.length === 0 ? (
            <View style={styles.streakCelebrationCard}>
              <View style={styles.streakRow}>
                <Text style={styles.streakIcon}>🎯</Text>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.streakTitle}>All Doses Completed! ✓</Text>
                  <Text style={styles.streakSub}>
                    {takenDosesCount} of {totalDosesCount} medications recorded for {formattedSelectedDate}.
                    Great consistency maintaining your schedule.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Card variant="muted" style={styles.emptyDayCard}>
              <Text style={styles.emptyDayText}>
                No doses scheduled for {formattedSelectedDate}.
              </Text>
              <TouchableOpacity
                style={styles.addMedQuickBtn}
                onPress={onAddManual}
                activeOpacity={0.8}
              >
                <Text style={styles.addMedQuickBtnText}>+ Add Medication</Text>
              </TouchableOpacity>
            </Card>
          )}
    </>
  );
}
