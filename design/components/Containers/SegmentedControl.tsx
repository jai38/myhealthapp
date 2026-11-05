import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../Foundations/Text';
import { color, elevation, radius, space } from '../../tokens';

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
  return (
    <View accessibilityRole="tablist" style={styles.track} testID={testID}>
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
            style={[styles.segment, selected && styles.selected]}
          >
            <Text
              variant={selected ? 'bodyStrong' : 'body'}
              tone={selected ? 'primary' : 'secondary'}
              align="center"
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
    backgroundColor: color.bg.subtle,
    borderRadius: radius.md,
    padding: space.xxs,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md - space.xxs,
    paddingHorizontal: space.sm,
  },
  // The selected segment lifts off the track as a white pill with a soft shadow.
  selected: {
    backgroundColor: color.bg.card,
    ...elevation.card,
  },
});
