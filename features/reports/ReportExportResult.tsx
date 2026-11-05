import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { Card } from '../../design/components/Containers/Card';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { color, radius, space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { GeneratedReportResult } from '../../services/reports/report-service';

export interface ReportExportResultProps {
  report: GeneratedReportResult;
  onShare: () => void;
  onOpenPdf: () => void;
  onDone: () => void;
}

// Result step of the export modal: the generated report and its share and open actions.
export function ReportExportResult({ report, onShare, onOpenPdf, onDone }: ReportExportResultProps) {
  return (
    <View style={styles.stack}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Icon name="checkmark" size="sm" tone="success" />
            <Text variant="caption" style={{ color: color.tone.success.fg }}>
              {t('records.export.generated')}
            </Text>
          </View>
          <Text variant="caption" tone="tertiary">
            {new Date(report.generatedAt).toLocaleDateString()}
          </Text>
        </View>

        <Text variant="title2">{report.title}</Text>
        <Text variant="caption" tone="secondary">
          {report.filename}
        </Text>

        <View style={styles.stats}>
          <Stat value={report.summary.timelineEventsCount} label={t('records.export.statEvents')} />
          <Stat value={report.summary.medicationsCount} label={t('records.export.statMeds')} />
          <Stat value={report.pageCount} label={t('records.export.statPages')} />
        </View>

        <Text variant="caption" tone="secondary" align="center">
          {t('records.export.size', { kb: (report.fileSizeBytes / 1024).toFixed(1) })}
        </Text>

        <View style={styles.actions}>
          <Button label={t('records.export.share')} variant="primary" fullWidth onPress={onShare} />
          <Button label={t('records.export.openPdf')} variant="secondary" fullWidth onPress={onOpenPdf} />
          <Button label={t('common.done')} variant="text" fullWidth onPress={onDone} />
        </View>
      </Card>

      <Card>
        <Text variant="caption" tone="secondary">
          {t('records.export.privacyNotice')}
        </Text>
      </Card>
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="title3" align="center">
        {value}
      </Text>
      <Text variant="caption" tone="secondary" align="center">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space.md,
    paddingBottom: space.xl,
  },
  card: {
    gap: space.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.xxs + 2,
    paddingHorizontal: space.sm,
    borderRadius: radius.full,
    backgroundColor: color.tone.success.bg,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.border.subtle,
  },
  stat: {
    alignItems: 'center',
    gap: space.xxs,
  },
  actions: {
    gap: space.xs,
    marginTop: space.xs,
  },
});
