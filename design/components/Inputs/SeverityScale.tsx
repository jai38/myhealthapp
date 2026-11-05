import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../Foundations';
import { color, elevation, font, radius, space } from '../../tokens';
import { t } from '../../strings';
import type { StringKey } from '../../strings';

export type Severity = 1 | 2 | 3 | 4 | 5;

export interface SeverityScaleProps {
  label: string;
  value: Severity | null;
  onChange: (next: Severity) => void;
  disabled?: boolean;
  testID?: string;
}

const LEVELS: Severity[] = [1, 2, 3, 4, 5];

// One segmented track. Every segment uses the same neutral colors: severity is
// never implied by color. The selected segment is a raised white card with a
// bold number, so the selection is also a shape change.
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
      <View style={styles.track}>
        {LEVELS.map((level) => {
          const selected = value === level;
          const word = t(`severity.${level}` as StringKey);
          const ink = selected ? color.text.primary : color.text.secondary;
          return (
            <Pressable
              key={level}
              testID={testID ? `${testID}-${level}` : undefined}
              accessibilityRole="radio"
              accessibilityLabel={word}
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(level)}
              style={[styles.segment, selected ? styles.selected : null]}
            >
              <Text
                variant="title3"
                style={[
                  styles.number,
                  { color: ink, fontFamily: selected ? font.semibold : font.regular },
                ]}
              >
                {level}
              </Text>
              <Text variant="caption" style={[styles.word, { color: ink }]}>
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
  track: {
    flexDirection: 'row',
    marginTop: space.xs,
    padding: space.xxs,
    borderRadius: radius.md,
    backgroundColor: color.bg.subtle,
  },
  segment: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xs,
    paddingHorizontal: space.xxs,
    borderRadius: radius.md - space.xxs,
  },
  // A blue outline as well as the white fill, so the choice is clear on Android,
  // where the shadow does not show.
  selected: {
    backgroundColor: color.bg.card,
    borderWidth: 1.5,
    borderColor: color.action.primary,
    ...elevation.card,
  },
  number: {
    textAlign: 'center',
  },
  word: {
    textAlign: 'center',
  },
});
