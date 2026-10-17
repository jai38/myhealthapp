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
}

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
          frequency_text: '',
          duration_text: '',
          route: 'ORAL',
          instructions: '',
          confidence: 'HIGH',
          is_active_medication: true,
        },
      ];
    }
    return rawMeds.map((m: any, idx: number) => ({
      id: m?.id || `med-${idx + 1}`,
      name_as_written: m?.name_as_written || '',
      normalized_medicine_name: m?.normalized_medicine_name || '',
      strength: m?.strength || '',
      dosage_form: m?.dosage_form || 'TABLET',
      frequency_text: m?.frequency_text || '',
      duration_text: m?.duration_text || '',
      route: m?.route || 'ORAL',
      instructions: m?.instructions || '',
      confidence: m?.confidence || 'HIGH',
      is_active_medication: m?.is_active_medication !== undefined ? Boolean(m.is_active_medication) : true,
    }));
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
      is_active_medication: false,
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

      {medicines.map((med, index) => (
        <Card key={med.id} style={styles.medicineCard}>
          <View style={styles.medCardHeader}>
            <View style={styles.medTitleRow}>
              <Text style={styles.medIndexBadge}>#{index + 1}</Text>
              <Text style={styles.medHeaderTitle}>
                {med.name_as_written || 'New Medicine'}
              </Text>
            </View>

            {med.confidence === 'UNCERTAIN' ? (
              <Badge label="Uncertain Text" variant="warning" />
            ) : (
              <Badge label="Verified Format" variant="success" />
            )}
          </View>

          <Input
            label="Medicine Name (as written on slip)"
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
                placeholder="TABLET / SYRUP"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Input
                label="Frequency (e.g. 1-0-1)"
                value={med.frequency_text || ''}
                onChangeText={(val) =>
                  handleUpdateMedicine(med.id, { frequency_text: val })
                }
                placeholder="1-0-1 or TDS pc"
              />
            </View>
            <View style={styles.inputCol}>
              <Input
                label="Duration"
                value={med.duration_text || ''}
                onChangeText={(val) =>
                  handleUpdateMedicine(med.id, { duration_text: val })
                }
                placeholder="e.g. 5 days"
              />
            </View>
          </View>

          <Input
            label="Instructions"
            value={med.instructions || ''}
            onChangeText={(val) =>
              handleUpdateMedicine(med.id, { instructions: val })
            }
            placeholder="e.g. Take after food"
          />

          {/* Historical Prescription Activation Checkbox */}
          <TouchableOpacity
            style={styles.activeMedCheckboxRow}
            onPress={() =>
              handleUpdateMedicine(med.id, {
                is_active_medication: !med.is_active_medication,
              })
            }
          >
            <View
              style={[
                styles.checkbox,
                med.is_active_medication && styles.checkboxChecked,
              ]}
            >
              {med.is_active_medication && <Text style={styles.checkboxMark}>✓</Text>}
            </View>
            <View style={styles.activeMedLabelContainer}>
              <Text style={styles.activeMedTitle}>
                Activate as Ongoing Medication Regimen
              </Text>
              <Text style={styles.activeMedSubtitle}>
                Historical prescriptions do not automatically set recurring dose alarms. Check only if this is an active current medicine.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleRemoveMedicine(med.id)}
          >
            <Text style={styles.deleteButtonText}>Remove Medicine</Text>
          </TouchableOpacity>
        </Card>
      ))}

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
});
