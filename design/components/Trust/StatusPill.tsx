import React from 'react';
import { View } from 'react-native';
import type { StatusDisplay } from '../../status';
import { space } from '../../tokens';
import { t } from '../../strings';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { pillColors, pillLayout } from './trustStyle';

export interface StatusPillProps {
  display: StatusDisplay | null;
  testID?: string;
}

// Displays a status result. It never decides a status itself.
export function StatusPill({ display, testID }: StatusPillProps) {
  if (display === null) return null;
  const colors = pillColors(display);
  const label = t(display.labelKey, display.labelParams);
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        maxWidth: '100%',
        gap: space.xs,
        minHeight: pillLayout.minHeight,
        paddingHorizontal: pillLayout.paddingHorizontal,
        borderRadius: pillLayout.borderRadius,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
      }}
    >
      <Icon
        name={display.icon}
        size="sm"
        color={colors.fg}
        testID={testID && `${testID}-icon`}
      />
      <Text
        variant="caption"
        style={{ color: colors.fg, flexShrink: 1 }}
        testID={testID && `${testID}-label`}
      >
        {label}
      </Text>
    </View>
  );
}
