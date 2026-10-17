import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/index';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  ...rest
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = styles.base;

    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: disabled ? colors.borderStrong : colors.primary,
          borderWidth: 1,
          borderColor: disabled ? 'transparent' : 'rgba(255, 255, 255, 0.3)',
          borderTopColor: disabled ? 'transparent' : 'rgba(255, 255, 255, 0.6)',
          ...(Platform.OS === 'web' && !disabled
            ? ({
                boxShadow: '0 4px 16px rgba(0, 245, 160, 0.35)',
              } as any)
            : {}),
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: disabled ? colors.border : colors.secondaryLight,
          borderWidth: 1,
          borderColor: disabled ? 'transparent' : 'rgba(0, 229, 255, 0.3)',
          borderTopColor: disabled ? 'transparent' : 'rgba(255, 255, 255, 0.4)',
        };
      case 'glass':
        return {
          ...base,
          backgroundColor: disabled ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1,
          borderColor: disabled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.18)',
          borderTopColor: disabled ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.38)',
          ...(Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              } as any)
            : {}),
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? colors.border : colors.primary,
        };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      case 'danger':
        return { ...base, backgroundColor: disabled ? colors.borderStrong : colors.danger };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return { ...typography.button, color: colors.textInverse };
      case 'secondary':
        return { ...typography.button, color: disabled ? colors.textMuted : colors.secondary };
      case 'glass':
        return { ...typography.button, color: disabled ? colors.textMuted : colors.textPrimary };
      case 'outline':
        return { ...typography.button, color: disabled ? colors.textMuted : colors.primary };
      case 'ghost':
        return { ...typography.button, color: disabled ? colors.textMuted : colors.primary };
    }
  };

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, minHeight: 36 },
    md: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, minHeight: 48 }, // 48dp accessible minimum
    lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 56 },
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), sizeStyles[size], style]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || isLoading }}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? colors.textInverse : colors.primary}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), styles.text]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    textAlign: 'center',
  },
});

