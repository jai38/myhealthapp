import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from '../Foundations';
import { color, space } from '../../tokens';
import { choiceCheckIcon, choiceColors, choiceLayout } from './choiceStyle';

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

const BOX = 22;

export function Checkbox({ label, checked, onChange, disabled = false, testID }: CheckboxProps) {
  // Unchecked: a 2px outline on a white card. Checked: a filled blue box, no outline.
  const c = choiceColors({ selected: checked, disabled });
  const boxStyle = checked
    ? { backgroundColor: c.bg, borderColor: c.border }
    : {
        backgroundColor: disabled ? color.bg.subtle : color.bg.card,
        borderColor: color.border.input,
      };
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      hitSlop={choiceLayout.hitSlop}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View style={[styles.box, boxStyle]}>
        {checked ? <Icon name={choiceCheckIcon} size="sm" color={c.icon} /> : null}
      </View>
      {/* Label sits on the screen, not in the box, so it uses text colors only. */}
      <Text
        variant="body"
        style={[styles.label, { color: disabled ? color.text.secondary : color.text.primary }]}
      >
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
    width: BOX,
    height: BOX,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
