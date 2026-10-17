import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/index';

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
      const dateString = d.toISOString().split('T')[0];

      // Simulated adherence status for display
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

  const activeDate = selectedDate || weekDays.find((d) => d.isToday)?.dateString || weekDays[0]?.dateString;

  return (
    <View style={styles.container}>
      {weekDays.map((item) => {
        const isSelected = item.dateString === activeDate;

        return (
          <TouchableOpacity
            key={item.dateString}
            style={[
              styles.dayCard,
              isSelected && styles.dayCardSelected,
            ]}
            onPress={() => onSelectDate?.(item.dateString)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${item.dayLabel} ${item.dateNumber}${item.isToday ? ' (Today)' : ''}`}
          >
            <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
              {item.dayLabel}
            </Text>
            <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
              {item.dateNumber}
            </Text>

            {/* Adherence indicator dot */}
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
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 18px rgba(17, 20, 24, 0.03)',
        } as any)
      : {}),
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
    borderRadius: borderRadius.lg,
  },
  dayCardSelected: {
    backgroundColor: colors.primary,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 6px 16px rgba(17, 20, 24, 0.22)',
        } as any)
      : {}),
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  dateNumberSelected: {
    color: colors.textInverse,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  dotComplete: {
    backgroundColor: colors.accentMint,
  },
  dotPartial: {
    backgroundColor: colors.accentCoral,
  },
  dotSelected: {
    backgroundColor: colors.accentCoral,
  },
});
