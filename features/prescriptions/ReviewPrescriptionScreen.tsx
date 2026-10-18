import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/index';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { DocumentPreview } from '../../components/DocumentPreview';

export interface EditableMedicine {
  id: string;
  name_as_written: string;
  normalized_medicine_name?: string;
  strength?: string;
  dosage_form: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'DROPS' | 'INHALER' | 'OTHER';
  frequency_text?: string;
  duration_text?: string;
  route: 'ORAL' | 'TOPICAL' | 'INTRAVENOUS' | 'INHALATION' | 'OPHTHALMIC' | 'OTHER';
  instructions?: string;
  confidence: 'HIGH' | 'UNCERTAIN';
  is_active_medication: boolean;
  times_per_day?: number;
  reminder_times?: string[];
  total_count?: string;
}

const DURATION_PRESETS = [
  '1 Day',
  '3 Days',
  '5 Days',
  '7 Days',
  '10 Days',
  '14 Days',
  '1 Month',
  '3 Months',
  'Ongoing',
];

const FREQUENCY_PRESETS = [
  { label: '1x Daily', times: ['08:00'] },
  { label: '2x Daily', times: ['08:00', '20:00'] },
  { label: '3x Daily', times: ['08:00', '13:00', '20:00'] },
  { label: '4x Daily', times: ['08:00', '12:00', '16:00', '20:00'] },
  { label: 'As Needed', times: [] },
];

export interface ReviewPrescriptionScreenProps {
  jobId: string;
  documentId: string;
  documentFilename: string;
  documentMimeType: string;
  signedUrl?: string;
  localUri?: string;
  initialExtraction: {
    prescription_date?: string;
    date_is_uncertain: boolean;
    doctor_name?: string;
    clinic_hospital_name?: string;
    documented_diagnosis?: string;
    medicines: Array<any>;
    validation_warnings?: string[];
  };
  onConfirm: (reviewPayload: any) => Promise<void>;
  onDiscard: () => void;
}

