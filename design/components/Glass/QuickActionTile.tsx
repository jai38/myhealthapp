import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { font, radius, size, space } from '../../tokens';
import { useTheme } from '../../theme';
import type { IconName } from '../Foundations/iconNames';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { GlassCard } from './GlassCard';

export interface QuickActionTileProps {
  label: string;
  icon: IconName;
  /** Blue for records and medicines; teal for supplements and readings. */
  tone?: 'blue' | 'teal';
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

// v4 Quick Action tile: a glass tile with an icon chip and a one- to three-word label.
export function QuickActionTile({ label, icon, tone = 'blue', onPress, disabled = false, testID }: QuickActionTileProps) {
  const { color: c } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.press, (pressed || disabled) && styles.dim]}
    >
      <GlassCard shape="tile" style={styles.tile}>
        <View style={[styles.chip, { backgroundColor: tone === 'teal' ? c.bg.tintTeal : c.bg.tintBlue }]}>
          <Icon name={icon} size="md" color={tone === 'teal' ? c.text.teal : c.action.blue} />
        </View>
        <Text variant="callout" style={[styles.label, { color: c.text.primary }]}>
          {label}
        </Text>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { flex: 1, minHeight: size.touchMin },
  tile: { gap: space.md, minHeight: 96, padding: space.md },
  // Footnote-sized headline: two words on one line in a half-width tile at 360.
  label: { fontFamily: font.semibold },
  chip: { width: 40, height: 40, borderRadius: radius.iconChip, alignItems: 'center', justifyContent: 'center' },
  dim: { opacity: 0.6 },
});
