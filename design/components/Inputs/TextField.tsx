import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Text } from '../Foundations/Text';
import { Icon } from '../Foundations/Icon';
import type { IconName } from '../Foundations/iconNames';
import { maxFontScaleFor, textStyles } from '../../typography';
import { space } from '../../tokens';
import { t } from '../../strings';
import { fieldColors, fieldLayout, fieldState } from './inputStyle';

export interface TextFieldProps
  extends Omit<
    TextInputProps,
    'value' | 'onChangeText' | 'placeholder' | 'maxLength' | 'editable' | 'accessibilityLabel' | 'accessibilityHint' | 'testID'
  > {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  leadingIcon?: IconName;
  trailing?: React.ReactNode;
  maxLength?: number;
  showCount?: boolean;
  // Goes on the root view. The TextInput gets `${testID}-input`.
  testID?: string;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  error,
  disabled = false,
  leadingIcon,
  trailing,
  maxLength,
  showCount = false,
  style,
  onFocus,
  onBlur,
  testID,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;
  const colors = fieldColors(fieldState({ focused, error: hasError, disabled }));
  const showCharCount = showCount && maxLength !== undefined;

  return (
    <View testID={testID} style={styles.wrapper}>
      <Text variant="caption">{label}</Text>
      <View
        style={[
          styles.box,
          {
            borderColor: colors.border,
            borderWidth: colors.borderWidth,
            backgroundColor: colors.bg,
          },
        ]}
      >
        {leadingIcon ? <Icon name={leadingIcon} tone="secondary" /> : null}
        <TextInput
          {...rest}
          testID={testID ? `${testID}-input` : undefined}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          editable={!disabled}
          maxLength={maxLength}
          style={[styles.input, { color: colors.text }, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          maxFontSizeMultiplier={maxFontScaleFor('body')}
          accessibilityLabel={label}
          accessibilityHint={hasError ? error : helper}
        />
        {trailing}
      </View>
      {hasError ? (
        <View style={styles.errorRow}>
          <Icon name="warning-outline" tone="danger" />
          <Text variant="caption" tone="danger" style={styles.flex}>
            {error}
          </Text>
        </View>
      ) : null}
      {helper || showCharCount ? (
        <View style={styles.bottomRow}>
          <View style={styles.flex}>
            {helper ? (
              <Text variant="caption" tone="secondary">
                {helper}
              </Text>
            ) : null}
          </View>
          {showCharCount ? (
            <Text variant="caption" tone="secondary" align="right">
              {t('input.charCount', { count: value.length, max: maxLength })}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space.xs,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: fieldLayout.minHeight,
    borderRadius: fieldLayout.borderRadius,
    paddingHorizontal: fieldLayout.paddingHorizontal,
  },
  input: {
    flex: 1,
    ...textStyles.body,
    paddingVertical: space.sm,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
  },
  flex: {
    flex: 1,
  },
});
