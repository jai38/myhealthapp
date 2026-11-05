import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from '../Foundations';
import { radius, size, space } from '../../tokens';
import { choiceCheckIcon, choiceColors, choiceLayout } from './choiceStyle';

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

export function Checkbox({ label, checked, onChange, disabled = false, testID }: CheckboxProps) {
  const c = choiceColors({ selected: checked, disabled });
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View style={[styles.box, { backgroundColor: c.bg, borderColor: c.border }]}>
        {checked ? <Icon name={choiceCheckIcon} size="sm" color={c.icon} /> : null}
      </View>
      <Text variant="body" style={[styles.label, { color: c.fg }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: choiceLayout.minHeight,
  },
  box: {
    width: size.iconLg,
    height: size.iconLg,
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