export const ReviewPrescriptionScreen: React.FC<ReviewPrescriptionScreenProps> = ({
  jobId,
  documentId,
  documentFilename,
  documentMimeType,
  signedUrl,
  localUri,
  initialExtraction,
  onConfirm,
  onDiscard,
}) => {
  // Safely parse initialExtraction in case of stringified JSON, null, or missing fields
  const safeExtraction = React.useMemo(() => {
    let raw = initialExtraction as any;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = {};
      }
    }
    return raw && typeof raw === 'object' ? raw : {};
  }, [initialExtraction]);

  const [prescriptionDate, setPrescriptionDate] = useState<string>(
    safeExtraction.prescription_date || ''
  );
  const [dateIsUncertain, setDateIsUncertain] = useState<boolean>(
    Boolean(safeExtraction.date_is_uncertain || !safeExtraction.prescription_date)
  );
  const [doctorName, setDoctorName] = useState<string>(
    safeExtraction.doctor_name || ''
  );
  const [clinicName, setClinicName] = useState<string>(
    safeExtraction.clinic_hospital_name || ''
  );
  const [diagnosis, setDiagnosis] = useState<string>(
    safeExtraction.documented_diagnosis || ''
  );

  const [medicines, setMedicines] = useState<EditableMedicine[]>(() => {
    const rawMeds = Array.isArray(safeExtraction.medicines) ? safeExtraction.medicines : [];
    if (rawMeds.length === 0) {
      return [
        {
          id: 'med-1',
          name_as_written: '',
          normalized_medicine_name: '',
          strength: '',
          dosage_form: 'TABLET',
          frequency_text: '1x Daily',
          duration_text: '7 Days',
          route: 'ORAL',
          instructions: '',
          confidence: 'HIGH',
          is_active_medication: true,
          times_per_day: 1,
          reminder_times: ['08:00'],
          total_count: '',
        },
      ];
    }
    return rawMeds.map((m: any, idx: number) => {
      let defaultTimes = ['08:00'];
      const freq = (m?.frequency_text || '').toLowerCase();
      if (freq.includes('bd') || freq.includes('twice') || freq.includes('2x') || freq.includes('1-0-1')) {
        defaultTimes = ['08:00', '20:00'];
      } else if (freq.includes('tds') || freq.includes('thrice') || freq.includes('3x') || freq.includes('1-1-1')) {
        defaultTimes = ['08:00', '13:00', '20:00'];
      } else if (freq.includes('qid') || freq.includes('4x')) {
        defaultTimes = ['08:00', '12:00', '16:00', '20:00'];
      }

      return {
        id: m?.id || `med-${idx + 1}`,
        name_as_written: m?.name_as_written || '',
        normalized_medicine_name: m?.normalized_medicine_name || '',
        strength: m?.strength || '',
        dosage_form: m?.dosage_form || 'TABLET',
        frequency_text: m?.frequency_text || '1x Daily',
        duration_text: m?.duration_text || '7 Days',
        route: m?.route || 'ORAL',
        instructions: m?.instructions || '',
        confidence: m?.confidence || 'HIGH',
        is_active_medication: Boolean(m?.is_active_medication),
        times_per_day: defaultTimes.length,
        reminder_times: Array.isArray(m?.reminder_times) && m.reminder_times.length > 0 ? m.reminder_times : defaultTimes,
        total_count: m?.total_count || '',
      };
    });
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleUpdateMedicine = (id: string, updates: Partial<EditableMedicine>) => {
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updates } : med))
    );
  };

  const handleAddMedicine = () => {
    const newId = `med-custom-${Date.now()}`;
    const newMed: EditableMedicine = {
      id: newId,
      name_as_written: '',
      dosage_form: 'TABLET',
      route: 'ORAL',
      confidence: 'HIGH',
      is_active_medication: true,
      duration_text: '7 Days',
      times_per_day: 1,
      reminder_times: ['08:00'],
      total_count: '',
    };
    setMedicines((prev) => [...prev, newMed]);
  };

  const handleRemoveMedicine = (id: string) => {
    if (medicines.length <= 1) {
      Alert.alert('Notice', 'At least one medicine is required on a prescription.');
      return;
    }
    setMedicines((prev) => prev.filter((med) => med.id !== id));
  };

  const handleConfirm = async () => {
    // Validate that medicine names are present
    const emptyNames = medicines.some((m) => !m.name_as_written.trim());
    if (emptyNames) {
      setFormError('All medicines must have a name as written.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      let cleanDate: string | undefined = prescriptionDate.trim() || undefined;
      if (cleanDate) {
        const dmy = cleanDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (dmy) {
          cleanDate = `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
        }
      }

      const payload = {
        documentId,
        prescription_date: cleanDate,
        date_is_uncertain: dateIsUncertain || !cleanDate,
        doctor_name: doctorName.trim() || undefined,
        clinic_hospital_name: clinicName.trim() || undefined,
        documented_diagnosis: diagnosis.trim() || undefined,
        medicines: medicines.map((m) => ({
          name_as_written: m.name_as_written.trim(),
          normalized_medicine_name: m.normalized_medicine_name?.trim() || undefined,
          strength: m.strength?.trim() || undefined,
          dosage_form: m.dosage_form,
          frequency_text: m.frequency_text?.trim() || undefined,
          duration_text: m.duration_text?.trim() || undefined,
          route: m.route,
          instructions: m.instructions?.trim() || undefined,
          is_active_medication: m.is_active_medication,
          reminder_times: m.reminder_times || (m.is_active_medication ? ['08:00'] : undefined),
          total_count: m.total_count?.trim() || undefined,
        })),
      };

      await onConfirm(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Confirmation failed';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Bar with Cancel / Dismiss */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onDiscard}
          style={styles.cancelTopButton}
          accessibilityLabel="Discard review and return to home"
        >
          <Text style={styles.cancelTopText}>✕ Discard</Text>
        </TouchableOpacity>
        <Badge label="Clinical Review" variant="warning" />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Patient Review & Correction</Text>
        <Text style={styles.screenSubtitle}>
          Verify extracted fields against your original document. AI output is draft until confirmed.
        </Text>
      </View>

      {/* Original Document Preview */}
      <DocumentPreview
        filename={documentFilename}
        mimeType={documentMimeType}
        signedUrl={signedUrl}
        localUri={localUri}
        style={styles.documentPreview}
      />

      {/* Warnings Banner if AI had uncertainties */}
      {Array.isArray(safeExtraction.validation_warnings) &&
        safeExtraction.validation_warnings.length > 0 && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningTitle}>⚠️ Ambiguity Detected by AI:</Text>
            {safeExtraction.validation_warnings.map((w: string, i: number) => (
              <Text key={i} style={styles.warningItem}>
                • {w}
              </Text>
            ))}
          </View>
        )}

      {formError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>❌ {formError}</Text>
        </View>
      )}

      {/* Prescription Metadata Card */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Prescription Details</Text>

        <Input
          label="Prescription Date (YYYY-MM-DD)"
          value={prescriptionDate}
          onChangeText={setPrescriptionDate}
          placeholder="e.g. 2026-10-12"
        />

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setDateIsUncertain(!dateIsUncertain)}
        >
          <View style={[styles.checkbox, dateIsUncertain && styles.checkboxChecked]}>
            {dateIsUncertain && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            Date is unwritten, approximate, or uncertain
          </Text>
        </TouchableOpacity>

        <Input
          label="Prescribing Doctor"
          value={doctorName}
          onChangeText={setDoctorName}
          placeholder="e.g. Dr. A. Verma, MD"
        />

        <Input
          label="Clinic / Hospital Name"
          value={clinicName}
          onChangeText={setClinicName}
          placeholder="e.g. Apollo Clinic"
        />

        <Input
          label="Documented Clinical Diagnosis"
          value={diagnosis}
          onChangeText={setDiagnosis}
          placeholder="e.g. Type 2 Diabetes Mellitus"
        />
      </Card>

      {/* Medicines Section */}
      <View style={styles.medicinesHeader}>
        <Text style={styles.sectionTitle}>
          Medications ({medicines.length})
        </Text>
        <TouchableOpacity style={styles.addMedButton} onPress={handleAddMedicine}>
          <Text style={styles.addMedButtonText}>+ Add Medicine</Text>
        </TouchableOpacity>
      </View>

      {medicines.map((med, index) => {
        const isMissingRequired =
          med.is_active_medication &&
          (!med.name_as_written.trim() ||
            !med.duration_text?.trim() ||
            !med.reminder_times ||
            med.reminder_times.length === 0);

        return (
          <Card
            key={med.id}
            style={[
              styles.medicineCard,
              med.is_active_medication && styles.medicineCardActive,
              isMissingRequired && styles.medicineCardWarning,
            ]}
          >
            <View style={styles.medCardHeader}>
              <View style={styles.medTitleRow}>
                <Text style={styles.medIndexBadge}>#{index + 1}</Text>
                <Text style={styles.medHeaderTitle}>
                  {med.name_as_written || 'New Medicine'}
                </Text>
              </View>

              {med.is_active_medication ? (
                isMissingRequired ? (
                  <Badge label="⚠️ Incomplete" variant="warning" />
                ) : (
                  <Badge label="✓ Active Regimen" variant="success" />
                )
              ) : (
                <Badge label="Historical Only" variant="neutral" />
              )}
            </View>

            {/* Action Required Alert Box */}
            {isMissingRequired && (
              <View style={styles.requiredWarningBox}>
                <Text style={styles.requiredWarningTitle}>⚠️ Action Required for Reminders:</Text>
                <Text style={styles.requiredWarningText}>
                  Please choose a course duration and at least 1 reminder time so daily dose alarms can be scheduled.
                </Text>
              </View>
            )}

            <Input
              label="Medicine Name (as written on slip) *"
              value={med.name_as_written}
              onChangeText={(val) => handleUpdateMedicine(med.id, { name_as_written: val })}
              placeholder="e.g. Augmentin 625"
            />

            <Input
              label="Normalized / Generic Name"
              value={med.normalized_medicine_name || ''}
              onChangeText={(val) =>
                handleUpdateMedicine(med.id, { normalized_medicine_name: val })
              }
              placeholder="e.g. Amoxicillin and Clavulanate Potassium"
            />

            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Input
                  label="Strength"
                  value={med.strength || ''}
                  onChangeText={(val) => handleUpdateMedicine(med.id, { strength: val })}
                  placeholder="e.g. 500 mg"
                />
              </View>
              <View style={styles.inputCol}>
                <Input
                  label="Dosage Form"
                  value={med.dosage_form}
                  onChangeText={(val) =>
                    handleUpdateMedicine(med.id, {
                      dosage_form: val.toUpperCase() as any,
                    })
                  }
                  placeholder="TABLET / SYRUP / CAPSULE"
                />
              </View>
            </View>

            {/* ACTIVE REGIMEN PROMINENT TOGGLE */}
            <TouchableOpacity
              style={[
                styles.activeToggleCard,
                med.is_active_medication ? styles.activeToggleCardOn : styles.activeToggleCardOff,
              ]}
              onPress={() => {
                const nextActive = !med.is_active_medication;
                const defaultTimes =
                  nextActive && (!med.reminder_times || med.reminder_times.length === 0)
                    ? ['08:00']
                    : med.reminder_times;
                handleUpdateMedicine(med.id, {
                  is_active_medication: nextActive,
                  reminder_times: defaultTimes,
                  duration_text: nextActive && !med.duration_text ? '7 Days' : med.duration_text,
                });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.toggleRow}>
                <View
                  style={[
                    styles.toggleCheckbox,
                    med.is_active_medication && styles.toggleCheckboxActive,
                  ]}
                >
                  {med.is_active_medication && <Text style={styles.toggleCheckText}>✓</Text>}
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.toggleTitle}>
                    {med.is_active_medication
                      ? '✓ Active Medicine (Schedule Daily Reminders)'
                      : 'Historical Prescription Only (No Reminders)'}
                  </Text>
                  <Text style={styles.toggleSub}>
                    {med.is_active_medication
                      ? 'Dose alarms and daily schedule will be enabled for this medicine.'
                      : 'Preserved as clinical record without setting recurring alerts.'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* SCHEDULE & DOSAGE CONTROLS */}
            {med.is_active_medication && (
              <View style={styles.scheduleConfigContainer}>
                {/* 1. DURATION SELECTOR */}
                <Text style={styles.controlSectionLabel}>
                  Course Duration <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.chipRow}>
                  {DURATION_PRESETS.map((preset) => {
                    const isSelected = med.duration_text === preset;
                    return (
                      <TouchableOpacity
                        key={preset}
                        style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                        onPress={() => handleUpdateMedicine(med.id, { duration_text: preset })}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            isSelected && styles.presetChipTextSelected,
                          ]}
                        >
                          {preset}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Input
                  label="Custom Duration (e.g. 10 days, 2 weeks)"
                  value={med.duration_text || ''}
                  onChangeText={(val) => handleUpdateMedicine(med.id, { duration_text: val })}
                  placeholder="e.g. 5 Days or Ongoing"
                />

                {/* 2. FREQUENCY SELECTOR */}
                <Text style={styles.controlSectionLabel}>
                  Frequency (Times Per Day) <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.chipRow}>
                  {FREQUENCY_PRESETS.map((preset) => {
                    const isSelected =
                      med.frequency_text === preset.label ||
                      (preset.times.length > 0 &&
                        med.reminder_times?.length === preset.times.length);
                    return (
                      <TouchableOpacity
                        key={preset.label}
                        style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                        onPress={() =>
                          handleUpdateMedicine(med.id, {
                            frequency_text: preset.label,
                            times_per_day: preset.times.length,
                            reminder_times: preset.times.length > 0 ? preset.times : med.reminder_times,
                          })
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            isSelected && styles.presetChipTextSelected,
                          ]}
                        >
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3. SCHEDULED REMINDER TIMES */}
                <Text style={styles.controlSectionLabel}>
                  Scheduled Reminder Times <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.timesContainer}>
                  {(med.reminder_times && med.reminder_times.length > 0
                    ? med.reminder_times
                    : ['08:00']
                  ).map((timeStr, timeIdx) => (
                    <View key={timeIdx} style={styles.timeChipRow}>
                      <View style={styles.timeChipBadge}>
                        <Text style={styles.timeChipText}>⏰ Dose {timeIdx + 1}: {timeStr}</Text>
                      </View>

                      <View style={styles.timeQuickPicker}>
                        {['08:00', '13:00', '20:00', '22:00'].map((presetTime) => (
                          <TouchableOpacity
                            key={presetTime}
                            style={[
                              styles.miniTimeBtn,
                              timeStr === presetTime && styles.miniTimeBtnActive,
                            ]}
                            onPress={() => {
                              const newTimes = [...(med.reminder_times || ['08:00'])];
                              newTimes[timeIdx] = presetTime;
                              handleUpdateMedicine(med.id, { reminder_times: newTimes });
                            }}
                          >
                            <Text
                              style={[
                                styles.miniTimeBtnText,
                                timeStr === presetTime && styles.miniTimeBtnTextActive,
                              ]}
                            >
                              {presetTime}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}

                  <View style={styles.timeActionsRow}>
                    <TouchableOpacity
                      style={styles.addTimeBtn}
                      onPress={() => {
                        const current = med.reminder_times || [];
                        const defaultNext =
                          current.length === 1 ? '20:00' : current.length === 2 ? '13:00' : '22:00';
                        handleUpdateMedicine(med.id, {
                          reminder_times: [...current, defaultNext],
                        });
                      }}
                    >
                      <Text style={styles.addTimeBtnText}>+ Add Reminder Time</Text>
                    </TouchableOpacity>

                    {med.reminder_times && med.reminder_times.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeTimeBtn}
                        onPress={() => {
                          const current = [...(med.reminder_times || [])];
                          current.pop();
                          handleUpdateMedicine(med.id, { reminder_times: current });
                        }}
                      >
                        <Text style={styles.removeTimeBtnText}>- Remove Last</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* 4. TOTAL MEDICINE COUNT */}
                <Input
                  label="Total Quantity / Pill Count (e.g. 10 Tablets, 1 Bottle)"
                  value={med.total_count || ''}
                  onChangeText={(val) => handleUpdateMedicine(med.id, { total_count: val })}
                  placeholder="e.g. 10 tablets, 30 capsules"
                />
              </View>
            )}

            <Input
              label="Instructions / Notes"
              value={med.instructions || ''}
              onChangeText={(val) =>
                handleUpdateMedicine(med.id, { instructions: val })
              }
              placeholder="e.g. Take after food with water"
            />

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemoveMedicine(med.id)}
            >
              <Text style={styles.deleteButtonText}>✕ Remove Medicine</Text>
            </TouchableOpacity>
          </Card>
        );
      })}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title={isSubmitting ? 'Confirming...' : 'Confirm & Save to Timeline'}
          variant="primary"
          onPress={handleConfirm}
          disabled={isSubmitting}
        />
        <Button
          title="Discard Draft"
          variant="ghost"
          onPress={onDiscard}
          disabled={isSubmitting}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: Platform.OS === 'android' ? spacing.sm : 0,
  },
  cancelTopButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelTopText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  header: {
    marginBottom: spacing.md,
  },
  screenTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  screenSubtitle: {
    ...typography.bodyMuted,
    marginTop: spacing.xs,
  },
  documentPreview: {
    marginBottom: spacing.md,
  },
  warningBanner: {
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  warningTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  warningItem: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxMark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  medicinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  addMedButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addMedButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  medicineCard: {
    marginBottom: spacing.md,
  },
  medCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  medTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  medIndexBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  medHeaderTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputCol: {
    flex: 1,
  },
  activeMedCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
  },
  activeMedLabelContainer: {
    flex: 1,
  },
  activeMedTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  activeMedSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  deleteButtonText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '500',
  },
  actionButtons: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  medicineCardActive: {
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  medicineCardWarning: {
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  requiredWarningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  requiredWarningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  requiredWarningText: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
  },
  activeToggleCard: {
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.sm,
    borderWidth: 1.5,
  },
  activeToggleCardOn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  activeToggleCardOff: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  toggleCheckboxActive: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  toggleCheckText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  toggleTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toggleSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scheduleConfigContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  controlSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  requiredStar: {
    color: colors.danger,
    fontWeight: '800',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipSelected: {
    backgroundColor: colors.accentCoral,
    borderColor: colors.accentCoralDark,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timesContainer: {
    marginBottom: spacing.sm,
  },
  timeChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
  },
  timeChipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timeQuickPicker: {
    flexDirection: 'row',
    gap: 4,
  },
  miniTimeBtn: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniTimeBtnActive: {
    backgroundColor: colors.accentCoral,
    borderColor: colors.accentCoral,
  },
  miniTimeBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  miniTimeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timeActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  addTimeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: '#E0F2FE',
  },
  addTimeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  removeTimeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: '#FEE2E2',
  },
  removeTimeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
});
