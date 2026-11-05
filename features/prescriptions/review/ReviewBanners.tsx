import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../../../design/components/Foundations/Icon';
import { Text } from '../../../design/components/Foundations/Text';
import { t } from '../../../design/strings';
import { color, radius, space } from '../../../design/tokens';

export interface ReviewBannersProps {
  warnings?: string[];
  formError: string | null;
}

// AI ambiguity notes from extraction, and the inline save error.
export function ReviewBanners({ warnings, formError }: ReviewBannersProps) {
  return (
    <>
      {Array.isArray(warnings) && warnings.length > 0 && (
        <View style={styles.warningBox}>
          <View style={styles.row}>
            <Icon name="warning-outline" tone="caution" />
            <Text variant="bodyStrong" style={styles.warningTitle}>
              {t('prescriptions.review.aiAmbiguity')}
            </Text>
          </View>
          {warnings.map((w: string, i: number) => (
            <Text key={i} variant="caption" tone="primary">
              {`• ${w}`}
            </Text>
          ))}
        </View>
      )}

      {formError ? (
        <View style={styles.errorBox} accessibilityLiveRegion="polite">
          <Icon name="alert-circle-outline" tone="danger" />
          <Text variant="caption" tone="danger" style={styles.flex}>
            {formError}
          </Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  warningBox: {
    backgroundColor: color.tone.caution.bg,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
  },
  warningTitle: {
    color: color.tone.caution.fg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    backgroundColor: color.tone.danger.bg,
    borderRadius: radius.md,
    padding: space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  flex: {
    flex: 1,
  },
});
