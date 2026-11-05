import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { Card } from '../../design/components/Containers/Card';
import { Checkbox } from '../../design/components/Inputs/Checkbox';
import { ChipGroup } from '../../design/components/Inputs/ChipGroup';
import { TextField } from '../../design/components/Inputs/TextField';
import { Disclaimer } from '../../design/components/Trust/Disclaimer';
import { Text } from '../../design/components/Foundations/Text';
import { color, radius, space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { DateRangePreset, ExportDataPayload } from '../../services/reports/report-service';

// Checkbox box (22) plus the gap before its label, so helper text lines up with the label.
const CHECKBOX_LABEL_INDENT = 34;

export interface ReportExportConfigProps {
  title: string;
  onTitleChange: (next: string) => void;
  selectedPreset: DateRangePreset;
  onPresetChange: (next: DateRangePreset) => void;
  customStart: string;
  onCustomStartChange: (next: string) => void;
  customEnd: string;
  onCustomEndChange: (next: string) => void;
  onApplyCustom: () => void;
  includeTimeline: boolean;
  onIncludeTimelineChange: (next: boolean) => void;
  includeMedications: boolean;
  onIncludeMedicationsChange: (next: boolean) => void;
  loadingPreview: boolean;
  previewData: ExportDataPayload | null;
  previewError: string | null;
  generationError: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
}

// Configuration step of the export modal: title, timeframe, sections, preview and generate.
export function ReportExportConfig({
  title,
  onTitleChange,
  selectedPreset,
  onPresetChange,
  customStart,
  onCustomStartChange,
  customEnd,
  onCustomEndChange,
  onApplyCustom,
  includeTimeline,
  onIncludeTimelineChange,
  includeMedications,
  onIncludeMedicationsChange,
  loadingPreview,
  previewData,
  previewError,
  generationError,
  isGenerating,
  onGenerate,
}: ReportExportConfigProps) {
  const presetOptions: { value: DateRangePreset; label: string }[] = [
    { value: 'ALL', label: t('records.reports.presetAll') },
    { value: '30D', label: t('records.reports.preset30d') },
    { value: '90D', label: t('records.reports.preset90d') },
    { value: '1Y', label: t('records.reports.preset1y') },
    { value: 'CUSTOM', label: t('records.reports.presetCustom') },
  ];

  return (
    <View style={styles.stack}>
      <Card>
        <TextField
          label={t('records.export.reportTitleLabel')}
          value={title}
          onChangeText={onTitleChange}
          placeholder={t('records.export.titlePlaceholder')}
        />
      </Card>

      <Card style={styles.section}>
        <Text variant="title3">{t('records.export.dateRange')}</Text>
        <ChipGroup
          options={presetOptions}
          selected={[selectedPreset]}
          onChange={(next) => {
            if (next[0]) onPresetChange(next[0] as DateRangePreset);
          }}
        />

        {selectedPreset === 'CUSTOM' && (
          <View style={styles.customDates}>
            <TextField
              label={t('records.export.startLabel')}
              value={customStart}
              onChangeText={onCustomStartChange}
              placeholder={t('records.export.startPlaceholder')}
            />
            <TextField
              label={t('records.export.endLabel')}
              value={customEnd}
              onChangeText={onCustomEndChange}
              placeholder={t('records.export.endPlaceholder')}
            />
            <Button
              label={t('records.export.applyCustom')}
              variant="secondary"
              fullWidth
              onPress={onApplyCustom}
            />
          </View>
        )}
      </Card>

      <Card style={styles.section}>
        <Text variant="title3">{t('records.export.sections')}</Text>
        <View>
          <Checkbox
            label={t('records.export.timelineTitle')}
            checked={includeTimeline}
            onChange={onIncludeTimelineChange}
          />
          <Text variant="caption" tone="secondary" style={styles.checkboxHelp}>
            {t('records.export.timelineBody')}
          </Text>
        </View>
        <View>
          <Checkbox
            label={t('records.export.medsTitle')}
            checked={includeMedications}
            onChange={onIncludeMedicationsChange}
          />
          <Text variant="caption" tone="secondary" style={styles.checkboxHelp}>
            {t('records.export.medsBody')}
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="title3">{t('records.export.previewHeading')}</Text>

        {loadingPreview ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={color.action.primary} />
            <Text variant="callout" tone="secondary">
              {t('records.export.calculating')}
            </Text>
          </View>
        ) : previewError ? (
          <Text variant="body" tone="danger">
            {previewError}
          </Text>
        ) : previewData ? (
          <View style={styles.previewRows}>
            <View style={styles.previewRow}>
              <Text variant="body" tone="secondary">
                {t('records.export.scope')}
              </Text>
              <Text variant="bodyStrong">{previewData.dateRange.label}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text variant="body" tone="secondary">
                {t('records.export.timelineRow')}
              </Text>
              <Text variant="bodyStrong">
                {t('records.export.timelineCount', { count: previewData.summary.timelineEventsCount })}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text variant="body" tone="secondary">
                {t('records.export.medsRow')}
              </Text>
              <Text variant="bodyStrong">
                {t('records.export.medsCount', { count: previewData.summary.medicationsCount })}
              </Text>
            </View>

            {previewData.summary.totalRecords === 0 && (
              <View style={styles.warningBox}>
                <Text variant="caption" tone="danger">
                  {t('records.export.noEligibleTitle')}
                </Text>
                <Text variant="caption" tone="secondary">
                  {t('records.export.noEligibleBody')}
                </Text>
              </View>
            )}
          </View>
        ) : null}
      </Card>

      <Disclaimer text={t('records.export.integrity')} />

      {generationError && (
        <View style={styles.errorBox}>
          <Text variant="body" tone="danger">
            {generationError}
          </Text>
        </View>
      )}

      <Button
        label={isGenerating ? t('records.export.generating') : t('records.export.generate')}
        variant="primary"
        fullWidth
        loading={isGenerating}
        disabled={isGenerating || previewData?.summary.totalRecords === 0}
        onPress={onGenerate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space.md,
    paddingBottom: space.xl,
  },
  section: {
    gap: space.sm,
  },
  customDates: {
    gap: space.sm,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border.subtle,
  },
  checkboxHelp: {
    paddingLeft: CHECKBOX_LABEL_INDENT,
    marginTop: space.xxs,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xs,
  },
  previewRows: {
    gap: space.xs,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  warningBox: {
    marginTop: space.sm,
    padding: space.sm,
    gap: space.xxs,
    borderRadius: radius.md,
    backgroundColor: color.tone.danger.bg,
  },
  errorBox: {
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: color.tone.danger.bg,
  },
});
