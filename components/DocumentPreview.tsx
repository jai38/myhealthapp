import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/index';
import { Badge } from './Badge';

export interface DocumentPreviewProps {
  filename: string;
  mimeType: string;
  signedUrl?: string;
  localUri?: string;
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  style?: object;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  filename,
  mimeType,
  signedUrl,
  localUri,
  pageCount = 1,
  currentPage = 1,
  onPageChange,
  style,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const isPdf =
    mimeType === 'application/pdf' ||
    filename.toLowerCase().endsWith('.pdf');

  // Choose the best image URI: local picked file URI (fast, offline, instant) or cloud signed URL
  const activeUri =
    localUri ||
    (signedUrl && !signedUrl.includes('mock-s3.local') ? signedUrl : undefined) ||
    signedUrl;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const handleResetZoom = () => setZoomLevel(100);

  const handleOpenFull = () => {
    if (!activeUri) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(activeUri, '_blank');
    } else {
      Linking.openURL(activeUri).catch(() => {});
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.filename} numberOfLines={1}>
            {filename}
          </Text>
          <Badge
            label={isPdf ? 'PDF Document' : 'Prescription Photo'}
            variant="neutral"
          />
        </View>

        <View style={styles.headerRight}>
          {activeUri ? (
            <TouchableOpacity style={styles.headerActionBtn} onPress={handleOpenFull}>
              <Text style={styles.headerActionText}>Full View ↗</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.expandButtonText}>
              {isExpanded ? 'Collapse' : 'Expand'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preview Viewport */}
      <View style={[styles.viewport, isExpanded ? styles.viewportExpanded : styles.viewportNormal]}>
        {isPdf ? (
          <View style={styles.pdfCard}>
            <Text style={styles.pdfIcon}>📄</Text>
            <Text style={styles.pdfTitle} numberOfLines={1}>
              {filename}
            </Text>
            <Text style={styles.pdfSubtitle}>
              PDF Document • Page {currentPage} of {pageCount}
            </Text>
            {activeUri ? (
              <TouchableOpacity style={styles.openPdfBtn} onPress={handleOpenFull}>
                <Text style={styles.openPdfBtnText}>Open PDF in Viewer ↗</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.pdfNote}>Original PDF archived securely</Text>
            )}
          </View>
        ) : activeUri && !imageError ? (
          <ScrollView
            horizontal
            contentContainerStyle={styles.scrollCanvas}
            showsHorizontalScrollIndicator={true}
            maximumZoomScale={3}
            minimumZoomScale={0.5}
          >
            <View
              style={[
                styles.imageWrapper,
                { transform: [{ scale: zoomLevel / 100 }] },
              ]}
            >
              <Image
                source={{ uri: activeUri }}
                style={[
                  styles.previewImage,
                  isExpanded ? styles.previewImageExpanded : styles.previewImageNormal,
                ]}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => setImageError(true)}
              />
              {imageLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading prescription image...</Text>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          /* Fallback when image cannot be displayed */
          <View style={styles.fallbackCard}>
            <View style={styles.stampBadge}>
              <Text style={styles.stampText}>SOURCE EVIDENCE</Text>
            </View>
            <Text style={styles.fallbackTitle}>
              {imageError ? 'Could not render image preview' : 'Prescription Photo'}
            </Text>
            <Text style={styles.fallbackSubtitle}>File: {filename}</Text>
            <View style={styles.documentDivider} />
            <Text style={styles.fallbackNote}>
              Original uploaded artifact preserved immutably.
            </Text>
            {activeUri ? (
              <TouchableOpacity style={styles.openFallbackBtn} onPress={handleOpenFull}>
                <Text style={styles.openFallbackBtnText}>Open Raw Document ↗</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>

      {/* Control Bar: Zoom & Navigation */}
      <View style={styles.controlsBar}>
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.zoomLabel}>{zoomLevel}%</Text>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={handleResetZoom}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {pageCount > 1 && isPdf && (
          <View style={styles.pageControls}>
            <TouchableOpacity
              style={[styles.controlButton, currentPage <= 1 && styles.disabledButton]}
              disabled={currentPage <= 1}
              onPress={() => onPageChange && onPageChange(currentPage - 1)}
            >
              <Text style={styles.controlButtonText}>Prev</Text>
            </TouchableOpacity>
            <Text style={styles.pageLabel}>
              {currentPage} / {pageCount}
            </Text>
            <TouchableOpacity
              style={[
                styles.controlButton,
                currentPage >= pageCount && styles.disabledButton,
              ]}
              disabled={currentPage >= pageCount}
              onPress={() => onPageChange && onPageChange(currentPage + 1)}
            >
              <Text style={styles.controlButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filename: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: 160,
  },
  headerActionBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerActionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  expandButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  expandButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  viewport: {
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  viewportNormal: {
    height: 240,
  },
  viewportExpanded: {
    height: 420,
  },
  scrollCanvas: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  previewImage: {
    width: 340,
    backgroundColor: 'transparent',
  },
  previewImageNormal: {
    height: 220,
  },
  previewImageExpanded: {
    height: 400,
    width: 500,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: spacing.xs,
  },
  pdfCard: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pdfIcon: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  pdfTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pdfSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  openPdfBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  openPdfBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  pdfNote: {
    fontSize: 11,
    color: colors.textMuted,
  },
  fallbackCard: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    width: '90%',
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  stampBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  stampText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  fallbackTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  fallbackSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  documentDivider: {
    height: 1,
    backgroundColor: colors.border,
    width: '80%',
    marginVertical: spacing.sm,
  },
  fallbackNote: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  openFallbackBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  openFallbackBtnText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  controlButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resetButton: {
    paddingHorizontal: spacing.xs,
  },
  resetButtonText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  zoomLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 36,
    textAlign: 'center',
  },
  pageLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
  },
  disabledButton: {
    opacity: 0.4,
  },
});
