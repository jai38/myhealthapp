import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { radius, size, space } from '../../tokens';
import { useTheme } from '../../theme';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';

export interface RadioOptionRowProps {
  label: string;
  /** One short line under the label. */
  detail?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

// v4 radio option row, as in S07's "Did you take this dose?": a full-width glass row with a
// radio mark; the chosen row gets a blue edge.
export function RadioOptionRow({ label, detail, selected, onPress, disabled = false, testID }: RadioOptionRowProps) {
  const { color: c } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: selected ? c.bg.tintBlue : c.bg.glass,
          borderColor: selected ? c.action.blue : c.bg.divider,
        },
        (pressed || disabled) && styles.dim,
      ]}
    >
      <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size="lg" color={selected ? c.action.blue : c.text.tertiary} />
      <View style={styles.words}>
        <Text variant="title3" style={{ color: c.text.primary }}>
          {label}
        </Text>
        {detail ? (
          <Text variant="caption" style={{ color: c.text.secondary }}>
            {detail}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: size.touchMin + space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.input,
    borderWidth: 1,
  },
  words: { flex: 1, gap: space.xxs },
  dim: { opacity: 0.6 },
});
