import React from 'react';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField';

export type EmailFieldProps = Omit<
  TextFieldProps,
  'leadingIcon' | 'keyboardType' | 'autoCapitalize' | 'autoComplete' | 'textContentType'
>;

export function EmailField(props: EmailFieldProps) {
  return (
    <TextField
      {...props}
      keyboardType="email-address"
      autoCapitalize="none"
      autoComplete="email"
      textContentType="emailAddress"
      leadingIcon="mail-outline"
    />
  );
}
