import React from 'react';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField';
import { textStyles } from '../../typography';
import { space } from '../../tokens';

// Three lines of body text plus vertical padding.
const MULTILINE_MIN_HEIGHT = textStyles.body.lineHeight * 3 + space.md * 2;

export type MultilineFieldProps = Omit<TextFieldProps, 'leadingIcon' | 'trailing'>;

export function MultilineField({ showCount, maxLength, style, ...rest }: MultilineFieldProps) {
  return (
    <TextField
      {...rest}
      maxLength={maxLength}
      showCount={showCount ?? (maxLength !== undefined)}
      multiline
      textAlignVertical="top"
      style={[{ minHeight: MULTILINE_MIN_HEIGHT, paddingVertical: space.md }, style]}
    />
  );
}
