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
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/index';
import {
  DateRangePreset,
  ReportConfig,
  ExportDataPayload,
  calculateDateRange,
  reportService,
} from '../../services/reports/report-service';
import { ReportExportModal } from '../../features/reports/ReportExportModal';
import { authService } from '../../services/auth/auth-service';
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
          <Text style={styles.pageTitle}>Health Records & Reports 📄</Text>
          <Text style={styles.pageSubHeader}>
            Doctor-ready summaries, verified health documents, and clinical history.
          </Text>
        </View>

        {downloadSuccessMessage && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ {downloadSuccessMessage}</Text>
          </View>
        )}

        {/* Top Vault Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>
              {loadingPreview ? '...' : previewData?.summary.timelineEventsCount ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Verified Events</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>
              {loadingPreview ? '...' : previewData?.summary.medicationsCount ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Active Meds</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardHighlight]}>
            <Text style={styles.metricHighlightIcon}>🔒</Text>
            <Text style={styles.metricHighlightText}>100% Encrypted</Text>
          </View>
        </View>

        {/* 1. HERO CARD: Doctor-Ready Medical Summary */}
        <View style={styles.heroSummaryCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeIcon}>🩺</Text>
              <Text style={styles.heroBadgeText}>DOCTOR-READY EXPORT</Text>
            </View>
            <Badge label="Clinical PDF" variant="neutral" />
          </View>

          <Text style={styles.heroTitle}>Comprehensive Medical Summary</Text>
          <Text style={styles.heroSubtitle}>
            Compile verified diagnoses, doctor notes, and active medication courses into a clean, printable PDF ready for consultations.
          </Text>

          {/* Date Range Chips */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>SELECT REPORT TIMEFRAME:</Text>
            <View style={styles.chipRow}>
              {PRESET_OPTIONS.map((opt) => {
                const isSelected = selectedPreset === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setSelectedPreset(opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.exportBtnPrimary, (isGenerating || loadingPreview) && { opacity: 0.7 }]}
            onPress={handleQuickExport}
            disabled={isGenerating || loadingPreview}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.exportBtnPrimaryText}>
                📄 Download & Share Medical PDF
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportBtnSecondary}
            onPress={() => setExportModalVisible(true)}
            disabled={isGenerating}
            activeOpacity={0.7}
          >
            <Text style={styles.exportBtnSecondaryText}>
              ⚙️ Advanced Export Options & Preview
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. VERIFIED CLINICAL RECORDS VAULT */}
        <View style={styles.vaultSectionHeader}>
          <Text style={styles.vaultTitle}>Verified Records in Vault</Text>
          <Text style={styles.vaultSub}>
            Patient-confirmed clinical encounters and doctor prescriptions
          </Text>
        </View>

        {loadingPreview ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[typography.bodyMuted, { marginTop: spacing.xs, fontSize: 13 }]}>
              Loading record vault...
            </Text>
          </View>
        ) : previewData && previewData.timelineEvents && previewData.timelineEvents.length > 0 ? (
          <View style={styles.recordsList}>
            {previewData.timelineEvents.map((event, idx) => (
              <View key={event.id || idx} style={styles.recordItemCard}>
                <View style={styles.recordIconBox}>
                  <Text style={styles.recordIconText}>📋</Text>
                </View>
                <View style={styles.recordContent}>
                  <Text style={styles.recordTitle}>{event.title}</Text>
                  <Text style={styles.recordMeta}>
                    {new Date(event.eventDate).toLocaleDateString()}
                    {event.prescription?.doctorName ? ` • Dr. ${event.prescription.doctorName}` : ''}
                  </Text>
                </View>
                <View style={styles.verifiedPill}>
                  <Text style={styles.verifiedPillText}>✓ Verified</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Card variant="muted" style={styles.emptyVaultCard}>
            <Text style={[typography.bodyMuted, { textAlign: 'center', fontSize: 13 }]}>
              No verified records found in the selected timeframe. Upload a prescription or report to add it to your health vault.
            </Text>
          </Card>
        )}

        {/* 3. CLINICAL PRIVACY GUARANTEE */}
        <View style={styles.trustBanner}>
          <Text style={styles.trustBannerTitle}>🔒 Built for Privacy & Trust</Text>
          <Text style={styles.trustBannerText}>
            Your health records are stored with tenant-level isolation and AES encryption. Unreviewed AI drafts are strictly excluded from all doctor summary exports.
          </Text>
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  pageSubHeader: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  successBanner: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  successText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 13,
  },

  /* Top Vault Metrics */
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 16px rgba(17, 20, 24, 0.03)',
        } as any)
      : shadows.sm),
  },
  metricCardHighlight: {
    backgroundColor: colors.accentCustardLight,
    borderColor: 'rgba(202, 138, 4, 0.25)',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricHighlightIcon: {
    fontSize: 16,
  },
  metricHighlightText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentCustard,
    marginTop: 2,
  },

  /* Hero Summary Card */
  heroSummaryCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.xxl,
    padding: spacing.md + 4,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 12px 36px rgba(14, 17, 22, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        } as any)
      : shadows.sm),
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentCustardLight,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(202, 138, 4, 0.2)',
  },
  heroBadgeIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentCustard,
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 3,
    marginBottom: spacing.md,
  },

  /* Filter Section */
  filterSection: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  chipSelected: {
    backgroundColor: colors.accentCoral,
    borderColor: colors.accentCoral,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.textInverse,
    fontWeight: '800',
  },

  /* Buttons */
  exportBtnPrimary: {
    backgroundColor: colors.accentCoral,
    paddingVertical: 13,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 16px rgba(255, 91, 34, 0.35)',
        } as any)
      : {}),
  },
  exportBtnPrimaryText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  exportBtnSecondary: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  exportBtnSecondaryText: {
    color: colors.accentCyan,
    fontSize: 13,
    fontWeight: '700',
  },

  /* Vault Section */
  vaultSectionHeader: {
    marginBottom: spacing.sm,
  },
  vaultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  vaultSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  centerLoading: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  recordsList: {
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  recordItemCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: colors.borderTopGlass,
    flexDirection: 'row',
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  recordIconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  recordIconText: {
    fontSize: 16,
  },
  recordContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recordMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verifiedPill: {
    backgroundColor: colors.successLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 160, 0.35)',
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  emptyVaultCard: {
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },

  /* Trust Banner */
  trustBanner: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderTopColor: 'rgba(255, 255, 255, 0.22)',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } as any)
      : {}),
  },
  trustBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  trustBannerText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
