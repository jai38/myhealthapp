import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../theme/index';
import { DoseLog, MedicationRecord } from '../../services/medications/medication-service';
import { styles } from './styles-screen';

export function NextDoseCard({
  nextDose,
  nextMed,
  nextTimeStr,
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
  return (
    <>
            {/* 1. HERO CARD: Next Reminder (Interactive Taken, Snooze, Skip) */}
            {nextDose && nextMed ? (
              <View style={styles.heroReminderCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeIcon}>⏰</Text>
                    <Text style={styles.heroBadgeText}>
                      {isSelectedToday ? 'NEXT REMINDER' : 'SCHEDULED DOSE'}
                    </Text>
                  </View>
                  <View style={styles.heroTimeChip}>
                    <Text style={styles.heroTimeChipText}>{nextTimeStr}</Text>
                  </View>
                </View>

                <Text style={styles.heroMedTitle}>{nextMed.nameAsWritten}</Text>
                <Text style={styles.heroMedSubtitle}>
                  {nextMed.strength ? `${nextMed.strength} • ` : ''}Scheduled at {nextTimeStr} • Daily
                </Text>

                {nextDose.status === 'SNOOZED' && (
                  <View style={styles.heroSnoozeBanner}>
                    <Text style={styles.heroSnoozeText}>
                      ⏰ Snoozed — 15m follow-up active
                    </Text>
                  </View>
                )}

                <View style={styles.heroActionRow}>
                  <TouchableOpacity
                    style={[styles.heroBtn, styles.heroBtnSkip]}
                    onPress={() => handleRecordDoseAction(nextDose.id, 'SKIPPED')}
                    disabled={actionDoseId === nextDose.id}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.heroBtnSkipText}>Skip</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.heroBtn, styles.heroBtnSnooze]}
                    onPress={() => handleRecordDoseAction(nextDose.id, 'SNOOZED', 15)}
                    disabled={actionDoseId === nextDose.id}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.heroBtnSnoozeText}>
                      {nextDose.status === 'SNOOZED' ? 'Snooze +15m' : 'Snooze 15m'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.heroBtn, styles.heroBtnTaken]}
                    onPress={() => handleRecordDoseAction(nextDose.id, 'TAKEN')}
                    disabled={actionDoseId === nextDose.id}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.heroBtnTakenText}>Taken ✓</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : totalDosesCount > 0 && actionableDoses.length === 0 ? (
              <View style={styles.allCaughtUpCard}>
                <View style={styles.allCaughtUpHeader}>
                  <Text style={styles.allCaughtUpIcon}>🎉</Text>
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.allCaughtUpTitle}>All Doses Logged!</Text>
                    <Text style={styles.allCaughtUpSub}>
                      {takenDosesCount} of {totalDosesCount} doses recorded for {formattedSelectedDate}.
                      Great consistency!
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
    </>
  );
}
