import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme/index';
import { DoseLog, MedicationRecord } from '../../services/medications/medication-service';
import { styles } from './styles-schedule';

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
}) {
  return (
    <>
            {/* 3. TODAY'S SCHEDULE LIST (Filtered by selected day) */}
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.sectionTitle}>
                  {isSelectedToday ? "Today's Schedule ⏱️" : `Schedule for ${formattedSelectedDate} ⏱️`}
                </Text>
                {!isSelectedToday && (
                  <TouchableOpacity
                    style={styles.resetTodayBtn}
                    onPress={() => setSelectedDate(todayDateStr)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resetTodayBtnText}>Reset to Today</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.sectionSub}>
                {actionableDoses.length === 0
                  ? 'All doses recorded for this day ✓'
                  : `${actionableDoses.length} reminder(s) pending`}
              </Text>
            </View>

            {dayDoses.length === 0 ? (
              <Card variant="muted" style={styles.emptyDoseCard}>
                <Text style={[typography.bodyMuted, { textAlign: 'center', marginBottom: spacing.sm }]}>
                  No doses scheduled for {formattedSelectedDate}. Add a medicine to activate reminders.
                </Text>
                <Button
                  title="+ Add Routine / Medicine"
                  variant="outline"
                  onPress={onAddMedicine}
                />
              </Card>
            ) : (
              dayDoses.map((dose) => {
                const med = medications.find((m) => m.id === dose.medicationId);
                const doseDate = new Date(dose.scheduledTime);
                const timeStr = doseDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const isTaken = dose.status === 'TAKEN';
                const isSkipped = dose.status === 'SKIPPED';
                const isSnoozed = dose.status === 'SNOOZED';
                const isBusy = actionDoseId === dose.id;

                return (
                  <View key={dose.id} style={styles.scheduleItemCard}>
                    <View style={styles.scheduleLeftCol}>
                      <View
                        style={[
                          styles.scheduleIconBox,
                          isTaken
                            ? styles.scheduleIconBoxTaken
                            : isSnoozed
                            ? styles.scheduleIconBoxSnoozed
                            : styles.scheduleIconBoxActive,
                        ]}
                      >
                        <Text style={styles.scheduleIconEmoji}>
                          {med?.dosageForm?.toLowerCase().includes('syrup')
                            ? '🥄'
                            : med?.dosageForm?.toLowerCase().includes('drop')
                            ? '💧'
                            : '💊'}
                        </Text>
                      </View>

                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text
                          style={[
                            styles.scheduleMedName,
                            isTaken && styles.scheduleMedNameTaken,
                          ]}
                        >
                          {med?.nameAsWritten || 'Medication'}
                        </Text>
                        <Text style={styles.scheduleMedMeta}>
                          {med?.strength ? `${med.strength} • ` : ''}
                          <Text style={{ fontWeight: '700' }}>{timeStr}</Text>
                        </Text>
                      </View>
                    </View>

                    {/* Status Pill or Direct Quick Action */}
                    <View style={styles.scheduleRightCol}>
                      {isTaken ? (
                        <View style={styles.takenCheckBadge}>
                          <Text style={styles.takenCheckIcon}>✓</Text>
                          <Text style={styles.takenCheckText}>Taken</Text>
                        </View>
                      ) : isSkipped ? (
                        <View style={styles.skippedBadge}>
                          <Text style={styles.skippedText}>Skipped</Text>
                        </View>
                      ) : (
                        <View style={styles.quickActionGroup}>
                          <TouchableOpacity
                            style={styles.quickTakeBtn}
                            onPress={() => handleRecordDoseAction(dose.id, 'TAKEN')}
                            disabled={isBusy}
                            activeOpacity={0.75}
                          >
                            <Text style={styles.quickTakeBtnText}>Taken ✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.quickSkipBtn}
                            onPress={() => handleRecordDoseAction(dose.id, 'SKIPPED')}
                            disabled={isBusy}
                            activeOpacity={0.75}
                          >
                            <Text style={styles.quickSkipBtnText}>Skip</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
    </>
  );
}
