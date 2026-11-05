import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme/index';
import { toLocalDateString } from '../../services/medications/medication-store';
import { medicationStore } from '../../services/medications/medication-store';
import { MedicationDetailModal } from './MedicationDetailModal';
import { ManualAddMedicationModal } from './ManualAddMedicationModal';
import { useLocalSearchParams } from 'expo-router';
import { onNotificationResponse } from '../../services/notifications/notification-service';
import { useMedicationsData } from './useMedicationsData';
import { styles } from './styles-screen';
import { NextDoseCard } from './NextDoseCard';
import { WeeklyAdherenceCard } from './WeeklyAdherenceCard';
import { DaySchedule } from './DaySchedule';
import { MedicationList, type TabType } from './MedicationList';

export default function MedicationsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('active');

  // Selected calendar day for schedule inspection (default today)
  const todayDateStr = toLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);

  // Selected medication detail modal
  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Manual Add Medication Modal
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);

  // Deep-link from notification tap
  const { openMedicationId } = useLocalSearchParams<{ openMedicationId?: string }>();

  const openMedicationModal = useCallback((id: string) => {
    setSelectedMedicationId(id);
    setModalVisible(true);
  }, []);

  useEffect(() => {
    if (openMedicationId) {
      openMedicationModal(openMedicationId);
    }
  }, [openMedicationId, openMedicationModal]);

  useEffect(() => {
    const unsub = onNotificationResponse((data) => {
      if (data.medicationId) {
        openMedicationModal(data.medicationId);
      }
    });
    return unsub;
  }, [openMedicationModal]);

  const {
    loading,
    refreshing,
    error,
    actionNotice,
    actionDoseId,
    medications,
    loadData,
    onRefresh,
    handleRecordDoseAction,
  } = useMedicationsData();

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

  // Selected date dose list & adherence
  const dayDoses = medicationStore.getDosesForDate(selectedDate);
  const { percentage: adherencePct, taken: takenDosesCount, total: totalDosesCount } =
    medicationStore.getAdherenceForDate(selectedDate);

  const actionableDoses = dayDoses.filter(
    (d) => d.status === 'PENDING' || d.status === 'SNOOZED'
  );
  const nextDose = actionableDoses[0];
  const nextMed = nextDose
    ? medications.find((m) => m.id === nextDose.medicationId) ||
      medicationStore.getMedicationById(nextDose.medicationId)
    : null;
  const nextDoseDate = nextDose ? new Date(nextDose.scheduledTime) : null;
  const nextTimeStr = nextDoseDate
    ? nextDoseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // Weekly Adherence calculation for Monday - Sunday
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateString = toLocalDateString(d);
    const { percentage } = medicationStore.getAdherenceForDate(dateString);
    const isToday = dateString === todayDateStr;
    const isSelected = dateString === selectedDate;
    return {
      dayLabel: daysOfWeek[i],
      dateNumber: d.getDate(),
      dateString,
      percentage,
      isToday,
      isSelected,
    };
  });

  const isSelectedToday = selectedDate === todayDateStr;
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const formattedSelectedDate = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

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

        {/* Action feedback toast */}
        {actionNotice && (
          <View style={styles.actionNoticeBanner}>
            <Text style={styles.actionNoticeText}>{actionNotice}</Text>
          </View>
        )}

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
            <NextDoseCard
              nextDose={nextDose}
              nextMed={nextMed}
              nextTimeStr={nextTimeStr}
              isSelectedToday={isSelectedToday}
              formattedSelectedDate={formattedSelectedDate}
              totalDosesCount={totalDosesCount}
              takenDosesCount={takenDosesCount}
              actionableDoses={actionableDoses}
              actionDoseId={actionDoseId}
              handleRecordDoseAction={handleRecordDoseAction}
            />
            <WeeklyAdherenceCard
              weekDays={weekDays}
              setSelectedDate={setSelectedDate}
              totalDosesCount={totalDosesCount}
              adherencePct={adherencePct}
            />
            <DaySchedule
              isSelectedToday={isSelectedToday}
              formattedSelectedDate={formattedSelectedDate}
              todayDateStr={todayDateStr}
              setSelectedDate={setSelectedDate}
              actionableDoses={actionableDoses}
              dayDoses={dayDoses}
              medications={medications}
              actionDoseId={actionDoseId}
              handleRecordDoseAction={handleRecordDoseAction}
              onAddMedicine={() => setAddModalVisible(true)}
            />
            <MedicationList
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeMedicationsCount={activeMedicationsCount}
              inactiveMedicationsCount={inactiveMedicationsCount}
              pastMedicationsCount={pastMedicationsCount}
              filteredMedications={filteredMedications}
              onAddMedicine={() => setAddModalVisible(true)}
              openMedicationModal={openMedicationModal}
            />
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
