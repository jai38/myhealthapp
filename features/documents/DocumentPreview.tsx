import React, { useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { Icon } from '../../design/components/Foundations/Icon';
import { Divider } from '../../design/components/Foundations/Divider';
import { Text } from '../../design/components/Foundations/Text';
import { StatusPill } from '../../design/components/Trust/StatusPill';
import { t } from '../../design/strings';
import type { StatusDisplay } from '../../design/status';
import { color, elevation, radius, size, space } from '../../design/tokens';

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

const PDF_BADGE: StatusDisplay = {
  labelKey: 'documents.preview.pdfBadge',
  tone: 'neutral',
  variant: 'soft',
  icon: 'document-text-outline',
};

const PHOTO_BADGE: StatusDisplay = {
  labelKey: 'documents.preview.photoBadge',
  tone: 'neutral',
  variant: 'soft',
  icon: 'document-text-outline',
};

const SOURCE_EVIDENCE_BADGE: StatusDisplay = {
  labelKey: 'documents.preview.sourceEvidence',
  tone: 'source',
  variant: 'soft',
  icon: 'document-text-outline',
};

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
          <Text variant="caption" tone="primary" numberOfLines={1} style={styles.filename}>
            {filename}
          </Text>
          <StatusPill display={isPdf ? PDF_BADGE : PHOTO_BADGE} />
        </View>

        <View style={styles.headerRight}>
          {activeUri ? (
            <ControlButton label={t('documents.preview.fullView')} onPress={handleOpenFull} />
          ) : null}
          <ControlButton
            label={isExpanded ? t('documents.preview.collapse') : t('documents.preview.expand')}
            onPress={() => setIsExpanded(!isExpanded)}
          />
        </View>
      </View>

      {/* Preview Viewport */}
      <View style={[styles.viewport, isExpanded ? styles.viewportExpanded : styles.viewportNormal]}>
        {isPdf ? (
          <View style={styles.pdfCard}>
            <Icon name="document-text-outline" size="lg" tone="link" />
            <Text variant="bodyStrong" numberOfLines={1} align="center">
              {filename}
            </Text>
            <Text variant="caption" tone="secondary" align="center">
              {t('documents.preview.pdfPage', { current: currentPage, total: pageCount })}
            </Text>
            {activeUri ? (
              <Button label={t('documents.preview.openPdf')} variant="secondary" onPress={handleOpenFull} />
            ) : (
              <Text variant="caption" tone="tertiary" align="center">
                {t('documents.preview.pdfArchived')}
              </Text>
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
                  <ActivityIndicator size="small" color={color.action.primary} />
                  <Text variant="caption" tone="secondary" style={styles.loadingText}>
                    {t('documents.preview.loadingImage')}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          /* Fallback when image cannot be displayed */
          <View style={styles.fallbackCard}>
            <StatusPill display={SOURCE_EVIDENCE_BADGE} />
            <Text variant="bodyStrong" align="center" style={styles.fallbackTitle}>
              {imageError ? t('documents.preview.imageError') : t('documents.preview.photoBadge')}
            </Text>
            <Text variant="caption" tone="secondary" align="center">
              {t('documents.preview.fileLabel', { name: filename })}
            </Text>
            <Divider />
            <Text variant="caption" tone="tertiary" align="center">
              {t('documents.preview.archivedNote')}
            </Text>
            {activeUri ? (
              <Button label={t('documents.preview.openRaw')} variant="secondary" onPress={handleOpenFull} />
            ) : null}
          </View>
        )}
      </View>

      {/* Control Bar: Zoom & Navigation */}
      <Divider />
      <View style={styles.controlsBar}>
        <View style={styles.controlGroup}>
          <ControlButton label="-" accessibilityLabel={t('documents.preview.zoomOut')} onPress={handleZoomOut} />
          <Text variant="caption" tone="secondary" style={styles.zoomLabel}>
            {`${zoomLevel}%`}
          </Text>
          <ControlButton label="+" accessibilityLabel={t('documents.preview.zoomIn')} onPress={handleZoomIn} />
          <ControlButton label={t('documents.preview.reset')} onPress={handleResetZoom} />
        </View>

        {pageCount > 1 && isPdf && (
          <View style={styles.controlGroup}>
            <ControlButton
              label={t('documents.preview.prev')}
              disabled={currentPage <= 1}
              onPress={() => onPageChange && onPageChange(currentPage - 1)}
            />
            <Text variant="caption" tone="secondary">
              {`${currentPage} / ${pageCount}`}
            </Text>
            <ControlButton
              label={t('documents.preview.next')}
              disabled={currentPage >= pageCount}
              onPress={() => onPageChange && onPageChange(currentPage + 1)}
            />
          </View>
        )}
      </View>
    </View>
  );
};

interface ControlButtonProps {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
}

// Text-only control. The touch target is at least 48 pt tall.
function ControlButton({ label, onPress, accessibilityLabel, disabled = false }: ControlButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.control, disabled && styles.controlDisabled, pressed && styles.controlPressed]}
    >
      <Text variant="caption" tone={disabled ? 'secondary' : 'link'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.bg.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...elevation.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    minHeight: size.touchMin,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  filename: {
    flexShrink: 1,
  },
  control: {
    minHeight: size.touchMin,
    minWidth: size.touchMin,
    paddingHorizontal: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  controlDisabled: {
    backgroundColor: color.bg.subtle,
  },
  controlPressed: {
    backgroundColor: color.bg.subtle,
  },
  viewport: {
    backgroundColor: color.bg.subtle,
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
    padding: space.xs,
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
    ...StyleSheet.absoluteFill,
    backgroundColor: color.bg.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: space.xs,
  },
  pdfCard: {
    backgroundColor: color.bg.card,
    borderRadius: radius.md,
    padding: space.lg,
    gap: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    maxWidth: 320,
    ...elevation.card,
  },
  fallbackCard: {
    backgroundColor: color.bg.card,
    borderRadius: radius.md,
    padding: space.lg,
    gap: space.xs,
    width: '90%',
    alignItems: 'center',
    ...elevation.card,
  },
  fallbackTitle: {
    marginTop: space.xs,
  },
  controlsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    gap: space.sm,
  },
  controlGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.xs,
  },
  zoomLabel: {
    minWidth: 44,
    textAlign: 'center',
  },
});
