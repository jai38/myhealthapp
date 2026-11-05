import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card } from '../../design/components/Containers/Card';
import { Text } from '../../design/components/Foundations/Text';
import { color, radius, space } from '../../design/tokens';
import { t } from '../../design/strings';

export interface WeekDay {
  dayLabel: string;
  dateNumber: number;
  dateString: string;
  percentage: number;
  isToday: boolean;
  isSelected: boolean;
}

// Tapping a day bar selects that date. The bar height is the day's taken share.
export function WeeklyAdherenceCard({
  weekDays,
  setSelectedDate,
  totalDosesCount,
  adherencePct,
}: {
  weekDays: WeekDay[];
  setSelectedDate: (date: string) => void;
  totalDosesCount: number;
  adherencePct: number;
}) {
  return (
    <Card testID="medicines-week">
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="title3">{t('medicines.weekTitle')}</Text>
          <Text variant="caption" tone="secondary">
            {t('medicines.weekSubtitle')}
          </Text>
        </View>
        <View style={styles.rateChip}>
          <Text variant="bodyStrong" tone="link">
            {totalDosesCount > 0 ? `${adherencePct}%` : '—'}
          </Text>
        </View>
      </View>

      <View style={styles.bars}>
        {weekDays.map((item) => (
          <Pressable
            key={item.dateString}
            accessibilityRole="button"
            accessibilityLabel={t('medicines.dayAria', {
              date: new Date(`${item.dateString}T00:00:00`).toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
              }),
            })}
            accessibilityState={{ selected: item.isSelected }}
            onPress={() => setSelectedDate(item.dateString)}
            style={({ pressed }) => [
              styles.column,
              item.isSelected && styles.columnSelected,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    height: `${Math.max(15, item.percentage * 0.45)}%`,
                    backgroundColor: item.isSelected
                      ? color.action.primary
                      : item.percentage >= 100
                      ? color.action.secondary
                      : color.bg.subtle,
                  },
                ]}
              />
            </View>
            <Text
              variant="caption"
              tone={item.isToday || item.isSelected ? 'primary' : 'secondary'}
              style={item.isToday ? styles.todayLabel : undefined}
            >
              {item.dayLabel}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  headerText: {
    flex: 1,
    gap: space.xxs,
  },
  rateChip: {
    backgroundColor: color.bg.tintBlue,
    borderRadius: radius.full,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  bars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.lg,
    gap: space.xxs,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.md,
  },
  columnSelected: {
    backgroundColor: color.bg.tintBlue,
  },
  pressed: {
    opacity: 0.7,
  },
  track: {
    width: 12,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: color.bg.subtle,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    borderRadius: radius.full,
  },
  todayLabel: {
    fontWeight: '700',
  },
});
