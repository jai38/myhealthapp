import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/index';
import { Button } from './Button';
import { PickedFile, validatePickedFile } from '../services/documents/file-validator';

export interface DocumentPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onFileSelected: (file: PickedFile) => void;
}

export const DocumentPickerModal: React.FC<DocumentPickerModalProps> = ({
  visible,
  onClose,
  onFileSelected,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectFile = (file: PickedFile) => {
    const validation = validatePickedFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid file');
      return;
    }
    setErrorMessage(null);
    onClose();
    onFileSelected(file);
  };

  // Sample quick-pickers for dev/simulator workflows
  const handlePickSamplePdf = () => {
    handleSelectFile({
      name: 'Apollo_Clinic_Prescription.pdf',
      size: 1024 * 320, // 320 KB
      mimeType: 'application/pdf',
      base64: Buffer.from('%PDF-1.4 Simulated Indian Prescription Document', 'utf-8').toString('base64'),
    });
  };

  const handlePickSamplePhoto = () => {
    handleSelectFile({
      name: 'Clinic_Slip_Camera_Capture.jpg',
      size: 1024 * 850, // 850 KB
      mimeType: 'image/jpeg',
      base64: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]).toString('base64'),
    });
  };

  const handlePickOversizedSample = () => {
    handleSelectFile({
      name: 'oversized_scan_archive.pdf',
      size: 18 * 1024 * 1024, // 18 MB (>15MB)
      mimeType: 'application/pdf',
    });
  };

  const handlePickInvalidFormat = () => {
    handleSelectFile({
      name: 'notes.txt',
      size: 1024,
      mimeType: 'text/plain',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Upload Prescription</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Capture your physical prescription or upload a PDF document. Max size 15 MB.
          </Text>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          {/* Capture Options */}
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={handlePickSamplePhoto}
            >
              <View style={styles.optionIconContainer}>
                <Text style={styles.optionIcon}>📷</Text>
              </View>
              <View style={styles.optionDetails}>
                <Text style={styles.optionTitle}>Camera Photo</Text>
                <Text style={styles.optionDescription}>
                  Take a photo of clinic slip or paper prescription
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={handlePickSamplePhoto}
            >
              <View style={styles.optionIconContainer}>
                <Text style={styles.optionIcon}>🖼️</Text>
              </View>
              <View style={styles.optionDetails}>
                <Text style={styles.optionTitle}>Photo Gallery</Text>
                <Text style={styles.optionDescription}>
                  Select saved image from device library
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={handlePickSamplePdf}
            >
              <View style={styles.optionIconContainer}>
                <Text style={styles.optionIcon}>📄</Text>
              </View>
              <View style={styles.optionDetails}>
                <Text style={styles.optionTitle}>PDF Document Picker</Text>
                <Text style={styles.optionDescription}>
                  Upload hospital discharge summary or e-prescription
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Validation Test Controls */}
          <View style={styles.testSection}>
            <Text style={styles.testSectionTitle}>Validation Verification (Test Suite)</Text>
            <View style={styles.testButtonsRow}>
              <TouchableOpacity
                style={styles.testButton}
                onPress={handlePickOversizedSample}
              >
                <Text style={styles.testButtonText}>Test Exceeds 15MB</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.testButton}
                onPress={handlePickInvalidFormat}
              >
                <Text style={styles.testButtonText}>Test Invalid Type</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Cancel"
            variant="ghost"
            onPress={onClose}
            style={styles.cancelButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodyMuted,
    marginBottom: spacing.md,
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
  },
  optionsList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionIcon: {
    fontSize: 22,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  testSection: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.md,
  },
  testSectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  testButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  testButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: spacing.xs,
  },
});
