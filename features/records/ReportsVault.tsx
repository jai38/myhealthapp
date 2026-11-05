import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Card } from '../../design/components/Containers/Card';
import { IconTile } from '../../design/components/Containers/IconTile';
import { ListGroup } from '../../design/components/Containers/ListGroup';
import { ListRow } from '../../design/components/Containers/ListRow';
import { Text } from '../../design/components/Foundations/Text';
import { VerificationLabel } from '../../design/components/Trust/VerificationLabel';
import { color, space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { ExportDataPayload } from '../../services/reports/report-service';

export interface ReportsVaultProps {
  loading: boolean;
  previewData: ExportDataPayload | null;
}

// Verified timeline events for the selected timeframe, with loading and empty states.
export function ReportsVault({ loading, previewData }: ReportsVaultProps) {
  return (
    <View style={styles.root}>
      <View style={styles.heading}>
        <Text variant="title3">{t('records.reports.vaultTitle')}</Text>
        <Text variant="caption" tone="tertiary">
          {t('records.reports.vaultBody')}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={color.action.primary} />
          <Text variant="caption" tone="secondary">
            {t('records.reports.vaultLoading')}
          </Text>
        </View>
      ) : previewData && previewData.timelineEvents && previewData.timelineEvents.length > 0 ? (
        <ListGroup>
          {previewData.timelineEvents.map((event, idx) => {
            const date = new Date(event.eventDate).toLocaleDateString();
            const meta = event.prescription?.doctorName
              ? t('records.reports.recordMeta', { date, doctor: event.prescription.doctorName })
              : t('records.reports.recordDate', { date });
            return (
              <ListRow
                key={event.id || idx}
                title={event.title}
                subtitle={meta}
                leading={<IconTile icon="clipboard" tone="blue" />}
                trailing={<VerificationLabel verified />}
              />
            );
          })}
        </ListGroup>
      ) : (
        <Card>
          <Text variant="callout" tone="secondary" align="center">
            {t('records.reports.vaultEmpty')}
          </Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.sm,
  },
  heading: {
    gap: space.xxs,
  },
  loading: {
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.md,
  },
});
