import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/index';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
}) => {
  const getColors = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case 'success':
        return { bg: colors.successLight, text: colors.success, border: 'rgba(0, 245, 160, 0.32)' };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning, border: 'rgba(255, 183, 3, 0.38)' };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger, border: 'rgba(255, 71, 87, 0.38)' };
      case 'info':
        return { bg: colors.infoLight, text: colors.info, border: 'rgba(0, 229, 255, 0.32)' };
      case 'neutral':
        return { bg: colors.surfaceMuted, text: colors.textSecondary, border: 'rgba(255, 255, 255, 0.14)' };
    }
  };

  const { bg, text, border } = getColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bg, borderColor: border, borderWidth: 1 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        } as any)
      : {}),
  },
  text: {
    ...typography.badge,
  },
});

