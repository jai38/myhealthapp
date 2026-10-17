import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme/index';
import {
  MedicationRecord,
  DoseLog,
  medicationService,
  MedicationStatus,
} from '../../services/medications/medication-service';
import { MedicationDetailModal } from '../../features/medications/MedicationDetailModal';
import { ManualAddMedicationModal } from '../../features/medications/ManualAddMedicationModal';
import { useLocalSearchParams } from 'expo-router';
import { formatTime12Hour } from '../../features/medications/reminder-time-utils';
import { authService } from '../../services/auth/auth-service';
import {
  syncAllMedicationReminders,
  scheduleSnoozeReminder,
  onNotificationResponse,
} from '../../services/notifications/notification-service';

type TabType = 'active' | 'inactive' | 'past';

export default function MedicationsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [todayDoses, setTodayDoses] = useState<DoseLog[]>([]);

  // Selected medication modal
  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Manual Add Medication Modal
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);

  // Dose action in-flight state
  const [actionDoseId, setActionDoseId] = useState<string | null>(null);

  // Deep-link from notification tap
  const { openMedicationId } = useLocalSearchParams<{ openMedicationId?: string }>();

  const openMedicationModal = useCallback((id: string) => {
    setSelectedMedicationId(id);
    setModalVisible(true);
  }, []);

  // Open modal if directed by notification route parameter
  useEffect(() => {
    if (openMedicationId) {
      openMedicationModal(openMedicationId);
    }
  }, [openMedicationId, openMedicationModal]);

  // Also listen for real-time notification taps while app is open
  useEffect(() => {
    const unsub = onNotificationResponse((data) => {
      if (data.medicationId) {
        openMedicationModal(data.medicationId);
      }
    });
    return unsub;
  }, [openMedicationModal]);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [allMeds, doses] = await Promise.all([
        medicationService.listMedications(),
        medicationService.getDoseOccurrences(),
      ]);

      setMedications(allMeds);
      setTodayDoses(doses);

      // Synchronize device alarms with all active medications
      syncAllMedicationReminders(
        allMeds.map((m) => ({
          id: m.id,
          name: m.nameAsWritten,
          isActive: m.status === 'ACTIVE',
          reminderTimes: m.reminderTimes || [],
          instructions: m.prescribedInstructions || undefined,
        }))
      ).catch(() => {});
    } catch (err: any) {
      setError(err?.message || 'Failed to load medication records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = authService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleRecordDoseAction = async (
    doseId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes?: number
  ) => {
    setActionDoseId(doseId);
    try {
      await medicationService.recordDoseAction(doseId, {
        action,
        snoozeMinutes,
      });

      // If snoozed, schedule local snooze follow-up alarm/notification
      if (action === 'SNOOZED') {
        const dose = todayDoses.find((d) => d.id === doseId);
        const med = medications.find((m) => m.id === dose?.medicationId);
        if (med) {
          scheduleSnoozeReminder(med.id, med.nameAsWritten, snoozeMinutes || 15).catch(() => {});
        }
      }

      // Refresh dose list locally
      setTodayDoses((prev) =>
        prev.map((d) => (d.id === doseId ? { ...d, status: action, actionTime: new Date().toISOString() } : d))
      );
    } catch (err: any) {
      Alert.alert('Action Failed', err?.message || 'Could not record dose action.');
    } finally {
      setActionDoseId(null);
    }
  };

  const filteredMedications = medications.filter((m) => {
    if (activeTab === 'active') return m.status === 'ACTIVE' || m.status === 'PAUSED';
    if (activeTab === 'inactive') return m.status === 'INACTIVE';
    if (activeTab === 'past') return m.status === 'COMPLETED' || m.status === 'DISCONTINUED';
    return true;
  });

  const activeMedicationsCount = medications.filter((m) => m.status === 'ACTIVE').length;
  const inactiveMedicationsCount = medications.filter((m) => m.status === 'INACTIVE').length;
  const pastMedicationsCount = medications.filter(
    (m) => m.status === 'COMPLETED' || m.status === 'DISCONTINUED'
  ).length;

  const actionableDoses = todayDoses.filter(
    (d) => d.status === 'PENDING' || d.status === 'SNOOZED'
  );
  const nextDose = actionableDoses[0];
  const nextMed = nextDose ? medications.find((m) => m.id === nextDose.medicationId) : null;
  const nextDoseDate = nextDose ? new Date(nextDose.scheduledTime) : null;
  const nextTimeStr = nextDoseDate
    ? nextDoseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const totalDosesToday = todayDoses.length;
  const takenDosesToday = todayDoses.filter((d) => d.status === 'TAKEN').length;
  const adherenceTodayPct = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 100;

  // Weekly adherence mock days (Monday = 0)
  const todayDayOfWeek = (new Date().getDay() + 6) % 7;
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekAdherence = [85, 100, 90, 75, 100, 95, adherenceTodayPct];

  return (
    <ScreenLayout>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header with Quick Action */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Text style={styles.pageTitle}>Medication Routine</Text>
            <Text style={styles.pageSubHeader}>
              Daily reminders, schedule adherence, and verified medicine vault.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addMedHeaderBtn}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addMedHeaderBtnText}>+ Add Medicine</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.bodyMuted, { marginTop: spacing.md }]}>
              Loading medications and schedules...
            </Text>
          </View>
        ) : error ? (
          <Card variant="muted" style={styles.errorCard}>
            <Text style={[typography.h3, { color: colors.danger, marginBottom: spacing.xs }]}>
              Unable to load medications
            </Text>
            <Text style={[typography.bodyMuted, { textAlign: 'center', marginBottom: spacing.md }]}>
              {error}
            </Text>
            <Button title="Retry" onPress={loadData} />
          </Card>
        ) : (
          <>
            {/* 1. HERO CARD: Next Reminder (Matching Landing Page Hero Mockup) */}
            {nextDose && nextMed ? (
              <View style={styles.heroReminderCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeIcon}>⏰</Text>
                    <Text style={styles.heroBadgeText}>NEXT REMINDER</Text>
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
                      ⏰ Snoozed — 15m follow-up alarm active on device
                    </Text>
                  </View>
                )}

                <View style={styles.heroActionRow}>
                  <TouchableOpacity
                    style={[styles.heroBtn, styles.heroBtnSkip]}
                    onPress={() => handleRecordDoseAction(nextDose.id, 'SKIPPED')}
                    disabled={actionDoseId === nextDose.id}
                  >
                    <Text style={styles.heroBtnSkipText}>Skip</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.heroBtn, styles.heroBtnSnooze]}
                    onPress={() => handleRecordDoseAction(nextDose.id, 'SNOOZED', 15)}
                    disabled={actionDoseId === nextDose.id}
                  >
                    <Text style={styles.heroBtnSnoozeText}>
                      {nextDose.status === 'SNOOZED' ? 'Snooze +15m' : 'Snooze 15m'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.heroBtn, styles.heroBtnTaken]}
                    onPress={() => handleRecordDoseAction(nextDose.id, 'TAKEN')}
                    disabled={actionDoseId === nextDose.id}
                  >
                    <Text style={styles.heroBtnTakenText}>Taken ✓</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : totalDosesToday > 0 && actionableDoses.length === 0 ? (
              <View style={styles.allCaughtUpCard}>
                <View style={styles.allCaughtUpHeader}>
                  <Text style={styles.allCaughtUpIcon}>🎉</Text>
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.allCaughtUpTitle}>All Doses Logged Today!</Text>
                    <Text style={styles.allCaughtUpSub}>
                      {takenDosesToday} of {totalDosesToday} doses recorded on time. Great consistency!
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            {/* 2. WEEKLY ADHERENCE BAR CHART (Matching Landing Page Mockup) */}
            <View style={styles.adherenceCard}>
              <View style={styles.adherenceHeaderRow}>
                <View>
                  <Text style={styles.adherenceTitle}>Weekly Adherence</Text>
                  <Text style={styles.adherenceSubtitle}>Daily intake completion rate</Text>
                </View>
                <View style={styles.adherenceRateBadge}>
                  <Text style={styles.adherenceRateText}>{adherenceTodayPct}% Today</Text>
                </View>
              </View>

              <View style={styles.adherenceBarsRow}>
                {weekAdherence.map((pct, idx) => {
                  const isToday = idx === todayDayOfWeek;
                  return (
                    <View key={idx} style={styles.adherenceCol}>
                      <View style={styles.adherenceTrack}>
                        <View
                          style={[
                            styles.adherenceFill,
                            {
                              height: `${Math.max(15, pct * 0.45)}%`,
                              backgroundColor: isToday ? colors.amberGold : colors.teal,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.adherenceDayLabel,
                          isToday && styles.adherenceDayLabelToday,
                        ]}
                      >
                        {daysOfWeek[idx]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 3. TODAY'S SCHEDULE */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Today's Schedule ⏱️</Text>
              <Text style={styles.sectionSub}>
                {actionableDoses.length === 0
                  ? 'All doses taken for today ✓'
                  : `${actionableDoses.length} reminder(s) pending today`}
              </Text>
            </View>

            {todayDoses.length === 0 ? (
              <Card variant="muted" style={styles.emptyDoseCard}>
                <Text style={[typography.bodyMuted, { textAlign: 'center', marginBottom: spacing.sm }]}>
                  No doses scheduled for today. Add a medicine or supplement to activate reminders.
                </Text>
                <Button
                  title="+ Add Routine / Medicine"
                  variant="outline"
                  onPress={() => setAddModalVisible(true)}
                />
              </Card>
            ) : (
              todayDoses.map((dose) => {
                const med = medications.find((m) => m.id === dose.medicationId);
                const doseDate = new Date(dose.scheduledTime);
                const timeStr = doseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isTaken = dose.status === 'TAKEN';
                const isSkipped = dose.status === 'SKIPPED';
                const isSnoozed = dose.status === 'SNOOZED';
                const isPending = dose.status === 'PENDING';
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
                          >
                            <Text style={styles.quickTakeBtnText}>Taken ✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.quickSkipBtn}
                            onPress={() => handleRecordDoseAction(dose.id, 'SKIPPED')}
                            disabled={isBusy}
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

            {/* 4. MY MEDICATIONS & SUPPLEMENTS */}
            <View style={styles.vaultHeaderRow}>
              <Text style={styles.vaultSectionTitle}>My Medications & Supplements 💊</Text>
              <Text style={styles.vaultSectionSub}>
                Verified prescriptions, dosages, and reminder schedules
              </Text>
            </View>

            {/* Segmented Tab Bar */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
                onPress={() => setActiveTab('active')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'active' ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  Active ({activeMedicationsCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'inactive' && styles.tabButtonActive]}
                onPress={() => setActiveTab('inactive')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'inactive' ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  Prescribed ({inactiveMedicationsCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'past' && styles.tabButtonActive]}
                onPress={() => setActiveTab('past')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'past' ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  Past ({pastMedicationsCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Medication List under active tab */}
            {filteredMedications.length === 0 ? (
              <Card variant="muted" style={styles.emptyCard}>
                <Badge
                  label={
                    activeTab === 'active'
                      ? 'No Active Medications'
                      : activeTab === 'inactive'
                      ? 'No Prescribed Medications'
                      : 'No Past Regimens'
                  }
                  variant="neutral"
                  style={styles.badge}
                />
                <Text style={[typography.h3, styles.emptyTitle]}>
                  {activeTab === 'active'
                    ? 'No Active Regimens'
                    : activeTab === 'inactive'
                    ? 'No Pending Prescriptions'
                    : 'No Historical Regimens'}
                </Text>
                <Text style={[typography.bodyMuted, styles.emptyDescription, { marginBottom: spacing.md }]}>
                  {activeTab === 'active'
                    ? 'You have no active medications running reminders. Add a medication manually or upload a prescription to get started.'
                    : activeTab === 'inactive'
                    ? 'Prescriptions you upload and confirm will appear here as inactive medications ready for reminder configuration.'
                    : 'Completed and discontinued medication regimens will be preserved here in your historical health record.'}
                </Text>
                <Button
                  title="+ Add Medication Manually"
                  variant="primary"
                  onPress={() => setAddModalVisible(true)}
                />
              </Card>
            ) : (
              filteredMedications.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => openMedicationModal(item.id)}
                >
                  <Card style={styles.medCard}>
                    <View style={styles.medCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.medName}>{item.nameAsWritten}</Text>
                        {item.normalizedMedicineName && (
                          <Text style={styles.medNormalized}>
                            Generic: {item.normalizedMedicineName}
                          </Text>
                        )}
                      </View>
                      <Badge
                        label={item.status}
                        variant={
                          item.status === 'ACTIVE'
                            ? 'success'
                            : item.status === 'INACTIVE'
                            ? 'warning'
                            : item.status === 'PAUSED'
                            ? 'warning'
                            : 'neutral'
                        }
                      />
                    </View>

                    {item.strength && (
                      <Text style={styles.medStrength}>
                        Strength: {item.strength} • {item.dosageForm}
                      </Text>
                    )}

                    {item.prescribedInstructions && (
                      <Text style={styles.medInstructions} numberOfLines={2}>
                        {item.prescribedInstructions}
                      </Text>
                    )}

                    {item.reminderTimes && item.reminderTimes.length > 0 ? (
                      <View style={styles.scheduleSummaryRow}>
                        <Text style={styles.scheduleSummaryLabel}>Reminders:</Text>
                        <View style={styles.scheduleChipsWrap}>
                          {item.reminderTimes.map((t, idx) => (
                            <View key={idx} style={styles.reminderChip}>
                              <Text style={styles.reminderChipText}>
                                🔔 {formatTime12Hour(t)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : item.status === 'INACTIVE' ? (
                      <View style={styles.activateNoticeRow}>
                        <Text style={styles.activateNoticeText}>
                          Tap to select reminder times & activate
                        </Text>
                      </View>
                    ) : null}
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Medication Details Modal */}
      <MedicationDetailModal
        visible={modalVisible}
        medicationId={selectedMedicationId}
        onClose={() => setModalVisible(false)}
        onStatusChanged={loadData}
      />

      {/* Manual Add Medication Modal */}
      <ManualAddMedicationModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onMedicationCreated={loadData}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  pageSubHeader: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  addMedHeaderBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addMedHeaderBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '800',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },

  /* 1. HERO REMINDER CARD (Porcelain Canvas with Squircle Geometry) */
  heroReminderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 6px 20px rgba(17, 20, 24, 0.04)',
        } as any)
      : shadows.sm),
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentCoralLight,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  heroBadgeIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentCoral,
    letterSpacing: 0.8,
  },
  heroTimeChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  heroTimeChipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  heroMedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  heroMedSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    marginBottom: spacing.md,
  },
  heroSnoozeBanner: {
    backgroundColor: colors.accentCustardLight,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentCustard,
  },
  heroSnoozeText: {
    color: colors.accentCustard,
    fontSize: 12,
    fontWeight: '600',
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnSkip: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  heroBtnSkipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  heroBtnSnooze: {
    backgroundColor: colors.accentCustardLight,
    borderWidth: 1,
    borderColor: 'rgba(202, 138, 4, 0.25)',
  },
  heroBtnSnoozeText: {
    color: colors.accentCustard,
    fontSize: 13,
    fontWeight: '700',
  },
  heroBtnTaken: {
    backgroundColor: colors.accentCoral,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 14px rgba(255, 91, 34, 0.35)',
        } as any)
      : {}),
  },
  heroBtnTakenText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* All Caught Up Card */
  allCaughtUpCard: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: borderRadius.xxl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.08)',
        } as any)
      : {}),
  },
  allCaughtUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allCaughtUpIcon: {
    fontSize: 26,
  },
  allCaughtUpTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accentMint,
  },
  allCaughtUpSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  /* 2. WEEKLY ADHERENCE CARD (Ronald Olsen Capsule Bars) */
  adherenceCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.xxl,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 12px 32px rgba(14, 17, 22, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        } as any)
      : shadows.sm),
  },
  adherenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  adherenceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  adherenceSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  adherenceRateBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  adherenceRateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  adherenceBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 70,
    paddingTop: spacing.xs,
  },
  adherenceCol: {
    flex: 1,
    alignItems: 'center',
  },
  adherenceTrack: {
    width: 14,
    height: 48,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.full,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  adherenceFill: {
    width: '100%',
    borderRadius: borderRadius.full,
  },
  adherenceDayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 6,
  },
  adherenceDayLabelToday: {
    color: colors.primary,
    fontWeight: '800',
  },

  /* 3. TODAY'S SCHEDULE LIST */
  sectionHeaderRow: {
    marginBottom: spacing.xs + 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  emptyDoseCard: {
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  scheduleItemCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.xxl,
    padding: spacing.sm + 4,
    marginBottom: spacing.xs + 4,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 6px 18px rgba(14, 17, 22, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        } as any)
      : shadows.sm),
  },
  scheduleLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleIconBox: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleIconBoxActive: {
    backgroundColor: colors.accentCyanLight,
  },
  scheduleIconBoxTaken: {
    backgroundColor: colors.surfaceSecondary,
  },
  scheduleIconBoxSnoozed: {
    backgroundColor: colors.accentCustardLight,
  },
  scheduleIconEmoji: {
    fontSize: 18,
  },
  scheduleMedName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scheduleMedNameTaken: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  scheduleMedMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scheduleRightCol: {
    marginLeft: spacing.sm,
  },
  takenCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentMintLight,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  takenCheckIcon: {
    color: colors.accentMint,
    fontWeight: '900',
    fontSize: 12,
    marginRight: 4,
  },
  takenCheckText: {
    color: colors.accentMint,
    fontWeight: '800',
    fontSize: 11,
  },
  skippedBadge: {
    backgroundColor: colors.dangerLight,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  skippedText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 11,
  },
  quickActionGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  quickTakeBtn: {
    backgroundColor: colors.accentCoral,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 12px rgba(255, 91, 34, 0.35)',
        } as any)
      : {}),
  },
  quickTakeBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  quickSkipBtn: {
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  quickSkipBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },

  /* 4. MEDICATION VAULT TABS & CARDS */
  vaultHeaderRow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  vaultSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  vaultSectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    padding: 3,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm - 2,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(17, 20, 24, 0.15)',
        } as any)
      : shadows.sm),
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  tabTextInactive: {
    color: colors.textSecondary,
  },
  emptyCard: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  badge: {
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 20,
  },
  medCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 14px rgba(17, 20, 24, 0.03)',
        } as any)
      : shadows.sm),
  },
  medCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  medNormalized: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  medStrength: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  medInstructions: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  scheduleSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  scheduleSummaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  scheduleChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reminderChip: {
    backgroundColor: colors.accentCyanLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  reminderChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentCyan,
  },
  activateNoticeRow: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
  },
  activateNoticeText: {
    fontSize: 12,
    color: colors.accentCyan,
    fontWeight: '600',
  },
});
