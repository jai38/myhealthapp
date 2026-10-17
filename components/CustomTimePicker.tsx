import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/index';
import { getTimePeriodIcon } from '../features/medications/reminder-time-utils';

export interface CustomTimePickerProps {
  onAddTime: (time24: string) => void;
  existingTimes?: string[];
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  onAddTime,
  existingTimes = [],
}) => {
  const [hour, setHour] = useState<number>(8);
  const [minute, setMinute] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [feedback, setFeedback] = useState<string | null>(null);

  const incrementHour = () => {
    setHour((prev) => (prev >= 12 ? 1 : prev + 1));
  };

  const decrementHour = () => {
    setHour((prev) => (prev <= 1 ? 12 : prev - 1));
  };

  const incrementMinute = (step: number = 5) => {
    setMinute((prev) => (prev + step) % 60);
  };

  const decrementMinute = (step: number = 5) => {
    setMinute((prev) => (prev - step < 0 ? 60 + (prev - step) : prev - step));
  };

  const getTime24 = (h: number, m: number, p: 'AM' | 'PM'): string => {
    let h24 = h;
    if (p === 'PM' && h24 !== 12) h24 += 12;
    if (p === 'AM' && h24 === 12) h24 = 0;
    const hh = String(h24).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const formatted12h = `${hour}:${String(minute).padStart(2, '0')} ${period}`;
  const currentTime24 = getTime24(hour, minute, period);

  const getTimePeriodLabel = (time24: string): { label: string; icon: string } => {
    const icon = getTimePeriodIcon(time24);
    const h24 = parseInt(time24.split(':')[0] || '0', 10);
    if (h24 >= 5 && h24 < 12) return { label: 'Morning', icon };
    if (h24 >= 12 && h24 < 17) return { label: 'Afternoon', icon };
    if (h24 >= 17 && h24 < 21) return { label: 'Evening', icon };
    return { label: 'Night / Bedtime', icon };
  };

  const periodInfo = getTimePeriodLabel(currentTime24);

  const handleAdd = () => {
    if (existingTimes.includes(currentTime24)) {
      Alert.alert(
        'Time Already Scheduled',
        `A reminder for ${formatted12h} is already in your active schedule.`
      );
      return;
    }
    onAddTime(currentTime24);
    setFeedback(`Added ${formatted12h}`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleWebTimeChange = (val: string) => {
    if (!val || !val.includes(':')) return;
    const [hStr, mStr] = val.split(':');
    const hNum = parseInt(hStr || '0', 10);
    const mNum = parseInt(mStr || '0', 10);
    if (isNaN(hNum) || isNaN(mNum)) return;

    if (hNum === 0) {
      setHour(12);
      setPeriod('AM');
    } else if (hNum < 12) {
      setHour(hNum);
      setPeriod('AM');
    } else if (hNum === 12) {
      setHour(12);
      setPeriod('PM');
    } else {
      setHour(hNum - 12);
      setPeriod('PM');
    }
    setMinute(mNum);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Custom Time</Text>

      {/* Main Time Picker Control Row */}
      <View style={styles.pickerRow}>
        {/* Hour Stepper */}
        <View style={styles.unitBox}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={incrementHour}
            accessibilityLabel="Increase hour"
          >
            <Text style={styles.stepBtnText}>▲</Text>
          </TouchableOpacity>
          <View style={styles.digitContainer}>
            <Text style={styles.digitText}>{String(hour).padStart(2, '0')}</Text>
          </View>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={decrementHour}
            accessibilityLabel="Decrease hour"
          >
            <Text style={styles.stepBtnText}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.unitLabel}>Hour</Text>
        </View>

        <Text style={styles.colonText}>:</Text>

        {/* Minute Stepper */}
        <View style={styles.unitBox}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => incrementMinute(5)}
            accessibilityLabel="Increase minute"
          >
            <Text style={styles.stepBtnText}>▲</Text>
          </TouchableOpacity>
          <View style={styles.digitContainer}>
            <Text style={styles.digitText}>{String(minute).padStart(2, '0')}</Text>
          </View>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => decrementMinute(5)}
            accessibilityLabel="Decrease minute"
          >
            <Text style={styles.stepBtnText}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.unitLabel}>Minute</Text>
        </View>

        {/* AM / PM Segmented Control */}
        <View style={styles.amPmContainer}>
          <TouchableOpacity
            style={[styles.amPmBtn, period === 'AM' && styles.amPmBtnActive]}
            onPress={() => setPeriod('AM')}
          >
            <Text style={[styles.amPmText, period === 'AM' && styles.amPmTextActive]}>
              AM
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.amPmBtn, period === 'PM' && styles.amPmBtnActive]}
            onPress={() => setPeriod('PM')}
          >
            <Text style={[styles.amPmText, period === 'PM' && styles.amPmTextActive]}>
              PM
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Minute Selection Chips */}
      <View style={styles.quickMinuteRow}>
        <Text style={styles.quickMinuteLabel}>Quick minute:</Text>
        {[0, 15, 30, 45].map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.quickMinuteChip, minute === m && styles.quickMinuteChipActive]}
            onPress={() => setMinute(m)}
          >
            <Text
              style={[
                styles.quickMinuteChipText,
                minute === m && styles.quickMinuteChipTextActive,
              ]}
            >
              :{String(m).padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Web Native Clock Picker */}
      {Platform.OS === 'web' && (
        <View style={styles.webRow}>
          <Text style={styles.webHelpText}>Or choose via clock:</Text>
          {React.createElement('input', {
            type: 'time',
            value: currentTime24,
            onChange: (e: any) => handleWebTimeChange(e.target.value),
            style: {
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1.5px solid #0d9488',
              backgroundColor: '#f0fdfa',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'inherit',
            },
          })}
        </View>
      )}

      {/* Live Preview & Status */}
      <View style={styles.previewRow}>
        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeText}>
            {periodInfo.icon} {formatted12h} • {periodInfo.label}
          </Text>
        </View>
        {feedback && <Text style={styles.feedbackText}>✓ {feedback}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  unitBox: {
    alignItems: 'center',
    width: 52,
  },
  stepBtn: {
    width: 44,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.sm,
  },
  stepBtnText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  digitContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    width: 48,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  digitText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  unitLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  colonText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginTop: -16,
  },
  amPmContainer: {
    flexDirection: 'column',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginLeft: 2,
    marginRight: 6,
    marginTop: -14,
  },
  amPmBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  amPmBtnActive: {
    backgroundColor: colors.primary,
  },
  amPmText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  amPmTextActive: {
    color: '#ffffff',
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    marginTop: -14,
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: 'rgba(255, 255, 255, 0.65)',
  },
  addBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '800',
  },
  quickMinuteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.xs,
  },
  quickMinuteLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginRight: 2,
  },
  quickMinuteChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  quickMinuteChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  quickMinuteChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickMinuteChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  webRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  webHelpText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
});
