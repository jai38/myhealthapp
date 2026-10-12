import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
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
        return [styles.base, shadows.sm];
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
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 0,
  },
});
