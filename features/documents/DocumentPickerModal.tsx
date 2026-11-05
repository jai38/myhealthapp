import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { BottomSheet } from '../../design/components/Containers/BottomSheet';
import { IconTile } from '../../design/components/Containers/IconTile';
import { ListGroup } from '../../design/components/Containers/ListGroup';
import { ListRow } from '../../design/components/Containers/ListRow';
import { Button } from '../../design/components/Actions/Button';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { Spacer } from '../../design/components/Foundations/Spacer';
import { t } from '../../design/strings';
import { color, radius, space } from '../../design/tokens';
import { PickedFile, validatePickedFile } from '../../services/documents/file-validator';

export interface DocumentPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onFileSelected: (file: PickedFile) => void;
}

// Valid, parser-verified 1-page sample PDF (921 bytes)
const VALID_SAMPLE_PDF_B64 =
  'JVBERi0xLjcKJYGBgYEKCjYgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL0xlbmd0aCAxNjYKPj4Kc3RyZWFtCnicRU3LCsJADLznK3oWxHSTTXZBBK1bPHgR9gdEqih6UMTvN2kRCXlNZjJP2FTAxuN1gcVuuH+G9/V0nCvmxAk15SZwU8/gdQ/tSJ1qfcAykrSyVZROYkDOUoQlG1ZsI0MdyUIBI2qQqCRkPSuq83opq6beoM7sFUo7glGKMq1Nwi5QtsmFUcOfHDQ5hc1dek3uYdlNjgEpEhLaTX+SUuEAX63pM6oKZW5kc3RyZWFtCmVuZG9iagoKNyAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovVHlwZSAvT2JqU3RtCi9OIDUKL0ZpcnN0IDI2Ci9MZW5ndGggMzYyCj4+CnN0cmVhbQp4nNVSTUvDQBC976+Yox5kP/KxiZRC2yQKUpRWUBQPabKUSNmVZCv13zuTpJYexLOEx+7MvNl9m3kSBCgIQwhAJxBCFCiIQEsJkwnjj18fBvhDuTUd43dN3cErcgSs4I3xhdtbD5JNp+zEXZS+3LktG5pAEvnIeGhdva9MC5MiLwohtBAiDhGxECrDdYFIEQpjrKkE9wgdjsCcDoQIZlgrBsR66KF6z43G/hxX5MbEyQZumAzxz710Vz6cof7Sk04ZX7o6K72Bi+xaCRVLIZXUKg6Sl0v8Ha0pvfu/j+v1N87++sKzOdN4acitIQ/0U+Yr07l9W+HYiVc4rNDm1uw+jW+q8kqLNEGdOknRY6Mx+PP95t1UPZXC/OBv1p40DAnKLU3dlHN3QPcJ/KI0giRU5MGZtc6TK3s/Wo9qKIpHj55JJkGMr/cb34eUlIzPy870Uk86UYStXN3YLfCnxs5s1xwTdOI3K6PF+AplbmRzdHJlYW0KZW5kb2JqCgo4IDAgb2JqCjw8Ci9TaXplIDkKL1Jvb3QgMiAwIFIKL0luZm8gMyAwIFIKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL1hSZWYKL0xlbmd0aCAzOQovVyBbIDEgMiAyIF0KL0luZGV4IFsgMCA5IF0KPj4Kc3RyZWFtCnicFcSxDQAgEAOxS0CiZf+lfqRAXBhIzIGm5rbaFhdEfh54ZAcEGQplbmRzdHJlYW0KZW5kb2JqCgpzdGFydHhyZWYKNzE5CiUlRU9G';

// Valid, parser-verified 100x100 JPEG sample image (164 bytes)
const VALID_SAMPLE_JPG_B64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/9oADAMBAAIRAxEAPwD7/vKKKKKA/9k=';

