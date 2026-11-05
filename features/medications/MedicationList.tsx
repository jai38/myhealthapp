import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme/index';
import { MedicationRecord } from '../../services/medications/medication-service';
import { formatTime12Hour } from './reminder-time-utils';
import { styles } from './styles-list';

export type TabType = 'active' | 'inactive' | 'past';

export function MedicationList({
  activeTab,
  setActiveTab,
  activeMedicationsCount,
  inactiveMedicationsCount,
  pastMedicationsCount,
  filteredMedications,
  onAddMedicine,
  openMedicationModal,
}: {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeMedicationsCount: number;
  inactiveMedicationsCount: number;
  pastMedicationsCount: number;
  filteredMedications: MedicationRecord[];
  onAddMedicine: () => void;
  openMedicationModal: (id: string) => void;
}) {
  return (
    <>
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
                <Text
                  style={[
                    typography.bodyMuted,
                    styles.emptyDescription,
                    { marginBottom: spacing.md },
                  ]}
                >
                  {activeTab === 'active'
                    ? 'You have no active medications running reminders. Add a medication manually or upload a prescription to get started.'
                    : activeTab === 'inactive'
                    ? 'Prescriptions you upload and confirm will appear here as inactive medications ready for reminder configuration.'
                    : 'Completed and discontinued medication regimens will be preserved here in your historical health record.'}
                </Text>
                <Button
                  title="+ Add Medication Manually"
                  variant="primary"
                  onPress={onAddMedicine}
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
  );
}
