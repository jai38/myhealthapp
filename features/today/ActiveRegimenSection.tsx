import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HorizontalDateStrip } from '../../components/HorizontalDateStrip';
import { AdherenceDonut } from '../../components/AdherenceDonut';
import { MedicationRecord, DoseLog } from '../../services/medications/medication-service';
import { styles } from './styles-header';
import { DoseTemporalState } from './utils';
import { DoseHeroSection } from './DoseHeroSection';
import { DailySchedule } from './DailySchedule';
import { AsNeededSection } from './AsNeededSection';

export function ActiveRegimenSection({
  isProcessing,
  onScanPrescription,
  onAddManual,
  selectedDate,
  setSelectedDate,
  todayDateStr,
  isSelectedDateToday,
  formattedSelectedDate,
  adherencePct,
  takenDosesCount,
  totalDosesCount,
  nextDose,
  nextMed,
  doseTemporalState,
  diffMinutes,
  nextTimeStr,
  actionableDoses,
  actionDoseId,
  handleRecordDoseAction,
  dayDoses,
  medications,
  asNeededMeds,
  handleRecordAsNeededDose,
}: {
  isProcessing: boolean;
  onScanPrescription: () => void;
  onAddManual: () => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  todayDateStr: string;
  isSelectedDateToday: boolean;
  formattedSelectedDate: string;
  adherencePct: number;
  takenDosesCount: number;
  totalDosesCount: number;
  nextDose: DoseLog | null;
  nextMed: MedicationRecord | null | undefined;
  doseTemporalState: DoseTemporalState;
  diffMinutes: number;
  nextTimeStr: string;
  actionableDoses: DoseLog[];
  actionDoseId: string | null;
  handleRecordDoseAction: (
    doseId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes?: number
  ) => Promise<void>;
  dayDoses: DoseLog[];
  medications: MedicationRecord[];
  asNeededMeds: MedicationRecord[];
  handleRecordAsNeededDose: (med: MedicationRecord) => Promise<void>;
}) {
  return (
    <>
          <View style={styles.compactActionBar}>
            <TouchableOpacity
              style={styles.compactUploadBtn}
              onPress={onScanPrescription}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <Text style={styles.compactUploadBtnText}>📸 Upload Prescription</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.compactAddBtn}
              onPress={onAddManual}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <Text style={styles.compactAddBtnText}>+ Add Med</Text>
            </TouchableOpacity>
          </View>

          {/* 2. INTERACTIVE WEEKDAY CALENDAR STRIP */}
          <View style={styles.calendarContainer}>
            <HorizontalDateStrip
              selectedDate={selectedDate}
              onSelectDate={(newDate) => {
                setSelectedDate(newDate);
              }}
            />

            {/* Selected Date Context & Reset to Today Button */}
            <View style={styles.dateContextRow}>
              <Text style={styles.dateContextText}>
                {isSelectedDateToday
                  ? "Showing Today's Prescribed Schedule"
                  : `Showing Schedule for ${formattedSelectedDate}`}
              </Text>
              {!isSelectedDateToday && (
                <TouchableOpacity
                  style={styles.jumpTodayBtn}
                  onPress={() => setSelectedDate(todayDateStr)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.jumpTodayBtnText}>Jump to Today ›</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 4. HERO ADHERENCE DONUT (Calm medical teal/blue) */}
          <AdherenceDonut
            percentage={adherencePct}
            takenCount={takenDosesCount}
            totalCount={totalDosesCount}
            label={isSelectedDateToday ? 'Medication Adherence' : `${formattedSelectedDate} Adherence`}
          />
      <DoseHeroSection
        nextDose={nextDose}
        nextMed={nextMed}
        doseTemporalState={doseTemporalState}
        diffMinutes={diffMinutes}
        nextTimeStr={nextTimeStr}
        isSelectedDateToday={isSelectedDateToday}
        formattedSelectedDate={formattedSelectedDate}
        actionableDoses={actionableDoses}
        totalDosesCount={totalDosesCount}
        takenDosesCount={takenDosesCount}
        actionDoseId={actionDoseId}
        handleRecordDoseAction={handleRecordDoseAction}
        onAddManual={onAddManual}
      />
      <DailySchedule
        dayDoses={dayDoses}
        medications={medications}
        isSelectedDateToday={isSelectedDateToday}
        formattedSelectedDate={formattedSelectedDate}
        takenDosesCount={takenDosesCount}
        totalDosesCount={totalDosesCount}
        actionDoseId={actionDoseId}
        handleRecordDoseAction={handleRecordDoseAction}
      />
      <AsNeededSection
        asNeededMeds={asNeededMeds}
        dayDoses={dayDoses}
        handleRecordAsNeededDose={handleRecordAsNeededDose}
      />
    </>
  );
}
