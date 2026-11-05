import React from 'react';
import { Pressable, StyleSheet, Switch as RNSwitch, View } from 'react-native';
import { Text } from '../Foundations';
import { color, space } from '../../tokens';
import { choiceLayout } from './choiceStyle';

export interface SwitchProps {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  helper?: string;
  testID?: string;
}

// The whole row is the touch target. The native switch inside it is visual.
export function Switch({
  label,
  value,
  onValueChange,
  disabled = false,
  helper,
  testID,
}: SwitchProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={helper}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={choiceLayout.hitSlop}
      onPress={() => onValueChange(!value)}
      style={styles.row}
    >
      <View style={styles.text}>
        <Text variant="body">{label}</Text>
        {helper ? (
          <Text variant="caption" tone="secondary">
            {helper}
          </Text>
        ) : null}
      </View>
      {/* Visual only: the row handles the press, so the value cannot toggle twice. */}
      <View pointerEvents="none" importantForAccessibility="no-hide-descendants">
        <RNSwitch
          value={value}
          disabled={disabled}
          trackColor={{ false: color.border.input, true: color.action.primary }}
          thumbColor={color.bg.card}
          // Web only (react-native-web); otherwise the thumb turns teal when on.
          {...({ activeThumbColor: color.bg.card } as object)}
          ios_backgroundColor={color.border.input}
        />
      </View>
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
  text: {
    flex: 1,
  },
});
