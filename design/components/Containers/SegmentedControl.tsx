import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../Foundations/Text';
import { radius, space } from '../../tokens';
import { useTheme } from '../../theme';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedControlProps<T>) {
  const { color: c, shadow } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.track, { backgroundColor: c.dose.upcoming.bg }]}
      testID={testID}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            testID={testID && `${testID}-${option.value}`}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            hitSlop={SEGMENT_HIT_SLOP}
            style={[styles.segment, selected && [{ backgroundColor: c.bg.surface }, shadow.card]]}
          >
            <Text
              variant={selected ? 'bodyStrong' : 'body'}
              align="center"
              numberOfLines={1}
              style={{ color: selected ? c.text.primary : c.text.secondary }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Segments are 36 tall; 6dp of slop above and below keeps the touch target at 48.
const SEGMENT_HIT_SLOP = { top: 6, bottom: 6 } as const;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    // v4: a pill track with a pill segment.
    borderRadius: radius.full,
    padding: space.xxs,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
  },
});
