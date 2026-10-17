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
} from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { colors, spacing, borderRadius, typography } from '../../theme/index';
import {
  MedicationRecord,
  DoseLog,
  medicationService,
  MedicationStatus,
} from '../../services/medications/medication-service';
import { MedicationDetailModal } from '../../features/medications/MedicationDetailModal';
import { ManualAddMedicationModal } from '../../features/medications/ManualAddMedicationModal';
import { formatTime12Hour } from '../../features/medications/reminder-time-utils';
import { authService } from '../../services/auth/auth-service';

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

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [allMeds, doses] = await Promise.all([
        medicationService.listMedications(),
        medicationService.getDoseOccurrences(),
      ]);

      setMedications(allMeds);
      setTodayDoses(doses);
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

  const openMedicationModal = (id: string) => {
    setSelectedMedicationId(id);
    setModalVisible(true);
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
            <Text style={typography.h2}>Medication Centre</Text>
            <Text style={[typography.bodyMuted, styles.subHeader]}>
              Manage active courses, reminder times, and patient-reported doses.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addMedHeaderBtn}
            onPress={() => setAddModalVisible(true)}
          >
            <Text style={styles.addMedHeaderBtnText}>+ Add Medicine</Text>
          </TouchableOpacity>
        </View>

        {/* Local Reminder Reliability Notice */}
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>
            Local reminders scheduled within OS safety caps (iOS 60 / Android 100). Delivery is best-effort.
          </Text>
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
            {/* Section 1: Upcoming Dose Reminders for Today */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Upcoming Doses</Text>
              <Text style={styles.sectionSub}>Tap an action to record your dose intake</Text>
            </View>

            {todayDoses.length === 0 ? (
              <Card variant="muted" style={styles.emptyDoseCard}>
                <Text style={[typography.bodyMuted, { textAlign: 'center', marginBottom: spacing.sm }]}>
                  No doses scheduled for the current window.
                </Text>
                <Button
                  title="+ Add Medication & Reminders"
                  variant="outline"
                  onPress={() => setAddModalVisible(true)}
                />
              </Card>
            ) : (
              todayDoses.slice(0, 6).map((dose) => {
                const med = medications.find((m) => m.id === dose.medicationId);
                const doseDate = new Date(dose.scheduledTime);
                const timeStr = doseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isPending = dose.status === 'PENDING';
                const isBusy = actionDoseId === dose.id;

                return (
                  <Card key={dose.id} style={styles.doseCard}>
                    <View style={styles.doseHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.doseMedName}>{med?.nameAsWritten || 'Medication'}</Text>
                        <Text style={styles.doseMedStrength}>
                          {med?.strength ? `${med.strength} • ` : ''}Scheduled at {timeStr}
                        </Text>
                      </View>
                      <Badge
                        label={dose.status}
                        variant={
                          dose.status === 'TAKEN'
                            ? 'success'
                            : dose.status === 'SKIPPED'
                            ? 'danger'
                            : dose.status === 'SNOOZED'
                            ? 'warning'
                            : 'neutral'
                        }
                      />
                    </View>

                    {isPending ? (
                      <View style={styles.doseActionRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.takeBtn]}
                          onPress={() => handleRecordDoseAction(dose.id, 'TAKEN')}
                          disabled={isBusy}
                        >
                          <Text style={styles.takeBtnText}>Taken</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.skipBtn]}
                          onPress={() => handleRecordDoseAction(dose.id, 'SKIPPED')}
                          disabled={isBusy}
                        >
                          <Text style={styles.skipBtnText}>Skip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.snoozeBtn]}
                          onPress={() => handleRecordDoseAction(dose.id, 'SNOOZED', 15)}
                          disabled={isBusy}
                        >
                          <Text style={styles.snoozeBtnText}>Snooze 15m</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.recordedActionRow}>
                        <Text style={styles.recordedActionText}>
                          Action recorded: {dose.status}
                          {dose.actionTime ? ` at ${new Date(dose.actionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </Text>
                      </View>
                    )}
                  </Card>
                );
              })
            )}

            {/* Section 2: Segmented Tab Bar */}
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
                        <Text style={styles.scheduleSummaryTimes}>
                          {item.reminderTimes.map(formatTime12Hour).join(', ')}
                        </Text>
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
  header: {
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addMedHeaderBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  addMedHeaderBtnText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700',
  },
  subHeader: {
    marginTop: spacing.xs,
  },
  noticeBanner: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  noticeText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
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
  sectionHeaderRow: {
    marginBottom: spacing.xs,
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
  doseCard: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  doseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  doseMedName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  doseMedStrength: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  doseActionRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeBtn: {
    backgroundColor: colors.success,
  },
  takeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  skipBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  skipBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  snoozeBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  snoozeBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  recordedActionRow: {
    marginTop: spacing.xs,
    paddingVertical: 4,
  },
  recordedActionText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginVertical: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
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
    fontSize: 13,
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
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  scheduleSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  scheduleSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  scheduleSummaryTimes: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  activateNoticeRow: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.sm,
  },
  activateNoticeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});
