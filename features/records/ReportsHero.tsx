import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { Card } from '../../design/components/Containers/Card';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { ChipGroup } from '../../design/components/Inputs/ChipGroup';
import { color, radius, space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { DateRangePreset } from '../../services/reports/report-service';

export interface ReportsHeroProps {
  selectedPreset: DateRangePreset;
  onSelectPreset: (preset: DateRangePreset) => void;
  loadingPreview: boolean;
  isGenerating: boolean;
  onQuickExport: () => void;
  onOpenAdvanced: () => void;
}

// The main export card: timeframe choice and the two export actions.
export function ReportsHero({
  selectedPreset,
  onSelectPreset,
  loadingPreview,
  isGenerating,
  onQuickExport,
  onOpenAdvanced,
}: ReportsHeroProps) {
  const presetOptions: { value: DateRangePreset; label: string }[] = [
    { value: 'ALL', label: t('records.reports.presetAll') },
    { value: '30D', label: t('records.reports.preset30d') },
    { value: '90D', label: t('records.reports.preset90d') },
    { value: '1Y', label: t('records.reports.preset1y') },
  ];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.pill, { backgroundColor: color.tone.info.bg }]}>
          <Icon name="medkit-outline" size="sm" tone="info" />
          <Text variant="overline" style={{ color: color.tone.info.fg }}>
            {t('records.reports.heroBadge')}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: color.tone.neutral.bg }]}>
          <Text variant="caption" tone="secondary">
            {t('records.reports.clinicalPdf')}
          </Text>
        </View>
      </View>

      <Text variant="title2">{t('records.reports.heroTitle')}</Text>
      <Text variant="callout" tone="secondary">
        {t('records.reports.heroBody')}
      </Text>

      <ChipGroup
        label={t('records.reports.timeframe')}
        options={presetOptions}
        selected={[selectedPreset]}
        onChange={(next) => {
          if (next[0]) onSelectPreset(next[0] as DateRangePreset);
        }}
      />

      <View style={styles.actions}>
        <Button
          label={t('records.reports.downloadShare')}
          icon="document-text-outline"
          variant="primary"
          fullWidth
          loading={isGenerating}
          disabled={isGenerating || loadingPreview}
          onPress={onQuickExport}
        />
        <Button
          label={t('records.reports.advanced')}
          variant="text"
          fullWidth
          disabled={isGenerating}
          onPress={onOpenAdvanced}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.xxs + 2,
    paddingHorizontal: space.sm,
    borderRadius: radius.full,
  },
  actions: {
    gap: space.xs,
  },
});
