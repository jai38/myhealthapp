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
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: colors.borderTopGlass, // Liquid Glass specular highlight
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
        } as any)
      : {}),
  },
  elevated: {
    backgroundColor: colors.surfaceGlassProminent,
    borderTopColor: 'rgba(255, 255, 255, 0.42)',
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.16)',
  },
});

