import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { space } from '../../tokens';
import { t } from '../../strings';
import { syncDisplay } from './feedbackStyle';
import type { SyncState } from './feedbackStyle';

export interface SyncIndicatorProps {
  state: SyncState;
  compact?: boolean;
  testID?: string;
}

export function SyncIndicator({ state, compact = false, testID }: SyncIndicatorProps) {
  const display = syncDisplay(state);
  const label = t(display.labelKey);

  if (compact) {
    return (
      <View testID={testID} accessibilityLiveRegion="polite">
        <Icon
          name={display.icon}
          size="sm"
          tone={display.tone}
          accessibilityLabel={label}
          testID={testID && `${testID}-icon`}
        />
      </View>
    );
  }

  return (
    <View testID={testID} accessibilityLiveRegion="polite" style={styles.row}>
      <Icon name={display.icon} size="sm" tone={display.tone} testID={testID && `${testID}-icon`} />
      <Text
        variant="caption"
        tone={state === 'error' ? 'primary' : 'secondary'}
        testID={testID && `${testID}-label`}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
});
