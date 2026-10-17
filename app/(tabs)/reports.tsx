import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { colors, spacing, typography, borderRadius } from '../../theme/index';
import {
  DateRangePreset,
  ReportConfig,
  ExportDataPayload,
  calculateDateRange,
  reportService,
} from '../../services/reports/report-service';
import { ReportExportModal } from '../../features/reports/ReportExportModal';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const PRESET_OPTIONS: Array<{ label: string; value: DateRangePreset }> = [
  { label: 'All Time', value: 'ALL' },
  { label: 'Last 30 Days', value: '30D' },
  { label: 'Last 3 Months', value: '90D' },
  { label: 'Last 1 Year', value: '1Y' },
];

export default function ReportsScreen() {
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
        title: 'Medical Summary Report',
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

  const handleQuickExport = async () => {
    setIsGenerating(true);
    setDownloadSuccessMessage(null);

    try {
      const dates = calculateDateRange(selectedPreset);
      const config: ReportConfig = {
        title: 'Patient Medical Summary Report',
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
        setDownloadSuccessMessage(`Report downloaded: ${result.filename}`);
        return;
      }

      // Native mobile sharing
      const localFileUri = `${FileSystem.cacheDirectory}${result.filename}`;
      const downloadResult = await FileSystem.downloadAsync(result.downloadUrl, localFileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Doctor-Ready Medical Report',
          UTI: 'com.adobe.pdf',
        });
        setDownloadSuccessMessage('Medical report ready to share with your doctor.');
      } else {
        Alert.alert('Download Complete', `Report saved to device: ${result.filename}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to generate PDF report';
      Alert.alert('Export Notice', msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={typography.h2}>Medical Reports & Export</Text>
          <Text style={[typography.bodyMuted, styles.subHeader]}>
            Doctor-ready summaries, clinical records, and secure PDF exports.
          </Text>
        </View>

        {downloadSuccessMessage && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ {downloadSuccessMessage}</Text>
          </View>
        )}

        {/* Hero Card: Doctor-Ready Summary */}
        <Card style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={{ flex: 1 }}>
              <Text style={typography.h3}>Doctor-Ready Medical Summary</Text>
              <Text style={[typography.bodyMuted, { marginTop: 2, fontSize: 13 }]}>
                Verified clinical history and active medication courses compiled for clinical consultations or hospital visits.
              </Text>
            </View>
            <Badge label="Doctor Ready" variant="success" />
          </View>

          {/* Date Range Chips */}
          <View style={styles.filterSection}>
            <Text style={[typography.caption, { fontWeight: '600', marginBottom: spacing.xs }]}>
              SELECT REPORTING TIMEFRAME:
            </Text>
            <View style={styles.chipRow}>
              {PRESET_OPTIONS.map((opt) => {
                const isSelected = selectedPreset === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setSelectedPreset(opt.value)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Records Summary Pill */}
          <View style={styles.summaryBar}>
            {loadingPreview ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : previewData ? (
              <Text style={styles.summaryBarText}>
                Includes: <Text style={{ fontWeight: '700' }}>{previewData.summary.timelineEventsCount} Verified Event(s)</Text> • <Text style={{ fontWeight: '700' }}>{previewData.summary.medicationsCount} Medication(s)</Text>
              </Text>
            ) : (
              <Text style={styles.summaryBarText}>No verified records in this timeframe</Text>
            )}
          </View>

          {/* Action Buttons */}
          <Button
            title={isGenerating ? 'Compiling Medical PDF...' : '📄 Download & Share Medical Summary (PDF)'}
            variant="primary"
            onPress={handleQuickExport}
            disabled={isGenerating || loadingPreview}
            style={styles.exportButton}
          />

          <Button
            title="⚙️ Advanced Report Options & Custom Preview"
            variant="outline"
            onPress={() => setExportModalVisible(true)}
            disabled={isGenerating}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        {/* Verified Encounters Preview */}
        {previewData && previewData.timelineEvents && previewData.timelineEvents.length > 0 && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={typography.h3}>Verified Clinical Records Included</Text>
              <Badge label={`${previewData.timelineEvents.length} Documents`} variant="info" />
            </View>
            <Text style={[typography.bodyMuted, { marginBottom: spacing.sm, fontSize: 13 }]}>
              The following patient-reviewed clinical encounters are included in your generated report:
            </Text>

            {previewData.timelineEvents.map((event, idx) => (
              <View key={event.id || idx} style={styles.eventItem}>
                <View style={styles.checkIconCol}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={[typography.body, { fontWeight: '600' }]}>{event.title}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Date: {new Date(event.eventDate).toLocaleDateString()}
                    {event.prescription?.doctorName ? ` • Clinician: Dr. ${event.prescription.doctorName}` : ''}
                  </Text>
                </View>
                <Badge label="Verified" variant="neutral" />
              </View>
            ))}
          </Card>
        )}

        {/* Clinical Privacy Guarantee */}
        <Card variant="muted" style={styles.privacyCard}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            🛡️ <Text style={{ fontWeight: '700' }}>Clinical Integrity Standard:</Text> Unreviewed AI extraction drafts are strictly excluded from all medical summary reports. Only patient-reviewed and confirmed records appear in exports.
          </Text>
        </Card>
      </ScrollView>

      {/* Advanced Customization Modal */}
      <ReportExportModal
        visible={exportModalVisible}
        onClose={() => {
          setExportModalVisible(false);
          loadData();
        }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: spacing.md,
  },
  subHeader: {
    marginTop: spacing.xs,
  },
  successBanner: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  successText: {
    color: '#065f46',
    fontWeight: '600',
    fontSize: 13,
  },
  heroCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderColor: colors.primaryLight,
    borderWidth: 1.5,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  filterSection: {
    marginVertical: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  summaryBar: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  summaryBarText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  exportButton: {
    marginTop: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkIconCol: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkIcon: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 12,
  },
  eventDetails: {
    flex: 1,
    marginRight: spacing.sm,
  },
  privacyCard: {
    marginVertical: spacing.sm,
    padding: spacing.md,
  },
});
