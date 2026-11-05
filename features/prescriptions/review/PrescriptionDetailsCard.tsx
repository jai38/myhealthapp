import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from '../../../design/components/Containers/Card';
import { Checkbox } from '../../../design/components/Inputs/Checkbox';
import { TextField } from '../../../design/components/Inputs/TextField';
import { Text } from '../../../design/components/Foundations/Text';
import { UncertainMarker } from '../../../design/components/Trust/UncertainMarker';
import { t } from '../../../design/strings';
import { space } from '../../../design/tokens';

export interface PrescriptionDetailsCardProps {
  prescriptionDate: string;
  onPrescriptionDateChange: (value: string) => void;
  dateIsUncertain: boolean;
  onDateIsUncertainChange: (value: boolean) => void;
  doctorName: string;
  onDoctorNameChange: (value: string) => void;
  clinicName: string;
  onClinicNameChange: (value: string) => void;
  diagnosis: string;
  onDiagnosisChange: (value: string) => void;
}

export function PrescriptionDetailsCard({
  prescriptionDate,
  onPrescriptionDateChange,
  dateIsUncertain,
  onDateIsUncertainChange,
  doctorName,
  onDoctorNameChange,
  clinicName,
  onClinicNameChange,
  diagnosis,
  onDiagnosisChange,
}: PrescriptionDetailsCardProps) {
  return (
    <Card style={styles.card}>
      <Text variant="title3">{t('prescriptions.review.detailsTitle')}</Text>

      <TextField
        label={t('prescriptions.review.dateLabel')}
        value={prescriptionDate}
        onChangeText={onPrescriptionDateChange}
        placeholder={t('prescriptions.review.datePlaceholder')}
      />
      <Checkbox
        label={t('prescriptions.review.dateUncertain')}
        checked={dateIsUncertain}
        onChange={onDateIsUncertainChange}
      />
      {dateIsUncertain ? <UncertainMarker /> : null}

      <TextField
        label={t('prescriptions.review.doctorLabel')}
        value={doctorName}
        onChangeText={onDoctorNameChange}
        placeholder={t('prescriptions.review.doctorPlaceholder')}
      />
      <TextField
        label={t('prescriptions.review.clinicLabel')}
        value={clinicName}
        onChangeText={onClinicNameChange}
        placeholder={t('prescriptions.review.clinicPlaceholder')}
      />
      <TextField
        label={t('prescriptions.review.diagnosisLabel')}
        value={diagnosis}
        onChangeText={onDiagnosisChange}
        placeholder={t('prescriptions.review.diagnosisPlaceholder')}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.md,
  },
});
