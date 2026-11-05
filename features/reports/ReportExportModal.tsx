import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Linking, Modal, ScrollView, Share, StyleSheet, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { IconButton } from '../../design/components/Actions/IconButton';
import { Text } from '../../design/components/Foundations/Text';
import { color, space } from '../../design/tokens';
import { t } from '../../design/strings';
import {
  DateRangePreset,
  ReportConfig,
  ExportDataPayload,
  GeneratedReportResult,
  calculateDateRange,
  reportService,
} from '../../services/reports/report-service';
import { ReportExportConfig } from './ReportExportConfig';
import { ReportExportResult } from './ReportExportResult';

export interface ReportExportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  visible,
  onClose,
}) => {
  // Config state
  const [title, setTitle] = useState<string>(t('records.reports.defaultTitle'));
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('ALL');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [includeTimeline, setIncludeTimeline] = useState<boolean>(true);
  const [includeMedications, setIncludeMedications] = useState<boolean>(true);

  // Preview state
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<ExportDataPayload | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReportResult | null>(null);

  // Build current ReportConfig
  const getActiveConfig = useCallback((): ReportConfig => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (selectedPreset === 'CUSTOM') {
      startDate = customStart.trim() || undefined;
      endDate = customEnd.trim() || undefined;
    } else {
      const dates = calculateDateRange(selectedPreset);
      startDate = dates.startDate;
      endDate = dates.endDate;
    }

    return {
      title: title.trim() || t('records.reports.defaultTitle'),
      startDate,
      endDate,
      includeTimeline,
      includeMedications,
      allowEmpty: false,
    };
  }, [title, selectedPreset, customStart, customEnd, includeTimeline, includeMedications]);

  // Load preview data when visible and filters change
  const loadPreview = useCallback(async () => {
    if (!visible) return;
    setLoadingPreview(true);
    setPreviewError(null);

    try {
      const config = getActiveConfig();
      const data = await reportService.fetchExportData(config);
      setPreviewData(data);
    } catch (err: any) {
      setPreviewError(err?.message || t('records.export.previewError'));
      setPreviewData(null);
    } finally {
      setLoadingPreview(false);
    }
  }, [visible, getActiveConfig]);

  useEffect(() => {
    if (visible) {
      loadPreview();
    } else {
      // Reset state on close
      setGeneratedReport(null);
      setGenerationError(null);
      setPreviewError(null);
    }
  }, [visible, selectedPreset, includeTimeline, includeMedications]);

  // Trigger report generation
  const handleGenerate = async () => {
    if (!includeTimeline && !includeMedications) {
      Alert.alert(
        t('records.export.sectionRequiredTitle'),
        t('records.export.sectionRequiredBody')
      );
      return;
    }

    if (previewData && previewData.summary.totalRecords === 0) {
      Alert.alert(
        t('records.export.noRecordsTitle'),
        t('records.export.noRecordsBody')
      );
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const config = getActiveConfig();
      const result = await reportService.generateReport(config);
      setGeneratedReport(result);
    } catch (err: any) {
      setGenerationError(err?.message || t('records.export.generateError'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Share report via platform Share sheet (genuine native PDF file sharing with fallback)
  const handleShareReport = async () => {
    if (!generatedReport) return;

    try {
      const isSharingAvailable = await Sharing.isAvailableAsync().catch(() => false);

      if (isSharingAvailable && FileSystem.cacheDirectory) {
        const tempFilename = generatedReport.filename || `medical-report-${Date.now()}.pdf`;
        const tempUri = `${FileSystem.cacheDirectory}${tempFilename}`;

        if (generatedReport.pdfBase64) {
          await FileSystem.writeAsStringAsync(tempUri, generatedReport.pdfBase64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          await FileSystem.downloadAsync(generatedReport.downloadUrl, tempUri);
        }

        try {
          await Sharing.shareAsync(tempUri, {
            mimeType: 'application/pdf',
            dialogTitle: generatedReport.title,
            UTI: 'com.adobe.pdf',
          });
        } finally {
          // Clean up temporary local file after sharing
          await FileSystem.deleteAsync(tempUri, { idempotent: true }).catch(() => {});
        }
      } else {
        // Fallback for environments where native file sharing module is unavailable (e.g. web)
        await Share.share({
          title: generatedReport.title,
          message: t('records.export.shareMessage', {
            title: generatedReport.title,
            total: generatedReport.summary.totalRecords,
            events: generatedReport.summary.timelineEventsCount,
            meds: generatedReport.summary.medicationsCount,
            date: new Date(generatedReport.generatedAt).toLocaleDateString(),
            url: generatedReport.downloadUrl,
          }),
          url: generatedReport.downloadUrl,
        });
      }
    } catch (err: any) {
      Alert.alert(
        t('records.export.shareErrorTitle'),
        err?.message || t('records.export.shareFallbackError')
      );
    }
  };

  // Open PDF in browser or viewer
  const handlePreviewPdf = async () => {
    if (!generatedReport?.downloadUrl) return;

    try {
      const supported = await Linking.canOpenURL(generatedReport.downloadUrl);
      if (supported) {
        await Linking.openURL(generatedReport.downloadUrl);
      } else {
        Alert.alert(t('records.export.viewerErrorTitle'), t('records.export.cannotOpen'));
      }
    } catch (err: any) {
      Alert.alert(
        t('records.export.viewerErrorTitle'),
        err?.message || t('records.export.openError')
      );
    }
  };

  const handleResetAndClose = () => {
    setGeneratedReport(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleResetAndClose}>
      <View style={styles.container}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <View style={styles.headerText}>
            <Text variant="title2">{t('records.export.title')}</Text>
            <Text variant="caption" tone="secondary">
              {t('records.export.subtitle')}
            </Text>
          </View>
          <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={handleResetAndClose} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {generatedReport ? (
            <ReportExportResult
              report={generatedReport}
              onShare={handleShareReport}
              onOpenPdf={handlePreviewPdf}
              onDone={handleResetAndClose}
            />
          ) : (
            <ReportExportConfig
              title={title}
              onTitleChange={setTitle}
              selectedPreset={selectedPreset}
              onPresetChange={setSelectedPreset}
              customStart={customStart}
              onCustomStartChange={setCustomStart}
              customEnd={customEnd}
              onCustomEndChange={setCustomEnd}
              onApplyCustom={loadPreview}
              includeTimeline={includeTimeline}
              onIncludeTimelineChange={setIncludeTimeline}
              includeMedications={includeMedications}
              onIncludeMedicationsChange={setIncludeMedications}
              loadingPreview={loadingPreview}
              previewData={previewData}
              previewError={previewError}
              generationError={generationError}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg.screen,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.md,
    backgroundColor: color.bg.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.border.subtle,
  },
  headerText: {
    flex: 1,
    gap: space.xxs,
  },
  scrollContent: {
    padding: space.lg,
  },
});
