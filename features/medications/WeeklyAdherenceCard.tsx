import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/index';
import { styles } from './styles-schedule';

export interface WeekDay {
  dayLabel: string;
  dateNumber: number;
  dateString: string;
  percentage: number;
  isToday: boolean;
  isSelected: boolean;
}

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
    <>
            {/* 2. WEEKLY ADHERENCE BAR CHART (Interactive Tappable Day Selector) */}
            <View style={styles.adherenceCard}>
              <View style={styles.adherenceHeaderRow}>
                <View>
                  <Text style={styles.adherenceTitle}>Weekly Adherence</Text>
                  <Text style={styles.adherenceSubtitle}>
                    Tap any day bar to view its medication schedule
                  </Text>
                </View>
                <View style={styles.adherenceRateBadge}>
                  <Text style={styles.adherenceRateText}>{totalDosesCount > 0 ? `${adherencePct}%` : '—'}</Text>
                </View>
              </View>

              <View style={styles.adherenceBarsRow}>
                {weekDays.map((item, idx) => {
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.adherenceCol, item.isSelected && styles.adherenceColSelected]}
                      onPress={() => setSelectedDate(item.dateString)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.adherenceTrack}>
                        <View
                          style={[
                            styles.adherenceFill,
                            {
                              height: `${Math.max(15, item.percentage * 0.45)}%`,
                              backgroundColor: item.isSelected
                                ? colors.accentCoral
                                : item.percentage >= 100
                                ? colors.accentMint
                                : colors.surfaceSecondary,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.adherenceDayLabel,
                          item.isSelected && styles.adherenceDayLabelSelected,
                          item.isToday && styles.adherenceDayLabelToday,
                        ]}
                      >
                        {item.dayLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
    </>
  );
}
