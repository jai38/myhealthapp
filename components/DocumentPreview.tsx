import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/index';
import { Badge } from './Badge';

export interface DocumentPreviewProps {
  filename: string;
  mimeType: string;
  signedUrl?: string;
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  style?: object;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  filename,
  mimeType,
  signedUrl,
  pageCount = 1,
  currentPage = 1,
  onPageChange,
  style,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const isPdf = mimeType === 'application/pdf';

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const handleResetZoom = () => setZoomLevel(100);

  return (
    <View style={[styles.container, style]}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.filename} numberOfLines={1}>
            {filename}
          </Text>
          <Badge
            label={isPdf ? 'PDF Document' : 'Camera Photo'}
            variant="neutral"
          />
        </View>

        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.expandButtonText}>
            {isExpanded ? 'Collapse' : 'Expand View'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preview Viewport */}
      <View style={[styles.viewport, isExpanded && styles.viewportExpanded]}>
        <View
          style={[
            styles.documentCanvas,
            { transform: [{ scale: zoomLevel / 100 }] },
          ]}
        >
          <View style={styles.documentPage}>
            <View style={styles.stampBadge}>
              <Text style={styles.stampText}>SOURCE EVIDENCE</Text>
            </View>
            <Text style={styles.documentHeaderPlaceholder}>
              {isPdf ? '[ PDF Document Viewer ]' : '[ Prescription Photo ]'}
            </Text>
            <Text style={styles.documentMetaPlaceholder}>
              File: {filename} • Zoom: {zoomLevel}%
            </Text>
            <View style={styles.documentDivider} />
            <Text style={styles.documentPreviewText}>
              Original uploaded artifact preserved immutably.
            </Text>
            {signedUrl ? (
              <Text style={styles.signedUrlNotice} numberOfLines={1}>
                Secure Pre-signed URL Active (15m TTL)
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Control Bar: Zoom & Page Navigation */}
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

        {pageCount > 1 && (
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
  filename: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: 160,
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
    height: 180,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  viewportExpanded: {
    height: 320,
  },
  documentCanvas: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentPage: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    width: '100%',
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  documentHeaderPlaceholder: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  documentMetaPlaceholder: {
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
  documentPreviewText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  signedUrlNotice: {
    fontSize: 10,
    color: colors.success,
    marginTop: spacing.xs,
    fontWeight: '500',
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
