import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DocumentPreview } from '../../../components/DocumentPreview';
import { Button } from '../../../design/components/Actions/Button';
import { Card } from '../../../design/components/Containers/Card';
import { Divider } from '../../../design/components/Foundations/Divider';
import { Text } from '../../../design/components/Foundations/Text';
import { color, radius, space } from '../../../design/tokens';
import { t } from '../../../design/strings';
import type {
  DocumentSignedUrl,
  MedicationDetail,
} from '../../../services/medications/medication-service';

export interface InstructionsCardProps {
  medication: MedicationDetail;
  showDocumentPreview: boolean;
  loadingDoc: boolean;
  docError: string | null;
  documentUrlInfo: DocumentSignedUrl | null;
  onOpenDocument: () => void;
  onHideDocument: () => void;
}

export function InstructionsCard({
  medication,
  showDocumentPreview,
  loadingDoc,
  docError,
  documentUrlInfo,
  onOpenDocument,
  onHideDocument,
}: InstructionsCardProps) {
  return (
    <Card style={styles.stack}>
      <Text variant="title3">{t('medicines.detail.instructionsTitle')}</Text>
      <Text variant="body">
        {medication.prescribedInstructions || t('medicines.detail.noInstructions')}
      </Text>

      <Divider />

      <Text variant="caption" tone="secondary">
        {t('medicines.detail.provenanceLabel')}
      </Text>
      {medication.prescription ? (
        <View style={styles.provenance}>
          {medication.prescription.doctorName ? (
            <Text variant="callout" tone="secondary">
              {t('medicines.detail.doctor', { name: medication.prescription.doctorName })}
            </Text>
          ) : null}
          {medication.prescription.clinicHospitalName ? (
            <Text variant="callout" tone="secondary">
              {t('medicines.detail.clinic', { name: medication.prescription.clinicHospitalName })}
            </Text>
          ) : null}
          {medication.prescription.prescriptionDate ? (
            <Text variant="callout" tone="secondary">
              {t('medicines.detail.prescriptionDate', {
                date: medication.prescription.prescriptionDate,
              })}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text variant="callout" tone="secondary">
          {t('medicines.detail.selfReported')}
        </Text>
      )}

      {medication.sourceDocumentId ? (
        <View style={styles.stackTight}>
          <Button
            label={
              showDocumentPreview
                ? t('medicines.detail.hideDocument')
                : t('medicines.detail.viewDocument')
            }
            variant="secondary"
            fullWidth
            loading={loadingDoc}
            onPress={() => {
              if (!showDocumentPreview) {
                onOpenDocument();
              } else {
                onHideDocument();
              }
            }}
          />

          {showDocumentPreview ? (
            loadingDoc ? (
              <ActivityIndicator size="small" color={color.action.primary} />
            ) : docError ? (
              <Text variant="callout" tone="danger">
                {docError}
              </Text>
            ) : documentUrlInfo ? (
              <DocumentPreview
                filename={documentUrlInfo.filename}
                mimeType={documentUrlInfo.mimeType}
                signedUrl={documentUrlInfo.signedUrl}
              />
            ) : null
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space.sm,
  },
  stackTight: {
    gap: space.sm,
    marginTop: space.xs,
  },
  provenance: {
    backgroundColor: color.bg.subtle,
    padding: space.sm,
    borderRadius: radius.sm,
    gap: space.xxs,
  },
});
