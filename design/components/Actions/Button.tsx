import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../Foundations/Icon';
import type { IconName } from '../Foundations/iconNames';
import { useReduceMotion } from '../Containers/useReduceMotion';
import { space } from '../../tokens';
import { maxFontScaleFor, textStyles } from '../../typography';
import {
  buttonColors,
  buttonLayout,
  ButtonVariant,
  PRESSED_OPACITY,
  PRESSED_SCALE,
} from './buttonStyle';

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
  const reduceMotion = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;

  // A small spring on press makes the button feel physical. Skipped under reduce motion.
  const springTo = (toValue: number) => {
    if (reduceMotion) return;
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  return (
    <Animated.View
      style={[{ transform: [{ scale }] }, fullWidth && styles.fullWidth]}
    >
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled, busy: loading }}
        disabled={inert}
        onPress={onPress}
        onPressIn={() => springTo(PRESSED_SCALE)}
        onPressOut={() => springTo(1)}
        style={({ pressed }) => {
          const { bg, border } = buttonColors(variant, { pressed, disabled });
          const dimsWhenPressed = pressed && (variant === 'secondary' || variant === 'text');
          return [
            buttonLayout,
            styles.base,
            { backgroundColor: bg, borderColor: border },
            dimsWhenPressed && { opacity: PRESSED_OPACITY },
          ];
        }}
      >
        {({ pressed }) => {
          const { fg } = buttonColors(variant, { pressed, disabled });
          return (
            <View style={styles.content}>
              {/* The label stays laid out while loading, so the button keeps its width. */}
              <View style={[styles.content, loading && styles.hidden]}>
                {icon !== undefined && <Icon name={icon} size="md" color={fg} />}
                <Text
                  maxFontSizeMultiplier={maxFontScaleFor('bodyStrong')}
                  style={[
                    textStyles.bodyStrong,
                    // Long labels wrap instead of overflowing the button.
                    { color: fg, flexShrink: 1, textAlign: 'center' },
                    icon !== undefined && styles.labelAfterLeading,
                  ]}
                >
                  {label}
                </Text>
              </View>
              {loading ? (
                <View style={styles.spinner} pointerEvents="none">
                  <ActivityIndicator color={fg} testID={testID && `${testID}-spinner`} />
                </View>
              ) : null}
            </View>
          );
        }}
      </Pressable>
    </Animated.View>
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
    flexShrink: 1,
  },
  hidden: {
    opacity: 0,
  },
  spinner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelAfterLeading: {
    marginLeft: space.sm,
  },
});
