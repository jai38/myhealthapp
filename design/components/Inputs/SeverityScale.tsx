import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../Foundations';
import { radius, space } from '../../tokens';
import { t } from '../../strings';
import type { StringKey } from '../../strings';
import { choiceColors, choiceLayout } from './choiceStyle';

export type Severity = 1 | 2 | 3 | 4 | 5;

export interface SeverityScaleProps {
  label: string;
  value: Severity | null;
  onChange: (next: Severity) => void;
  disabled?: boolean;
  testID?: string;
}

const LEVELS: Severity[] = [1, 2, 3, 4, 5];

// Same neutral colors for every segment. Severity is never implied by color:
// the selected segment is marked by a thicker border and its checked state.
export function SeverityScale({
  label,
  value,
  onChange,
  disabled = false,
  testID,
}: SeverityScaleProps) {
  return (
    <View testID={testID} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <View style={styles.row}>
        {LEVELS.map((level) => {
          const selected = value === level;
          const c = choiceColors({ selected, disabled });
          const word = t(`severity.${level}` as StringKey);
          return (
            <Pressable
              key={level}
              testID={testID ? `${testID}-${level}` : undefined}
              accessibilityRole="radio"
              accessibilityLabel={word}
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(level)}
              style={[
                styles.segment,
                {
                  backgroundColor: c.bg,
                  borderColor: c.border,
                  borderWidth: selected ? 3 : 1,
                },
              ]}
            >
              <Text variant="title3" tone="primary" style={{ color: c.fg }}>
                {level}
              </Text>
              <Text variant="caption" style={[styles.word, { color: c.fg }]}>
                {word}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.xxs,
    marginTop: space.xs,
  },
  segment: {
    flex: 1,
    minHeight: choiceLayout.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xs,
    paddingHorizontal: space.xxs,
    borderRadius: radius.md,
  },
  word: {
    textAlign: 'center',
  },
});
