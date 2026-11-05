import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../Foundations/Icon';
import type { IconName } from '../Foundations/iconNames';
import { space } from '../../tokens';
import { maxFontScaleFor, textStyles } from '../../typography';
import { buttonColors, buttonLayout, ButtonVariant } from './buttonStyle';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  fullWidth?: boolean;
  accessibilityHint?: string;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  accessibilityHint,
  testID,
}: ButtonProps) {
  // Loading blocks presses the same way disabled does, but keeps the normal colors.
  const inert = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy: loading }}
      disabled={inert}
      onPress={onPress}
      style={({ pressed }) => {
        const { bg, border } = buttonColors(variant, { pressed, disabled });
        return [
          buttonLayout,
          styles.base,
          { backgroundColor: bg, borderColor: border },
          fullWidth && styles.fullWidth,
        ];
      }}
    >
      {({ pressed }) => {
        const { fg } = buttonColors(variant, { pressed, disabled });
        return (
          <View style={styles.content}>
            {loading ? (
              <ActivityIndicator color={fg} testID={testID && `${testID}-spinner`} />
            ) : (
              icon !== undefined && <Icon name={icon} size="md" color={fg} />
            )}
            <Text
              maxFontSizeMultiplier={maxFontScaleFor('bodyStrong')}
              style={[
                textStyles.bodyStrong,
                { color: fg },
                (icon !== undefined || loading) && styles.labelAfterLeading,
              ]}
            >
              {label}
            </Text>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelAfterLeading: {
    marginLeft: space.sm,
  },
});
