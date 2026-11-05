import React from 'react';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField';
import { IconButton } from '../Actions/IconButton';
import { t } from '../../strings';

export interface SearchFieldProps
  extends Omit<TextFieldProps, 'label' | 'leadingIcon' | 'trailing' | 'returnKeyType'> {
  label?: string;
}

export function SearchField({ label, placeholder, value, onChangeText, ...rest }: SearchFieldProps) {
  return (
    <TextField
      {...rest}
      label={label ?? t('input.search')}
      placeholder={placeholder ?? t('input.search')}
      value={value}
      onChangeText={onChangeText}
      leadingIcon="search"
      returnKeyType="search"
      trailing={
        value.length > 0 ? (
          <IconButton
            icon="close"
            accessibilityLabel={t('input.clearSearch')}
            onPress={() => onChangeText('')}
            testID={rest.testID ? `${rest.testID}-clear` : undefined}
          />
        ) : undefined
      }
    />
  );
}
