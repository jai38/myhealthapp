import React from 'react';
import { View, StyleSheet, ViewProps, Platform } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme/index';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'muted';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
  ...rest
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return [styles.base, styles.elevated, shadows.sm];
      case 'outlined':
        return [styles.base, styles.outlined];
      case 'muted':
        return [styles.base, styles.muted];
    }
  };

  return (
    <View style={[getVariantStyle(), style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 18px rgba(17, 20, 24, 0.03), 0 1px 2px rgba(17, 20, 24, 0.02)',
        } as any)
      : shadows.sm),
  },
  elevated: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 10px 30px rgba(17, 20, 24, 0.05), 0 2px 6px rgba(17, 20, 24, 0.03)',
        } as any)
      : shadows.md),
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});

