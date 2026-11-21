import React from 'react';
import { StyleSheet, View } from 'react-native';
import { doseStatusDisplay } from '../../status';
import type { DoseDisplayState } from '../../status';
import { radius, space } from '../../tokens';
import { useTheme } from '../../theme';
import { t } from '../../strings';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { GradientFill } from './GradientFill';
import { doseChipColors } from './glassStyle';

export interface DoseChipProps {
  state: DoseDisplayState;
  formatTime: (d: Date) => string;
  testID?: string;
}

// v4 status chip: always an icon and a word, never colour alone. The words and icon come only
// from doseStatusDisplay, so an unrecorded past dose reads "Not confirmed", never Missed.
export function DoseChip({ state, formatTime, testID }: DoseChipProps) {
  const { color: c } = useTheme();
  const display = doseStatusDisplay(state, formatTime);
  const colors = doseChipColors(state, c);
  if (!display || !colors) return null;
  const label = t(display.labelKey, display.labelParams);
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={label}
      style={[styles.chip, { backgroundColor: colors.bg }]}
    >
      {colors.gradient ? (
        <GradientFill
          stops={[
            { offset: 0, color: colors.gradient.from },
            { offset: 1, color: colors.gradient.to },
          ]}
        />
      ) : null}
      <Icon name={display.icon} size="sm" color={colors.fg} />
      <Text variant="chip" tabular style={{ color: colors.fg }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xs,
    paddingHorizontal: space.sm + space.xxs,
    paddingVertical: space.xs,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
});
