import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme/index';

export interface DayItem {
  dayLabel: string; // 'M', 'T', 'W', etc.
  dateNumber: number; // 12, 13, 14...
  dateString: string; // YYYY-MM-DD
  isToday: boolean;
  hasActivity?: boolean;
  adherenceStatus?: 'complete' | 'partial' | 'pending' | 'none';
}

export interface HorizontalDateStripProps {
  days?: DayItem[];
  selectedDate?: string;
  onSelectDate?: (dateString: string) => void;
}

import { toLocalDateString } from '../services/medications/medication-store';

export const HorizontalDateStrip: React.FC<HorizontalDateStripProps> = ({
  days,
  selectedDate,
  onSelectDate,
}) => {
  // Generate 7 days of the current week if none provided
  const weekDays = React.useMemo(() => {
    if (days && days.length > 0) return days;

    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    // Adjust to Monday start
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const result: DayItem[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const isToday = d.toDateString() === today.toDateString();
      const dateString = toLocalDateString(d);

      let adherenceStatus: DayItem['adherenceStatus'] = 'none';
      if (d < today) {
        adherenceStatus = 'complete';
      } else if (isToday) {
        adherenceStatus = 'partial';
      }

      result.push({
        dayLabel: labels[i],
        dateNumber: d.getDate(),
        dateString,
        isToday,
        hasActivity: true,
        adherenceStatus,
      });
    }

    return result;
  }, [days]);

  const activeDate =
    selectedDate || weekDays.find((d) => d.isToday)?.dateString || weekDays[0]?.dateString;

  return (
    <View style={styles.container}>
      {weekDays.map((item) => {
        const isSelected = item.dateString === activeDate;

        return (
          <TouchableOpacity
            key={item.dateString}
            style={[styles.dayCard, isSelected && styles.dayCardSelected]}
            onPress={() => onSelectDate?.(item.dateString)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`${item.dayLabel} ${item.dateNumber}${item.isToday ? ' (Today)' : ''}`}
          >
            <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
              {item.dayLabel}
            </Text>
            <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
              {item.dateNumber}
            </Text>

            {/* Glowing Adherence indicator */}
            <View
              style={[
                styles.dot,
                item.adherenceStatus === 'complete' && styles.dotComplete,
                item.adherenceStatus === 'partial' && styles.dotPartial,
                isSelected && styles.dotSelected,
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        } as any)
      : shadows.sm),
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
    borderRadius: borderRadius.lg,
    marginHorizontal: 2,
  },
  dayCardSelected: {
    backgroundColor: colors.accentCoral,
    borderWidth: 1,
    borderColor: colors.accentCoralDark,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
        } as any)
      : shadows.sm),
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dayLabelSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dateNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  dateNumberSelected: {
    color: colors.textInverse,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
  },
  dotComplete: {
    backgroundColor: colors.accentMint,
  },
  dotPartial: {
    backgroundColor: colors.accentCustard,
  },
  dotSelected: {
    backgroundColor: '#FFFFFF',
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