export const DocumentPickerModal: React.FC<DocumentPickerModalProps> = ({
  visible,
  onClose,
  onFileSelected,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectFile = (file: PickedFile) => {
    const validation = validatePickedFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error || t('documents.picker.invalidFile'));
      return;
    }
    setErrorMessage(null);
    onClose();
    onFileSelected(file);
  };

  // 1. Native Camera Photo
  const handleTakePhoto = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('documents.picker.cameraPermissionTitle'),
            t('documents.picker.cameraPermissionBody'),
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: false,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        let trueSize = asset.fileSize;
        if (!trueSize && asset.uri && Platform.OS !== 'web') {
          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const FileSystem = require('expo-file-system/legacy');
            const info = await FileSystem.getInfoAsync(asset.uri);
            if (info.exists && typeof info.size === 'number' && info.size > 0) {
              trueSize = info.size;
            }
          } catch {}
        }
        handleSelectFile({
          name: asset.fileName || `Camera_Prescription_${Date.now()}.jpg`,
          size: trueSize || 500000,
          mimeType: asset.mimeType || 'image/jpeg',
          uri: asset.uri,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('documents.picker.fallbackCamera');
      Alert.alert(t('documents.picker.cameraErrorTitle'), msg);
    }
  };

  // 2. Native Photo Library / Gallery
  const handlePickFromGallery = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('documents.picker.galleryPermissionTitle'),
            t('documents.picker.galleryPermissionBody'),
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: false,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        let trueSize = asset.fileSize;
        if (!trueSize && asset.uri && Platform.OS !== 'web') {
          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const FileSystem = require('expo-file-system/legacy');
            const info = await FileSystem.getInfoAsync(asset.uri);
            if (info.exists && typeof info.size === 'number' && info.size > 0) {
              trueSize = info.size;
            }
          } catch {}
        }
        handleSelectFile({
          name: asset.fileName || `Gallery_Prescription_${Date.now()}.jpg`,
          size: trueSize || 500000,
          mimeType: asset.mimeType || 'image/jpeg',
          uri: asset.uri,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('documents.picker.fallbackGallery');
      Alert.alert(t('documents.picker.galleryErrorTitle'), msg);
    }
  };

  // 3. Native PDF Document Picker
  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        handleSelectFile({
          name: asset.name || `Prescription_Document_${Date.now()}.pdf`,
          size: asset.size || 100000,
          mimeType: asset.mimeType || 'application/pdf',
          uri: asset.uri,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('documents.picker.fallbackDocument');
      Alert.alert(t('documents.picker.documentErrorTitle'), msg);
    }
  };

  // 4. Sample Quick-Pickers (Instant simulation with parser-valid bytes)
  const handlePickSamplePdf = () => {
    handleSelectFile({
      name: 'Apollo_Clinic_Prescription.pdf',
      size: 921,
      mimeType: 'application/pdf',
      base64: VALID_SAMPLE_PDF_B64,
    });
  };

  const handlePickSamplePhoto = () => {
    handleSelectFile({
      name: 'Clinic_Slip_Camera_Capture.jpg',
      size: 164,
      mimeType: 'image/jpeg',
      base64: VALID_SAMPLE_JPG_B64,
    });
  };

  // Validation boundary test triggers
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
    <BottomSheet visible={visible} onClose={onClose} title={t('documents.picker.title')}>
      <Text variant="callout" tone="secondary">
        {t('documents.picker.subtitle')}
      </Text>

      {errorMessage && (
        <View style={styles.errorBanner}>
          <Icon name="warning-outline" tone="danger" />
          <Text variant="caption" tone="danger" style={styles.flex}>
            {errorMessage}
          </Text>
        </View>
      )}

      {/* Real Device Capture Options */}
      <ListGroup>
        <ListRow
          title={t('documents.picker.camera')}
          subtitle={t('documents.picker.cameraHint')}
          leading={<IconTile icon="camera-outline" tone="blue" />}
          onPress={handleTakePhoto}
        />
        <ListRow
          title={t('documents.picker.gallery')}
          subtitle={t('documents.picker.galleryHint')}
          leading={<IconTile icon="folder-open-outline" tone="teal" />}
          onPress={handlePickFromGallery}
        />
        <ListRow
          title={t('documents.picker.pdf')}
          subtitle={t('documents.picker.pdfHint')}
          leading={<IconTile icon="document-text-outline" tone="purple" />}
          onPress={handlePickPdf}
        />
      </ListGroup>

      {/* Instant Quick Test Samples */}
      <Text variant="overline" tone="secondary">
        {t('documents.picker.samplesTitle')}
      </Text>
      <View style={styles.samplesRow}>
        <Button label={t('documents.picker.samplePdf')} variant="secondary" onPress={handlePickSamplePdf} />
        <Button label={t('documents.picker.samplePhoto')} variant="secondary" onPress={handlePickSamplePhoto} />
        <Button label={t('documents.picker.testOversized')} variant="secondary" onPress={handlePickOversizedSample} />
        <Button label={t('documents.picker.testTxt')} variant="secondary" onPress={handlePickInvalidFormat} />
      </View>

      <Spacer size="md" />
      <Button label={t('common.cancel')} variant="text" onPress={onClose} fullWidth />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    backgroundColor: color.tone.danger.bg,
    borderRadius: radius.md,
    padding: space.md,
    marginVertical: space.sm,
  },
  flex: {
    flex: 1,
  },
  samplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.xs,
    marginBottom: space.sm,
  },
});
