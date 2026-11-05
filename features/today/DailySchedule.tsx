import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { medicationStore } from '../../services/medications/medication-store';
import { MedicationRecord, DoseLog } from '../../services/medications/medication-service';
import { styles } from './styles-schedule';

export function DailySchedule({
  dayDoses,
  medications,
  isSelectedDateToday,
  formattedSelectedDate,
  takenDosesCount,
  totalDosesCount,
  actionDoseId,
  handleRecordDoseAction,
}: {
  dayDoses: DoseLog[];
  medications: MedicationRecord[];
  isSelectedDateToday: boolean;
  formattedSelectedDate: string;
  takenDosesCount: number;
  totalDosesCount: number;
  actionDoseId: string | null;
  handleRecordDoseAction: (
    doseId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes?: number
  ) => Promise<void>;
}) {
  const router = useRouter();
  return (
    <>
          {/* 5b. COMPLETE DAILY MEDICATION REGIMEN LIST */}
          {dayDoses.length > 0 && (
            <View style={styles.dailyScheduleContainer}>
              <View style={styles.dailyScheduleHeader}>
                <View>
                  <Text style={styles.dailyScheduleTitle}>
                    {isSelectedDateToday ? "Today's Schedule" : `${formattedSelectedDate} Schedule`}
                  </Text>
                  <Text style={styles.dailyScheduleSub}>
                    {takenDosesCount} of {totalDosesCount} doses recorded
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.manageScheduleLink}
                  onPress={() => router.push('/(tabs)/medications')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.manageScheduleLinkText}>View All ›</Text>
                </TouchableOpacity>
              </View>

              {dayDoses.map((dose) => {
                const med =
                  medications.find((m) => m.id === dose.medicationId) ||
                  medicationStore.getMedicationById(dose.medicationId);
                if (!med) return null;

                const doseDate = new Date(dose.scheduledTime);
                const timeStr = doseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <View key={dose.id} style={styles.doseScheduleCard}>
                    <View style={styles.doseScheduleTimeBox}>
                      <Text style={styles.doseScheduleTimeText}>{timeStr}</Text>
                      <View
                        style={[
                          styles.doseScheduleDot,
                          dose.status === 'TAKEN' && styles.doseScheduleDotTaken,
                          dose.status === 'SNOOZED' && styles.doseScheduleDotSnoozed,
                          dose.status === 'SKIPPED' && styles.doseScheduleDotSkipped,
                        ]}
                      />
                    </View>

                    <View style={styles.doseScheduleInfo}>
                      <Text style={styles.doseScheduleMedName}>{med.nameAsWritten}</Text>
                      <Text style={styles.doseScheduleInstructions} numberOfLines={1}>
                        {med.strength ? `${med.strength} • ` : ''}
                        {med.prescribedInstructions || 'Follow prescribed routine'}
                      </Text>
                    </View>

                    <View style={styles.doseScheduleActionBox}>
                      {dose.status === 'TAKEN' ? (
                        <View style={styles.scheduleBadgeTaken}>
                          <Text style={styles.scheduleBadgeTakenText}>✓ Taken</Text>
                        </View>
                      ) : dose.status === 'SNOOZED' ? (
                        <View style={styles.scheduleBadgeSnoozed}>
                          <Text style={styles.scheduleBadgeSnoozedText}>⏰ Snoozed</Text>
                        </View>
                      ) : dose.status === 'SKIPPED' ? (
                        <View style={styles.scheduleBadgeSkipped}>
                          <Text style={styles.scheduleBadgeSkippedText}>Skipped</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.scheduleTakeBtn}
                          onPress={() => handleRecordDoseAction(dose.id, 'TAKEN')}
                          disabled={actionDoseId === dose.id}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.scheduleTakeBtnText}>
                            {new Date(dose.scheduledTime).getTime() > Date.now()
                              ? 'Take Early'
                              : 'Take ✓'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
    </>
  );
}
