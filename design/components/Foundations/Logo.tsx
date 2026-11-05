import React from 'react';
import { t } from '../../strings';
import { View } from 'react-native';
import { LogoMark } from '../../assets/LogoMark';
import { space } from '../../tokens';
import { Text } from './Text';

const BRAND_NAME = t('brand.name');

export interface LogoProps {
  variant?: 'mark' | 'full';
  size?: number;
  testID?: string;
}

export function Logo({ variant = 'full', size = 32, testID }: LogoProps) {
  if (variant === 'mark') {
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={BRAND_NAME}
        testID={testID}
      >
        <LogoMark size={size} />
      </View>
    );
  }
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={BRAND_NAME}
      testID={testID}
      style={{ flexDirection: 'row', alignItems: 'center' }}
    >
      <LogoMark size={size} />
      <Text variant="title2" tone="link" style={{ marginLeft: space.sm }}>
        {BRAND_NAME}
      </Text>
    </View>
  );
}
