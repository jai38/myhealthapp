import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Linking,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/index';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import {
  DateRangePreset,
  ReportConfig,
  ExportDataPayload,
  GeneratedReportResult,
  calculateDateRange,
  reportService,
} from '../../services/reports/report-service';

export interface ReportExportModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRESET_OPTIONS: Array<{ label: string; value: DateRangePreset }> = [
  { label: 'All Time', value: 'ALL' },
  { label: 'Last 30 Days', value: '30D' },
  { label: 'Last 3 Months', value: '90D' },
  { label: 'Last 1 Year', value: '1Y' },
  { label: 'Custom', value: 'CUSTOM' },
];

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  visible,
  onClose,
}) => {
  // Config state
  const [title, setTitle] = useState<string>('Medical Summary Report');
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
      title: title.trim() || 'Medical Summary Report',
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
      setPreviewError(err?.message || 'Unable to calculate eligible records for this date range');
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
      Alert.alert('Section Required', 'Please select at least one section to include in the report.');
      return;
    }

    if (previewData && previewData.summary.totalRecords === 0) {
      Alert.alert(
        'No Records to Export',
        'No eligible medical records were found in the selected range. Please adjust your date range or section selection.'
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
      setGenerationError(err?.message || 'Failed to generate medical report. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Share report via platform Share sheet
  const handleShareReport = async () => {
    if (!generatedReport) return;

    try {
      await Share.share({
        title: generatedReport.title,
        message: `My Health App -- ${generatedReport.title}\n` +
          `Verified Records: ${generatedReport.summary.totalRecords} (Events: ${generatedReport.summary.timelineEventsCount}, Medications: ${generatedReport.summary.medicationsCount})\n` +
          `Generated: ${new Date(generatedReport.generatedAt).toLocaleDateString()}\n` +
          `Secure document access: ${generatedReport.downloadUrl}`,
        url: generatedReport.downloadUrl,
      });
    } catch (err: any) {
      Alert.alert('Sharing Error', err?.message || 'Could not open system share sheet.');
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
        Alert.alert('Viewer Error', 'Cannot open download link in default browser.');
      }
    } catch (err: any) {
      Alert.alert('Viewer Error', err?.message || 'Could not open PDF URL.');
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
          <View>
            <Text style={typography.h2}>Medical Report Export</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Confidential, doctor-ready PDF summary of verified records
            </Text>
          </View>
          <TouchableOpacity onPress={handleResetAndClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* STEP 1: REPORT COMPLETED VIEW */}
          {generatedReport ? (
            <View style={styles.resultContainer}>
              <Card variant="elevated" style={styles.successCard}>
                <View style={styles.successHeader}>
                  <Badge label="Report Generated" variant="success" />
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {new Date(generatedReport.generatedAt).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={[typography.h3, styles.reportTitleText]}>
                  {generatedReport.title}
                </Text>
                <Text style={[typography.bodyMuted, styles.reportFilename]}>
                  {generatedReport.filename}
                </Text>

                <View style={styles.summaryStatsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{generatedReport.summary.timelineEventsCount}</Text>
                    <Text style={styles.statLabel}>Timeline Events</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{generatedReport.summary.medicationsCount}</Text>
                    <Text style={styles.statLabel}>Medications</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{generatedReport.pageCount}</Text>
                    <Text style={styles.statLabel}>PDF Pages</Text>
                  </View>
                </View>

                <View style={styles.fileSizeInfo}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Document Size: {(generatedReport.fileSizeBytes / 1024).toFixed(1)} KB | Private S3 Storage
                  </Text>
                </View>

                {/* Primary Action: System Share Sheet */}
                <Button
                  title="Share Report"
                  variant="primary"
                  onPress={handleShareReport}
                  style={styles.actionBtn}
                />

                {/* Secondary Action: View in Browser / PDF viewer */}
                <Button
                  title="View / Open PDF"
                  variant="outline"
                  onPress={handlePreviewPdf}
                  style={styles.actionBtn}
                />

                {/* Return */}
                <Button
                  title="Done"
                  variant="secondary"
                  onPress={handleResetAndClose}
                  style={styles.actionBtn}
                />
              </Card>

              <Card variant="muted" style={styles.privacyNoticeCard}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Privacy & Provenance Notice: The generated report contains patient-verified health data.
                  Sharing transmits this data via your device's normal share dialog. Keep this document secure.
                </Text>
              </Card>
            </View>
          ) : (
            /* STEP 2: CONFIGURATION VIEW */
            <View>
              {/* Title Input */}
              <Card style={styles.sectionCard}>
                <Text style={[typography.h3, styles.sectionTitle]}>Report Title</Text>
                <Input
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Annual Medical Summary"
                  containerStyle={styles.titleInput}
                />
              </Card>

              {/* Date Range Presets */}
              <Card style={styles.sectionCard}>
                <Text style={[typography.h3, styles.sectionTitle]}>Date Range</Text>
                <View style={styles.presetsRow}>
                  {PRESET_OPTIONS.map((opt) => {
                    const isSelected = selectedPreset === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                        onPress={() => setSelectedPreset(opt.value)}
                      >
                        <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Date Inputs if CUSTOM selected */}
                {selectedPreset === 'CUSTOM' && (
                  <View style={styles.customDateContainer}>
                    <View style={styles.dateInputCol}>
                      <Text style={[typography.caption, styles.dateLabel]}>Start Date (YYYY-MM-DD)</Text>
                      <Input
                        value={customStart}
                        onChangeText={setCustomStart}
                        placeholder="2026-01-01"
                      />
                    </View>
                    <View style={styles.dateInputCol}>
                      <Text style={[typography.caption, styles.dateLabel]}>End Date (YYYY-MM-DD)</Text>
                      <Input
                        value={customEnd}
                        onChangeText={setCustomEnd}
                        placeholder="2026-10-12"
                      />
                    </View>
                    <Button
                      title="Apply Custom Dates"
                      variant="outline"
                      onPress={loadPreview}
                      style={{ marginTop: spacing.sm }}
                    />
                  </View>
                )}
              </Card>

              {/* Section Inclusions */}
              <Card style={styles.sectionCard}>
                <Text style={[typography.h3, styles.sectionTitle]}>Included Sections</Text>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.8}
                  onPress={() => setIncludeTimeline((prev) => !prev)}
                >
                  <View style={[styles.checkboxBox, includeTimeline && styles.checkboxBoxChecked]}>
                    {includeTimeline && <Text style={styles.checkmarkText}>✓</Text>}
                  </View>
                  <View style={styles.checkboxLabelContainer}>
                    <Text style={typography.body}>Verified Medical Timeline Events</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Chronological consultations, prescriptions, and diagnostics
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.8}
                  onPress={() => setIncludeMedications((prev) => !prev)}
                >
                  <View style={[styles.checkboxBox, includeMedications && styles.checkboxBoxChecked]}>
                    {includeMedications && <Text style={styles.checkmarkText}>✓</Text>}
                  </View>
                  <View style={styles.checkboxLabelContainer}>
                    <Text style={typography.body}>Medications & Regimens</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Active, past, and prescribed medicines with instructions
                    </Text>
                  </View>
                </TouchableOpacity>
              </Card>

              {/* Live Preview / Eligibility Summary */}
              <Card variant="muted" style={styles.previewCard}>
                <Text style={[typography.h3, styles.previewHeading]}>Report Preview Summary</Text>

                {loadingPreview ? (
                  <View style={styles.previewLoadingRow}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[typography.bodyMuted, { marginLeft: spacing.sm }]}>
                      Calculating eligible records...
                    </Text>
                  </View>
                ) : previewError ? (
                  <Text style={[typography.body, { color: colors.danger }]}>{previewError}</Text>
                ) : previewData ? (
                  <View>
                    <View style={styles.previewStatsRow}>
                      <Text style={typography.body}>Scope Period:</Text>
                      <Text style={[typography.body, { fontWeight: '600' }]}>
                        {previewData.dateRange.label}
                      </Text>
                    </View>
                    <View style={styles.previewStatsRow}>
                      <Text style={typography.body}>Timeline Events:</Text>
                      <Text style={[typography.body, { fontWeight: '600' }]}>
                        {previewData.summary.timelineEventsCount} record(s)
                      </Text>
                    </View>
                    <View style={styles.previewStatsRow}>
                      <Text style={typography.body}>Medication Regimens:</Text>
                      <Text style={[typography.body, { fontWeight: '600' }]}>
                        {previewData.summary.medicationsCount} regimen(s)
                      </Text>
                    </View>

                    {previewData.summary.totalRecords === 0 && (
                      <View style={styles.emptyWarningBox}>
                        <Text style={[typography.caption, { color: colors.danger, fontWeight: '600' }]}>
                          No eligible verified records found for this period.
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                          Try selecting "All Time" or enabling both sections to include records.
                        </Text>
                      </View>
                    )}
                  </View>
                ) : null}
              </Card>

              {/* Clinical & Safety Disclaimer */}
              <Card variant="muted" style={styles.disclaimerCard}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Medical Data Integrity: This export compiles your confirmed records for sharing with your
                  healthcare provider. It does not provide medical advice, infer diagnoses, or alter your active
                  medications.
                </Text>
              </Card>

              {generationError && (
                <View style={styles.errorBox}>
                  <Text style={[typography.body, { color: colors.danger }]}>{generationError}</Text>
                </View>
              )}

              {/* Generate Button */}
              <View style={styles.buttonContainer}>
                <Button
                  title={isGenerating ? 'Generating PDF...' : 'Generate PDF Report'}
                  variant="primary"
                  isLoading={isGenerating}
                  disabled={isGenerating || (previewData?.summary.totalRecords === 0)}
                  onPress={handleGenerate}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.xs,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  titleInput: {
    marginBottom: 0,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  presetChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  presetChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  presetTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  customDateContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateInputCol: {
    marginBottom: spacing.xs,
  },
  dateLabel: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
    backgroundColor: colors.surface,
  },
  checkboxBoxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  previewCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  previewHeading: {
    marginBottom: spacing.sm,
  },
  previewLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  previewStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  emptyWarningBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#fef2f2',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  disclaimerCard: {
    marginBottom: spacing.md,
  },
  errorBox: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: '#fef2f2',
    borderRadius: borderRadius.md,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
  resultContainer: {
    paddingTop: spacing.sm,
  },
  successCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  successHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reportTitleText: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  reportFilename: {
    marginBottom: spacing.md,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fileSizeInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  actionBtn: {
    marginBottom: spacing.sm,
  },
  privacyNoticeCard: {
    marginBottom: spacing.xl,
  },
});
