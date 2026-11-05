import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../Foundations';
import { color, space } from '../../tokens';
import { choiceLayout } from './choiceStyle';

export interface RadioProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  testID?: string;
}

const RING = 22;
const DOT = 12;

export function Radio({ label, selected, onSelect, disabled = false, testID }: RadioProps) {
  // Unselected: a 2px grey ring on white. Selected: a blue ring with a blue dot.
  const accent = disabled ? color.text.secondary : color.action.primary;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      hitSlop={choiceLayout.hitSlop}
      onPress={onSelect}
      style={styles.row}
    >
      <View
        style={[
          styles.outer,
          {
            backgroundColor: disabled ? color.bg.subtle : color.bg.card,
            borderColor: selected ? accent : color.border.input,
          },
        ]}
      >
        {selected ? <View style={[styles.dot, { backgroundColor: accent }]} /> : null}
      </View>
      {/* Label sits on the screen, not in the ring, so it uses text colors only. */}
      <Text
        variant="body"
        style={[styles.label, { color: disabled ? color.text.secondary : color.text.primary }]}
      >
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
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  label: {
    flex: 1,
  },
});
