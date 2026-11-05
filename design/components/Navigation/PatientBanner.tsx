import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { color, space } from '../../tokens';
import { t } from '../../strings';

export interface PatientBannerProps {
  name: string;
  testID?: string;
}

// Not dismissible: the patient name must stay visible on capture and export screens.
export function PatientBanner({ name, testID }: PatientBannerProps) {
  return (
    <View testID={testID} style={styles.strip}>
      <Icon name="person-circle-outline" tone="source" />
      <Text
        variant="bodyStrong"
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
        testID={testID && `${testID}-text`}
        style={styles.text}
      >
        {t('patient.viewing', { name })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: color.bg.tintTeal,
  },
  text: {
    color: color.tone.source.fg,
    flexShrink: 1,
  },
});
