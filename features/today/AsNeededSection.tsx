import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MedicationRecord, DoseLog } from '../../services/medications/medication-service';
import { styles } from './styles-schedule';

export function AsNeededSection({
  asNeededMeds,
  dayDoses,
  handleRecordAsNeededDose,
}: {
  asNeededMeds: MedicationRecord[];
  dayDoses: DoseLog[];
  handleRecordAsNeededDose: (med: MedicationRecord) => Promise<void>;
}) {
  return (
    <>
          {/* 5c. AS-NEEDED MEDICINES (SOS / ON-DEMAND) */}
          {asNeededMeds.length > 0 && (
            <View style={styles.asNeededSectionContainer}>
              <View style={styles.asNeededHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.asNeededSectionTitle}>As-Needed Medicines (SOS)</Text>
                  <Text style={styles.asNeededSectionSub}>
                    Taken on-demand when symptoms arise. No fixed daily alarm.
                  </Text>
                </View>
                <View style={styles.asNeededHeaderBadge}>
                  <Text style={styles.asNeededHeaderBadgeText}>PRN / SOS</Text>
                </View>
              </View>

              {asNeededMeds.map((med) => {
                const todayDosesForMed = dayDoses.filter(
                  (d) => d.medicationId === med.id && d.status === 'TAKEN'
                );
                return (
                  <View key={med.id} style={styles.asNeededCard}>
                    <View style={styles.asNeededInfo}>
                      <Text style={styles.asNeededMedName}>{med.nameAsWritten}</Text>
                      <Text style={styles.asNeededMedSub}>
                        {med.strength ? `${med.strength} • ` : ''}
                        {med.dosageForm ? `${med.dosageForm} • ` : ''}
                        {med.prescribedInstructions || 'Take as needed when symptoms occur'}
                      </Text>
                      {todayDosesForMed.length > 0 && (
                        <Text style={styles.asNeededTakenNotice}>
                          ✓ {todayDosesForMed.length} dose{todayDosesForMed.length > 1 ? 's' : ''} recorded today
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.asNeededLogBtn}
                      onPress={() => handleRecordAsNeededDose(med)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.asNeededLogBtnText}>+ Log Dose</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
    </>
  );
}
