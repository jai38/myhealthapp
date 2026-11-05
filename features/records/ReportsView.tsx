import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Card } from '../../design/components/Containers/Card';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { color, radius, space } from '../../design/tokens';
import { t } from '../../design/strings';
import {
  DateRangePreset,
  ReportConfig,
  ExportDataPayload,
  calculateDateRange,
  reportService,
} from '../../services/reports/report-service';
import { ReportExportModal } from '../../features/reports/ReportExportModal';
import { authService } from '../../services/auth/auth-service';
import { ReportsHero } from './ReportsHero';
import { ReportsMetrics } from './ReportsMetrics';
import { ReportsVault } from './ReportsVault';

// The Records tab header and safe area are provided by RecordsScreen, so this view has no title of its own.
export default function ReportsView() {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('ALL');
  const [loadingPreview, setLoadingPreview] = useState<boolean>(true);
  const [previewData, setPreviewData] = useState<ExportDataPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadingPreview(true);
    setDownloadSuccessMessage(null);
    try {
      const dates = calculateDateRange(selectedPreset);
      const config: ReportConfig = {
        title: t('records.reports.defaultTitle'),
        startDate: dates.startDate,
        endDate: dates.endDate,
        includeTimeline: true,
        includeMedications: true,
        allowEmpty: false,
      };
      const data = await reportService.fetchExportData(config);
      setPreviewData(data);
    } catch {
      setPreviewData(null);
    } finally {
      setLoadingPreview(false);
    }
  }, [selectedPreset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = authService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  const handleQuickExport = async () => {
    setIsGenerating(true);
    setDownloadSuccessMessage(null);

    try {
      const dates = calculateDateRange(selectedPreset);
      const config: ReportConfig = {
        title: t('records.reports.quickTitle'),
        startDate: dates.startDate,
        endDate: dates.endDate,
        includeTimeline: true,
        includeMedications: true,
        allowEmpty: false,
      };

      const result = await reportService.generateReport(config);

      // Web platform direct download handling
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.setAttribute('download', result.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadSuccessMessage(t('records.reports.downloaded', { filename: result.filename }));
        return;
      }

      // Native mobile sharing
      const localFileUri = `${FileSystem.cacheDirectory}${result.filename}`;
      const downloadResult = await FileSystem.downloadAsync(result.downloadUrl, localFileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: t('records.reports.shareDialogTitle'),
          UTI: 'com.adobe.pdf',
        });
        setDownloadSuccessMessage(t('records.reports.shared'));
      } else {
        Alert.alert(
          t('records.reports.downloadCompleteTitle'),
          t('records.reports.savedToDevice', { filename: result.filename }),
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('records.reports.pdfError');
      Alert.alert(t('records.reports.exportNoticeTitle'), msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          {downloadSuccessMessage ? (
            <View style={styles.successBanner}>
              <Icon name="checkmark" size="sm" tone="success" />
              <Text variant="caption" style={styles.successText}>
                {downloadSuccessMessage}
              </Text>
            </View>
          ) : null}

          <ReportsMetrics loading={loadingPreview} previewData={previewData} />

          <ReportsHero
            selectedPreset={selectedPreset}
            onSelectPreset={setSelectedPreset}
            loadingPreview={loadingPreview}
            isGenerating={isGenerating}
            onQuickExport={handleQuickExport}
            onOpenAdvanced={() => setExportModalVisible(true)}
          />

          <ReportsVault loading={loadingPreview} previewData={previewData} />

          <Card>
            <View style={styles.privacyRow}>
              <Icon name="lock-closed-outline" size="md" tone="primary" />
              <View style={styles.privacyText}>
                <Text variant="bodyStrong">{t('records.reports.privacyTitle')}</Text>
                <Text variant="caption" tone="secondary">
                  {t('records.reports.privacyBody')}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Advanced Customization Modal */}
      <ReportExportModal
        visible={exportModalVisible}
        onClose={() => {
          setExportModalVisible(false);
          loadData();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  column: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    gap: space.md,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.tone.success.bg,
    borderRadius: radius.md,
    padding: space.md,
  },
  successText: {
    flexShrink: 1,
    color: color.tone.success.fg,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  privacyText: {
    flex: 1,
    gap: space.xxs,
  },
});
