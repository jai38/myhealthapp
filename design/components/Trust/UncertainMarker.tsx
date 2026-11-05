import React from 'react';
import { View } from 'react-native';
import { trustLabelDisplay } from '../../status';
import { space } from '../../tokens';
import { t } from '../../strings';
import { Text } from '../Foundations/Text';
import { StatusPill } from './StatusPill';

export interface UncertainMarkerProps {
  inline?: boolean;
  testID?: string;
}

export function UncertainMarker({ inline = false, testID }: UncertainMarkerProps) {
  const display = trustLabelDisplay('uncertain');
  const label = t(display.labelKey);
  const hint = t('trust.uncertainHint');
  return (
    <View
      testID={testID}
      accessible
      // The hint is always spoken, even when it is not shown on screen.
      accessibilityLabel={`${label}. ${hint}`}
      style={{ alignSelf: 'flex-start', gap: space.xxs }}
    >
      {/* Children are hidden so screen readers read only the combined label above, once. */}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ gap: space.xxs }}
      >
        <StatusPill display={display} testID={testID && `${testID}-pill`} />
        {inline ? null : (
          <Text
            variant="caption"
            tone="secondary"
            testID={testID && `${testID}-hint`}
          >
            {hint}
          </Text>
        )}
      </View>
    </View>
  );
}
