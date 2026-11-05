import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { Screen } from '../../design/components/Foundations/Screen';
import { Text } from '../../design/components/Foundations/Text';
import { t } from '../../design/strings';
import { space } from '../../design/tokens';
import { DocumentPreview } from '../documents/DocumentPreview';
import { ReviewBanners } from './review/ReviewBanners';
import { ReviewHeader } from './review/ReviewHeader';
import { MedicineCard } from './review/MedicineCard';
import { PrescriptionDetailsCard } from './review/PrescriptionDetailsCard';
import { buildInitialMedicines, buildReviewPayload } from './review/reviewLogic';
import type { EditableMedicine } from './review/reviewTypes';

export type { EditableMedicine } from './review/reviewTypes';

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

// Drafts only. Nothing here is saved until the patient taps confirm.
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

  const [medicines, setMedicines] = useState<EditableMedicine[]>(() =>
    buildInitialMedicines(safeExtraction.medicines)
  );

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
      Alert.alert(t('prescriptions.review.noticeTitle'), t('prescriptions.review.minOneMedicine'));
      return;
    }
    setMedicines((prev) => prev.filter((med) => med.id !== id));
  };

  const handleConfirm = async () => {
    // Validate that medicine names are present
    const emptyNames = medicines.some((m) => !m.name_as_written.trim());
    if (emptyNames) {
      setFormError(t('prescriptions.review.errorNameRequired'));
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = buildReviewPayload({
        documentId,
        prescriptionDate,
        dateIsUncertain,
        doctorName,
        clinicName,
        diagnosis,
        medicines,
      });

      await onConfirm(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('prescriptions.review.errorConfirmFailed');
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.column}>
        <ReviewHeader onDiscard={onDiscard} />

        {/* Original Document Preview */}
        <DocumentPreview
          filename={documentFilename}
          mimeType={documentMimeType}
          signedUrl={signedUrl}
          localUri={localUri}
        />

        <ReviewBanners
          warnings={safeExtraction.validation_warnings}
          formError={formError}
        />

        <PrescriptionDetailsCard
          prescriptionDate={prescriptionDate}
          onPrescriptionDateChange={setPrescriptionDate}
          dateIsUncertain={dateIsUncertain}
          onDateIsUncertainChange={setDateIsUncertain}
          doctorName={doctorName}
          onDoctorNameChange={setDoctorName}
          clinicName={clinicName}
          onClinicNameChange={setClinicName}
          diagnosis={diagnosis}
          onDiagnosisChange={setDiagnosis}
        />

        <View style={styles.medicinesHeader}>
          <Text variant="title2" style={styles.medicinesTitle}>
            {t('prescriptions.review.medicinesTitle', { count: medicines.length })}
          </Text>
          <Button
            label={t('prescriptions.review.addMedicine')}
            icon="add"
            variant="secondary"
            onPress={handleAddMedicine}
          />
        </View>

        {medicines.map((med, index) => (
          <MedicineCard
            key={med.id}
            med={med}
            index={index}
            onUpdate={(updates) => handleUpdateMedicine(med.id, updates)}
            onRemove={() => handleRemoveMedicine(med.id)}
          />
        ))}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            label={isSubmitting ? t('prescriptions.review.confirming') : t('prescriptions.review.confirm')}
            variant="primary"
            onPress={handleConfirm}
            disabled={isSubmitting}
            fullWidth
          />
          <Button
            label={t('prescriptions.review.discardDraft')}
            variant="text"
            onPress={onDiscard}
            disabled={isSubmitting}
            fullWidth
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  column: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    gap: space.lg,
    paddingBottom: space.xxl,
  },
  medicinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
  },
  medicinesTitle: {
    flexShrink: 1,
  },
  actions: {
    gap: space.sm,
  },
});
