import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '../Foundations/Text';
import { Icon } from '../Foundations/Icon';
import { size, space } from '../../tokens';
import { t } from '../../strings';
import { fieldColors, fieldLayout, fieldState, sanitizeOtp } from './inputStyle';

export interface OtpFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

export function OtpField({
  value,
  onChangeText,
  length = 6,
  error,
  disabled = false,
  testID,
}: OtpFieldProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const digits = sanitizeOtp(value, length);
  // The box at the cursor is the next empty one, or the last box once full.
  const cursor = Math.min(digits.length, length - 1);
  const hasError = !!error;
  const label = t('input.otpLabel');

  const focusInput = () => {
    if (!disabled) inputRef.current?.focus();
  };

  return (
    <View testID={testID} style={styles.wrapper}>
      <Text variant="caption">{label}</Text>
      <View style={styles.row}>
        <TextInput
          ref={inputRef}
          testID={testID && `${testID}-input`}
          value={digits}
          onChangeText={(text) => onChangeText(sanitizeOtp(text, length))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={length}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          caretHidden
          accessibilityLabel={label}
          style={styles.hiddenInput}
        />
        {Array.from({ length }, (_, i) => {
          const char = digits.charAt(i);
          const isCursor = focused && i === cursor;
          const colors = fieldColors(
            fieldState({ focused: isCursor, error: hasError, disabled }),
          );
          return (
            <Pressable
              key={i}
              testID={testID && `${testID}-digit-${i}`}
              onPress={focusInput}
              disabled={disabled}
              accessibilityRole="text"
              accessibilityLabel={t('input.otpDigit', { n: i + 1, total: length })}
              accessibilityValue={{ text: char }}
              style={[
                styles.box,
                {
                  borderColor: colors.border,
                  borderWidth: colors.borderWidth,
                  backgroundColor: colors.bg,
                },
              ]}
            >
              <Text variant="title2" style={{ color: colors.text }}>
                {char}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {hasError ? (
        <View style={styles.errorRow}>
          <Icon name="warning-outline" tone="danger" />
          <Text variant="caption" tone="danger" style={styles.flex}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space.xs,
  },
  row: {
    flexDirection: 'row',
    gap: space.sm,
  },
  box: {
    width: size.touchMin,
    height: size.inputHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: fieldLayout.borderRadius,
  },
  // Focus goes here. The visible boxes are drawn above it and tapping them focuses this input.
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.xs,
  },
  flex: {
    flex: 1,
  },
});
