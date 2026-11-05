import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../Foundations';
import { size, space } from '../../tokens';
import { choiceColors, choiceLayout } from './choiceStyle';

export interface RadioProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  testID?: string;
}

export function Radio({ label, selected, onSelect, disabled = false, testID }: RadioProps) {
  const c = choiceColors({ selected, disabled });
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onSelect}
      style={styles.row}
    >
      <View style={[styles.outer, { backgroundColor: c.bg, borderColor: c.border }]}>
        {selected ? <View style={[styles.dot, { backgroundColor: c.icon }]} /> : null}
      </View>
      <Text variant="body" style={[styles.label, { color: c.fg }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export interface RadioGroupProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (next: T) => void;
  disabled?: boolean;
  testID?: string;
}

export function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  testID,
}: RadioGroupProps<T>) {
  return (
    <View testID={testID} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      {options.map((option) => (
        <Radio
          key={option.value}
          testID={testID ? `${testID}-${option.value}` : undefined}
          label={option.label}
          selected={option.value === value}
          disabled={disabled}
          onSelect={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: choiceLayout.minHeight,
  },
  outer: {
    width: size.iconLg,
    height: size.iconLg,
    borderRadius: size.iconLg / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: size.iconMd - 4,
    height: size.iconMd - 4,
    borderRadius: (size.iconMd - 4) / 2,
  },
  label: {
    flex: 1,
  },
});
