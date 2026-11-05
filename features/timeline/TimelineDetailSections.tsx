import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { Card } from '../../design/components/Containers/Card';
import { StatusPill } from '../../design/components/Trust/StatusPill';
import { Text } from '../../design/components/Foundations/Text';
import { color, space } from '../../design/tokens';
import type { StatusDisplay } from '../../design/status';
import { t } from '../../design/strings';
import { DocumentPreview } from '../documents/DocumentPreview';
import type {
  PrescriptionItemDetail,
  TimelineDetail,
  TimelineDocumentUrl,
} from '../../services/timeline/timeline-service';

type Prescription = NonNullable<TimelineDetail['prescription']>;
type SourceDocument = NonNullable<TimelineDetail['sourceDocument']>;

// The regimen flag is not a dose status, so it is built here rather than in doseStatusDisplay.
function regimenDisplay(isActive: boolean): StatusDisplay {
  return isActive
    ? { labelKey: 'records.detail.activeRegimen', tone: 'success', variant: 'soft', icon: 'medkit-outline' }
    : { labelKey: 'records.detail.historical', tone: 'neutral', variant: 'soft', icon: 'time-outline' };
}

export function TimelineDetailDates({
  formatted,
  precision,
  uploadedAt,
}: {
  formatted: string | undefined;
  precision: string | null | undefined;
  uploadedAt: string | undefined;
}) {
  return (
    <Card style={styles.section}>
      <View style={styles.dateRow}>
        <View style={styles.dateCol}>
          <Text variant="overline" tone="secondary">
            {t('records.detail.medicalDate')}
          </Text>
          <Text variant="title3" tone="link">
            {formatted}
          </Text>
          {precision && precision !== 'EXACT' ? (
            <Text variant="caption" tone="tertiary">
              {t('records.detail.precision', { precision: precision.replace('_', ' ').toLowerCase() })}
            </Text>
          ) : null}
        </View>
        {uploadedAt ? (
          <View style={styles.dateCol}>
            <Text variant="overline" tone="secondary">
              {t('records.detail.uploaded')}
            </Text>
            <Text variant="bodyStrong" tone="primary">
              {new Date(uploadedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text variant="caption" tone="tertiary">
              {t('records.detail.systemTimestamp')}
            </Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="caption" tone="secondary" style={styles.infoLabel}>
        {label}
      </Text>
      <Text variant="caption" tone="primary" style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

export function TimelineDetailClinic({ prescription }: { prescription: Prescription }) {
  return (
    <Card style={styles.section}>
      <Text variant="title3" tone="primary" style={styles.cardTitle}>
        {t('records.detail.clinicTitle')}
      </Text>
      {prescription.doctorName ? (
        <InfoRow label={t('records.detail.physician')} value={prescription.doctorName} />
      ) : null}
      {prescription.clinicHospitalName ? (
        <InfoRow label={t('records.detail.facility')} value={prescription.clinicHospitalName} />
      ) : null}
      {prescription.diagnosis ? (
        <InfoRow label={t('records.detail.diagnosis')} value={prescription.diagnosis} />
      ) : null}
      {prescription.confirmedAt ? (
        <InfoRow
          label={t('records.detail.confirmationDate')}
          value={new Date(prescription.confirmedAt).toLocaleDateString()}
        />
      ) : null}
    </Card>
  );
}

function MedicationCard({ item }: { item: PrescriptionItemDetail }) {
  return (
    <Card style={styles.medCard}>
      <View style={styles.medHeader}>
        <View style={styles.medTitleCol}>
          <Text variant="bodyStrong" tone="primary">
            {item.nameAsWritten}
          </Text>
          {item.normalizedMedicineName && item.normalizedMedicineName !== item.nameAsWritten ? (
            <Text variant="caption" tone="secondary">
              {t('records.detail.genericName', { name: item.normalizedMedicineName })}
            </Text>
          ) : null}
        </View>
        <StatusPill display={regimenDisplay(item.isActiveMedication)} />
      </View>

      <View style={styles.metaRow}>
        {item.dosageForm ? (
          <Text variant="caption" tone="secondary">
            {t('records.detail.formLabel', { form: item.dosageForm })}
          </Text>
        ) : null}
        {item.strength ? (
          <Text variant="caption" tone="secondary">
            {t('records.detail.strengthLabel', { strength: item.strength })}
          </Text>
        ) : null}
        {item.frequencyText ? (
          <Text variant="caption" tone="secondary">
            {item.frequencyText}
          </Text>
        ) : null}
        {item.durationText ? (
          <Text variant="caption" tone="secondary">
            {item.durationText}
          </Text>
        ) : null}
      </View>

      {item.instructions ? (
        <View style={styles.note}>
          <Text variant="caption" tone="secondary">
            {t('records.detail.note', { note: item.instructions })}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

export function TimelineDetailMedications({ items }: { items: PrescriptionItemDetail[] }) {
  return (
    <View style={styles.section}>
      <Text variant="title3" tone="primary">
        {t('records.detail.medsTitle', { count: items.length })}
      </Text>
      <Text variant="caption" tone="tertiary" style={styles.notice}>
        {t('records.detail.medsNotice')}
      </Text>
      {items.map((item, index) => (
        <MedicationCard key={item.id || index} item={item} />
      ))}
    </View>
  );
}

export interface TimelineDetailSourceProps {
  sourceDocument: SourceDocument;
  showPreview: boolean;
  loadingDoc: boolean;
  docError: string | null;
  documentUrlInfo: TimelineDocumentUrl | null;
  onOpenDocument: () => void;
}

export function TimelineDetailSource({
  sourceDocument,
  showPreview,
  loadingDoc,
  docError,
  documentUrlInfo,
  onOpenDocument,
}: TimelineDetailSourceProps) {
  return (
    <Card style={styles.section}>
      <Text variant="title3" tone="primary" style={styles.cardTitle}>
        {t('records.detail.sourceTitle')}
      </Text>
      <Text variant="caption" tone="secondary" style={styles.docMeta}>
        {t('records.detail.fileMeta', {
          name: sourceDocument.originalFilename,
          size: (sourceDocument.fileSizeBytes / 1024).toFixed(1),
          mime: sourceDocument.mimeType,
        })}
      </Text>

      {!showPreview ? (
        <Button
          label={t('records.detail.viewDocument')}
          variant="secondary"
          fullWidth
          onPress={onOpenDocument}
        />
      ) : loadingDoc ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={color.action.primary} />
          <Text variant="caption" tone="secondary" style={styles.loadingDocText}>
            {t('records.detail.loadingPreview')}
          </Text>
        </View>
      ) : docError ? (
        <View style={styles.errorBox}>
          <Text variant="callout" tone="danger" align="center">
            {docError}
          </Text>
          <Button label={t('records.detail.retryViewing')} variant="secondary" onPress={onOpenDocument} />
        </View>
      ) : documentUrlInfo ? (
        <DocumentPreview
          filename={documentUrlInfo.originalFilename}
          mimeType={documentUrlInfo.mimeType}
          signedUrl={documentUrlInfo.signedUrl}
          pageCount={sourceDocument.pageCount || 1}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: space.md,
  },
  cardTitle: {
    marginBottom: space.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.md,
  },
  dateCol: {
    flex: 1,
    gap: space.xxs,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: space.xs,
  },
  infoLabel: {
    width: 120,
  },
  infoValue: {
    flex: 1,
  },
  notice: {
    marginTop: space.xxs,
    marginBottom: space.sm,
  },
  medCard: {
    marginTop: space.sm,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space.sm,
  },
  medTitleCol: {
    flex: 1,
    gap: space.xxs,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.xs,
  },
  note: {
    backgroundColor: color.bg.subtle,
    borderRadius: space.sm,
    padding: space.sm,
    marginTop: space.sm,
  },
  docMeta: {
    marginBottom: space.md,
  },
  centerBox: {
    padding: space.lg,
    alignItems: 'center',
  },
  loadingDocText: {
    marginTop: space.xs,
  },
  errorBox: {
    padding: space.md,
    borderRadius: space.md,
    backgroundColor: color.tone.danger.bg,
    alignItems: 'center',
    gap: space.sm,
  },
});
