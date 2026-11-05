import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Icon } from '../../../design/components/Foundations/Icon';
import { Text } from '../../../design/components/Foundations/Text';
import type { IconName } from '../../../design/components/Foundations/iconNames';
import { color, radius, size, space } from '../../../design/tokens';

export interface TextActionProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  tone?: 'link' | 'danger';
  accessibilityLabel?: string;
}

// A small text button for inline actions. Its touch target is at least 48 pt.
export function TextAction({ label, onPress, icon, tone = 'link', accessibilityLabel }: TextActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      {icon !== undefined ? <Icon name={icon} size="sm" tone={tone} /> : null}
      <Text variant="caption" tone={tone}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: size.touchMin,
    minWidth: size.touchMin,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
  },
  pressed: {
    backgroundColor: color.bg.subtle,
  },
});
