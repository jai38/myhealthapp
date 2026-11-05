import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../design/components/Containers/Card';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { ExportDataPayload } from '../../services/reports/report-service';

export interface ReportsMetricsProps {
  loading: boolean;
  previewData: ExportDataPayload | null;
}

// Three summary tiles above the export card. Counts come from the preview payload.
export function ReportsMetrics({ loading, previewData }: ReportsMetricsProps) {
  return (
    <View style={styles.row}>
      <Card style={styles.tile}>
        <Text variant="title3" align="center">
          {loading ? t('records.reports.loadingValue') : previewData?.summary.timelineEventsCount ?? 0}
        </Text>
        <Text variant="caption" tone="secondary" align="center">
          {t('records.reports.metricEvents')}
        </Text>
      </Card>
      <Card style={styles.tile}>
        <Text variant="title3" align="center">
          {loading ? t('records.reports.loadingValue') : previewData?.summary.medicationsCount ?? 0}
        </Text>
        <Text variant="caption" tone="secondary" align="center">
          {t('records.reports.metricMeds')}
        </Text>
      </Card>
      <Card style={styles.tile}>
        <Icon name="lock-closed-outline" size="md" tone="primary" />
        <Text variant="caption" align="center">
          {t('records.reports.encrypted')}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.sm,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
    paddingVertical: space.md,
    paddingHorizontal: space.xs,
  },
});
