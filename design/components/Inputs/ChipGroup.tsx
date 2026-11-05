import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from '../Foundations';
import { radius, space } from '../../tokens';
import { choiceCheckIcon, choiceColors, choiceLayout } from './choiceStyle';

export interface ChipGroupProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
  // Single mode only: lets tapping the selected chip clear the choice.
  allowNone?: boolean;
  disabled?: boolean;
  label?: string;
  testID?: string;
}

export function ChipGroup({
  options,
  selected,
  onChange,
  multi = false,
  allowNone = false,
  disabled = false,
  label,
  testID,
}: ChipGroupProps) {
  const pick = (value: string, isSelected: boolean) => {
    if (multi) {
      onChange(isSelected ? selected.filter((v) => v !== value) : [...selected, value]);
      return;
    }
    onChange(isSelected && allowNone ? [] : [value]);
  };

  return (
    <View testID={testID}>
      {label ? (
        <Text variant="caption" tone="secondary">
          {label}
        </Text>
      ) : null}
      <View style={styles.wrap}>
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          const c = choiceColors({ selected: isSelected, disabled });
          return (
            <Pressable
              key={option.value}
              testID={testID ? `${testID}-${option.value}` : undefined}
              accessibilityRole={multi ? 'checkbox' : 'radio'}
              accessibilityLabel={option.label}
              accessibilityState={{ checked: isSelected, disabled }}
              disabled={disabled}
              hitSlop={choiceLayout.hitSlop}
              onPress={() => pick(option.value, isSelected)}
              style={[styles.chip, { backgroundColor: c.bg }]}
            >
              {isSelected ? <Icon name={choiceCheckIcon} size="sm" color={c.icon} /> : null}
              <Text variant="callout" style={{ color: c.fg }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: choiceLayout.minHeight,
    paddingHorizontal: space.lg,
    borderRadius: radius.full,
  },
});
