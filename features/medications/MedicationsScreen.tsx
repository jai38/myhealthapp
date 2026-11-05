import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { ErrorState } from '../../design/components/Feedback/ErrorState';
import { Screen } from '../../design/components/Foundations/Screen';
import { Text } from '../../design/components/Foundations/Text';
import { t } from '../../design/strings';
import type { StringKey } from '../../design/strings';
import { color, radius, space } from '../../design/tokens';
import { toLocalDateString } from '../../services/medications/medication-store';
import { medicationStore } from '../../services/medications/medication-store';
import { MedicationDetailModal } from './MedicationDetailModal';
import { ManualAddMedicationModal } from './ManualAddMedicationModal';
import { useLocalSearchParams } from 'expo-router';
import { onNotificationResponse } from '../../services/notifications/notification-service';
import { useMedicationsData } from './useMedicationsData';
import { NextDoseCard } from './NextDoseCard';
import { pickNextDose } from '../today/todayModel';
import { WeeklyAdherenceCard } from './WeeklyAdherenceCard';
import { DaySchedule } from './DaySchedule';
import { MedicationList, type TabType } from './MedicationList';

const DAY_KEYS: StringKey[] = [
  'medicines.day.mon',
  'medicines.day.tue',
  'medicines.day.wed',
  'medicines.day.thu',
  'medicines.day.fri',
  'medicines.day.sat',
  'medicines.day.sun',
];

// The Medicines tab header and safe area come from the tab shell, so this screen has no title of its own.
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
  const nowMs = Date.now();
  const {
    percentage: adherencePct,
    taken: takenDosesCount,
    total: totalDosesCount,
    notConfirmed: notConfirmedCount,
  } = medicationStore.getAdherenceForDate(selectedDate, nowMs);

  const actionableDoses = dayDoses.filter(
    (d) => d.status === 'PENDING' || d.status === 'SNOOZED'
  );
  // The one next-dose rule, shared with Today. Unrecorded past doses are never "next".
  const nextDose =
    pickNextDose(actionableDoses, nowMs, (id) => medicationStore.getMedicationById(id)) ??
    undefined;
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

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateString = toLocalDateString(d);
    const { percentage } = medicationStore.getAdherenceForDate(dateString, nowMs);
    const isToday = dateString === todayDateStr;
    const isSelected = dateString === selectedDate;
    return {
      dayLabel: t(DAY_KEYS[i]),
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
    <>
      <Screen scroll={false} testID="medicines-screen">
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={color.action.primary}
              colors={[color.action.primary]}
            />
          }
        >
          <View style={styles.addRow}>
            <Button
              label={t('medicines.addMedicine')}
              variant="secondary"
              icon="add"
              onPress={() => setAddModalVisible(true)}
              testID="medicines-add"
            />
          </View>

          {/* Action feedback notice */}
          {actionNotice ? (
            <View style={styles.notice}>
              <Text variant="callout" tone="primary">
                {actionNotice}
              </Text>
            </View>
          ) : null}

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={color.action.primary} />
              <Text variant="callout" tone="secondary" align="center">
                {t('medicines.loading')}
              </Text>
            </View>
          ) : error ? (
            <ErrorState
              title={t('medicines.errorTitle')}
              body={error}
              onRetry={loadData}
              testID="medicines-error"
            />
          ) : (
            <>
              <NextDoseCard
                nextDose={nextDose}
                nextMed={nextMed}
                nextTimeStr={nextTimeStr}
                nowMs={nowMs}
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
                adherencePct={adherencePct}
                notConfirmedCount={notConfirmedCount}
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
                nowMs={nowMs}
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
      </Screen>

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
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space.xl,
    paddingBottom: space.xxl,
  },
  addRow: {
    alignItems: 'flex-start',
  },
  notice: {
    backgroundColor: color.tone.success.bg,
    borderRadius: radius.md,
    padding: space.md,
  },
  loadingBox: {
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.xxl,
  },
});
