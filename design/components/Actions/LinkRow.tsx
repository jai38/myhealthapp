import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Icon } from '../Foundations/Icon';
import type { IconName } from '../Foundations/iconNames';
import { color, space } from '../../tokens';
import { maxFontScaleFor, textStyles } from '../../typography';
import { linkRowLayout } from './buttonStyle';

export interface LinkRowProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  value?: string;
  testID?: string;
}

export function LinkRow({ label, onPress, icon, value, testID }: LinkRowProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [linkRowLayout, styles.row, pressed && styles.pressed]}
    >
      {icon !== undefined && (
        <Icon name={icon} size="md" tone="primary" />
      )}
      <Text
        maxFontSizeMultiplier={maxFontScaleFor('body')}
        style={[textStyles.body, styles.label, { color: color.text.primary }]}
      >
        {label}
      </Text>
      {value !== undefined && (
        <Text
          maxFontSizeMultiplier={maxFontScaleFor('callout')}
          style={[textStyles.callout, { color: color.text.secondary }, styles.value]}
        >
          {value}
        </Text>
      )}
      <Icon name="chevron-forward" size="md" tone="tertiary" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
    gap: space.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    flexShrink: 1,
    flexGrow: 1,
  },
  value: {
    textAlign: 'right',
  },
});
