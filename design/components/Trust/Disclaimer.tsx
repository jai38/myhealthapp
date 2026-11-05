import React from 'react';
import { View } from 'react-native';
import { color, radius, space } from '../../tokens';
import { t } from '../../strings';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';

export interface DisclaimerProps {
  text?: string;
  testID?: string;
}

export function Disclaimer({ text, testID }: DisclaimerProps) {
  const body = text ?? t('disclaimer.notMedicalAdvice');
  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        gap: space.sm,
        backgroundColor: color.bg.subtle,
        borderRadius: radius.md,
        padding: space.md,
      }}
    >
      <Icon
        name="information-circle-outline"
        size="md"
        tone="secondary"
        testID={testID && `${testID}-icon`}
      />
      <View style={{ flex: 1, gap: space.xxs }}>
        <Text variant="caption" tone="primary" testID={testID && `${testID}-heading`}>
          {t('trust.disclaimerLabel')}
        </Text>
        <Text variant="callout" tone="secondary" testID={testID && `${testID}-text`}>
          {body}
        </Text>
      </View>
    </View>
  );
}
