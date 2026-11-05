import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../design/components/Foundations/Text';
import { color, radius, size, space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { StringKey } from '../../design/strings';
import { toLocalDateString, medicationStore } from '../../services/medications/medication-store';
import { adherenceDotStatus } from './adherenceDots';

// Design-token version of components/HorizontalDateStrip with the same props and behavior.
// It shows the trailing seven days ending today, with a dot per day for adherence.

export interface DayItem {
  dayLabel: string;
  dateNumber: number;
  dateString: string; // YYYY-MM-DD
  isToday: boolean;
  hasActivity?: boolean;
  adherenceStatus?: 'complete' | 'partial' | 'pending' | 'none';
}

export interface TimelineDateStripProps {
  days?: DayItem[];
  selectedDate?: string;
  onSelectDate?: (dateString: string) => void;
}

const WEEKDAY_KEYS: StringKey[] = [
  'records.timeline.weekday.sun',
  'records.timeline.weekday.mon',
  'records.timeline.weekday.tue',
  'records.timeline.weekday.wed',
  'records.timeline.weekday.thu',
  'records.timeline.weekday.fri',
  'records.timeline.weekday.sat',
];

function buildWeek(): DayItem[] {
  const today = new Date();
  const result: DayItem[] = [];

  // Six days of recent history, then today.
  for (let offset = -6; offset <= 0; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);

    const isToday = offset === 0;
    const dateString = toLocalDateString(d);
    const adherence = medicationStore.getAdherenceForDate(dateString, Date.now());
    const adherenceStatus = adherenceDotStatus(adherence);

    result.push({
      dayLabel: isToday ? t('records.timeline.todayShort') : t(WEEKDAY_KEYS[d.getDay()]),
      dateNumber: d.getDate(),
      dateString,
      isToday,
      hasActivity: adherence.total > 0,
      adherenceStatus,
    });
  }

  return result;
}

export function TimelineDateStrip({ days, selectedDate, onSelectDate }: TimelineDateStripProps) {
  const weekDays = React.useMemo(() => {
    if (days && days.length > 0) return days;
    return buildWeek();
  }, [days]);

  const activeDate =
    selectedDate || weekDays.find((d) => d.isToday)?.dateString || weekDays[weekDays.length - 1]?.dateString;

  return (
    <View style={styles.container}>
      {weekDays.map((item) => {
        const isSelected = item.dateString === activeDate;
        const label = item.isToday
          ? t('records.timeline.a11yToday', { day: item.dayLabel, date: item.dateNumber })
          : t('records.timeline.a11yDay', { day: item.dayLabel, date: item.dateNumber });

        return (
          <Pressable
            key={item.dateString}
            style={({ pressed }) => [
              styles.dayCard,
              isSelected && styles.dayCardSelected,
              pressed && styles.pressed,
            ]}
            onPress={() => onSelectDate?.(item.dateString)}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              variant="overline"
              tone={isSelected ? 'inverse' : item.isToday ? 'link' : 'tertiary'}
              numberOfLines={1}
              style={styles.dayLabel}
            >
              {item.dayLabel}
            </Text>
            <Text
              variant="bodyStrong"
              tone={isSelected ? 'inverse' : 'primary'}
              style={styles.dateNumber}
            >
              {item.dateNumber}
            </Text>
            <View
              style={[
                styles.dot,
                item.adherenceStatus === 'complete' && styles.dotComplete,
                item.adherenceStatus === 'partial' && styles.dotPartial,
                isSelected && styles.dotSelected,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: color.bg.card,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
    paddingHorizontal: space.xs,
    marginBottom: space.md,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: size.touchMin,
    paddingVertical: space.xs,
    borderRadius: radius.md,
    marginHorizontal: space.xxs,
  },
  dayCardSelected: {
    backgroundColor: color.action.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  dayLabel: {
    marginBottom: space.xxs,
  },
  dateNumber: {
    marginBottom: space.xs,
  },
  dot: {
    width: space.xs,
    height: space.xs,
    borderRadius: space.xxs,
    backgroundColor: color.border.subtle,
  },
  dotComplete: {
    backgroundColor: color.tone.success.fg,
  },
  dotPartial: {
    backgroundColor: color.tone.caution.fg,
  },
  dotSelected: {
    backgroundColor: color.text.inverse,
  },
});
