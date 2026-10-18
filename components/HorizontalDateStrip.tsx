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

import { toLocalDateString, medicationStore } from '../services/medications/medication-store';

export const HorizontalDateStrip: React.FC<HorizontalDateStripProps> = ({
  days,
  selectedDate,
  onSelectDate,
}) => {
  // Generate trailing 7 days leading up to Today so users can inspect past history and adherence
  const weekDays = React.useMemo(() => {
    if (days && days.length > 0) return days;

    const today = new Date();
    const todayDateStr = toLocalDateString(today);
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const result: DayItem[] = [];

    // 6 days of recent past history + Today
    for (let offset = -6; offset <= 0; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);

      const isToday = offset === 0;
      const dateString = toLocalDateString(d);
      const adherence = medicationStore.getAdherenceForDate(dateString);

      let adherenceStatus: DayItem['adherenceStatus'] = 'none';
      if (adherence.total > 0) {
        if (adherence.taken === adherence.total) {
          adherenceStatus = 'complete';
        } else if (adherence.taken > 0) {
          adherenceStatus = 'partial';
        } else {
          adherenceStatus = 'pending';
        }
      }

      result.push({
        dayLabel: isToday ? 'TODAY' : dayNames[d.getDay()],
        dateNumber: d.getDate(),
        dateString,
        isToday,
        hasActivity: adherence.total > 0,
        adherenceStatus,
      });
    }

    return result;
  }, [days]);

  const activeDate =
    selectedDate || weekDays.find((d) => d.isToday)?.dateString || weekDays[weekDays.length - 1]?.dateString;

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
            <Text
              style={[
                styles.dayLabel,
                item.isToday && styles.dayLabelToday,
                isSelected && styles.dayLabelSelected,
              ]}
              numberOfLines={1}
            >
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
  dayLabelToday: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.accentCoral,
  },
  dayLabelSelected: {
    color: 'rgba(255, 255, 255, 0.95)',
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
