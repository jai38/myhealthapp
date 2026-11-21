import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { radius, space } from '../../tokens';
import { useTheme } from '../../theme';
import { t } from '../../strings';
import { Text } from '../Foundations/Text';
import { atTime, clampToMax, wheelHours, wheelMinutes } from './glassStyle';

export interface TimeWheelProps {
  /** The chosen time. Its date is the day the wheel picks on. */
  value: Date;
  onChange: (next: Date) => void;
  /** Latest time allowed (S07: now). Later hours and minutes are not offered. */
  max?: Date | null;
  formatHour?: (hour: number) => string;
  testID?: string;
}

const ROW = 44;
const VISIBLE = 5;
const pad2 = (n: number) => String(n).padStart(2, '0');

function Column({
  items,
  selected,
  label,
  render,
  onSelect,
  testID,
}: {
  items: number[];
  selected: number;
  label: string;
  render: (n: number) => string;
  onSelect: (n: number) => void;
  testID?: string;
}) {
  const { color: c } = useTheme();
  const ref = useRef<ScrollView>(null);
  const index = Math.max(0, items.indexOf(selected));

  useEffect(() => {
    ref.current?.scrollTo?.({ y: index * ROW, animated: false });
  }, [index]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ROW);
    const n = items[Math.min(items.length - 1, Math.max(0, i))];
    if (n !== undefined && n !== selected) onSelect(n);
  };

  return (
    <View style={styles.column} accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ text: render(selected) }}>
      <View pointerEvents="none" style={[styles.band, { backgroundColor: c.bg.tintBlue }]} />
      <ScrollView
        ref={ref}
        testID={testID}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW}
        decelerationRate="fast"
        onMomentumScrollEnd={onEnd}
        contentContainerStyle={{ paddingVertical: ROW * Math.floor(VISIBLE / 2) }}
      >
        {items.map((n) => {
          const isSelected = n === selected;
          return (
            <Pressable
              key={n}
              testID={testID && `${testID}-${n}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(n)}
              style={styles.cell}
            >
              <Text
                variant={isSelected ? 'title3' : 'body'}
                tabular
                style={{ color: isSelected ? c.text.primary : c.text.tertiary }}
              >
                {render(n)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// v4 time wheel (S07 "Other time"): an hour and a minute column on the value's day. Nothing
// after `max` is offered, and a change that would pass it is pulled back to `max`.
export function TimeWheel({ value, onChange, max, formatHour = pad2, testID }: TimeWheelProps) {
  const hours = wheelHours(value, max);
  const hour = value.getHours();
  const minutes = wheelMinutes(value, hour, max);
  const minute = value.getMinutes() - (value.getMinutes() % 5);

  const set = (h: number, m: number) => {
    const allowed = wheelMinutes(value, h, max);
    const mm = allowed.includes(m) ? m : (allowed[allowed.length - 1] ?? 0);
    onChange(clampToMax(atTime(value, h, mm), max));
  };

  return (
    <View testID={testID} style={styles.wheel}>
      <Column
        items={hours}
        selected={hour}
        label={t('wheel.hour')}
        render={formatHour}
        onSelect={(h) => set(h, minute)}
        testID={testID && `${testID}-hour`}
      />
      <Text variant="title3">:</Text>
      <Column
        items={minutes}
        selected={minute}
        label={t('wheel.minute')}
        render={pad2}
        onSelect={(m) => set(hour, m)}
        testID={testID && `${testID}-minute`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.md },
  column: { width: 88, height: ROW * VISIBLE, overflow: 'hidden' },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ROW * Math.floor(VISIBLE / 2),
    height: ROW,
    borderRadius: radius.input,
  },
  cell: { height: ROW, alignItems: 'center', justifyContent: 'center' },
});
