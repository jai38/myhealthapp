import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/index';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'coral';

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
        return { bg: colors.accentMintLight, text: colors.accentMint, border: 'rgba(22, 163, 74, 0.2)' };
      case 'warning':
        return { bg: colors.accentCustardLight, text: colors.accentCustard, border: 'rgba(202, 138, 4, 0.2)' };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger, border: 'rgba(225, 29, 72, 0.2)' };
      case 'info':
        return { bg: colors.accentCyanLight, text: colors.accentCyan, border: 'rgba(2, 132, 199, 0.2)' };
      case 'coral':
        return { bg: colors.accentCoralLight, text: colors.accentCoral, border: 'rgba(255, 91, 34, 0.2)' };
      case 'neutral':
        return { bg: colors.surfaceSecondary, text: colors.textSecondary, border: colors.borderSubtle };
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
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs / 2 + 1,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.badge,
    fontWeight: '600',
  },
});

