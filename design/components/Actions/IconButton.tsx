import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Icon } from '../Foundations/Icon';
import type { IconName } from '../Foundations/iconNames';
import { color, TextTone, textToneColor } from '../../tokens';
import { iconButtonLayout } from './buttonStyle';

export interface IconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: TextTone;
  testID?: string;
}

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  disabled = false,
  tone = 'primary',
  testID,
}: IconButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        iconButtonLayout,
        styles.base,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Icon
        name={icon}
        size="lg"
        color={disabled ? color.border.input : textToneColor[tone]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: color.bg.subtle,
  },
});
