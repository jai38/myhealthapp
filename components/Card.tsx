import React from 'react';
import { View, StyleSheet, ViewProps, Platform } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme/index';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?:
    | 'elevated'
    | 'outlined'
    | 'muted'
    | 'glass'
    | 'obsidian'
    | 'glowCoral'
    | 'glowMint'
    | 'glowCyan';
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
        return [styles.base, styles.elevated];
      case 'outlined':
        return [styles.base, styles.outlined];
      case 'muted':
        return [styles.base, styles.muted];
      case 'glass':
        return [styles.base, styles.glass];
      case 'obsidian':
        return [styles.base, styles.obsidian];
      case 'glowCoral':
        return [styles.base, styles.glowCoral];
      case 'glowMint':
        return [styles.base, styles.glowMint];
      case 'glowCyan':
        return [styles.base, styles.glowCyan];
      default:
        return [styles.base, styles.elevated];
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
          boxShadow: '0 4px 20px rgba(14, 17, 22, 0.04), 0 1px 3px rgba(14, 17, 22, 0.02)',
        } as any)
      : shadows.sm),
  },
  elevated: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderTopColor: '#FFFFFF',
    borderTopWidth: 1.5,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 12px 32px rgba(14, 17, 22, 0.06), 0 2px 6px rgba(14, 17, 22, 0.03)',
        } as any)
      : shadows.md),
  },
  glass: {
    backgroundColor: colors.surfaceGlass,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1.5,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 16px 40px rgba(14, 17, 22, 0.07), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
        } as any)
      : shadows.glassCard),
  },
  obsidian: {
    backgroundColor: colors.surfaceObsidian,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderTopColor: 'rgba(255, 255, 255, 0.22)',
    borderTopWidth: 1,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 16px 44px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.1) inset',
        } as any)
      : shadows.lg),
  },
  glowCoral: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 91, 34, 0.25)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 12px 36px rgba(255, 91, 34, 0.18), 0 2px 6px rgba(255, 91, 34, 0.08)',
        } as any)
      : shadows.coralGlow),
  },
  glowMint: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 12px 36px rgba(16, 185, 129, 0.18), 0 2px 6px rgba(16, 185, 129, 0.08)',
        } as any)
      : shadows.mintGlow),
  },
  glowCyan: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(6, 182, 212, 0.25)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 12px 36px rgba(6, 182, 212, 0.18), 0 2px 6px rgba(6, 182, 212, 0.08)',
        } as any)
      : shadows.cyanGlow),
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  muted: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 0,
  },
});
