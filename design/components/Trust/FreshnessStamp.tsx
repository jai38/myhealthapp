import React from 'react';
import { View } from 'react-native';
import type { StatusDisplay } from '../../status';
import { space } from '../../tokens';
import { t } from '../../strings';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { isStale } from './trustStyle';
import { StatusPill } from './StatusPill';

export interface FreshnessStampProps {
  asOf: Date;
  now: Date;
  formatDate: (d: Date) => string;
  staleAfterDays?: number;
  testID?: string;
}

const OUTDATED: StatusDisplay = {
  labelKey: 'trust.outdated',
  tone: 'caution',
  variant: 'soft',
  icon: 'alert-circle-outline',
};

export function FreshnessStamp({
  asOf,
  now,
  formatDate,
  staleAfterDays = 90,
  testID,
}: FreshnessStampProps) {
  const stale = isStale(asOf, now, staleAfterDays);
  return (
    <View
      testID={testID}
      style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm }}
    >
      <Icon name="time-outline" size="sm" tone="secondary" testID={testID && `${testID}-icon`} />
      <Text variant="caption" tone="secondary" testID={testID && `${testID}-text`}>
        {t('trust.asOf', { date: formatDate(asOf) })}
      </Text>
      {stale ? <StatusPill display={OUTDATED} testID={testID && `${testID}-outdated`} /> : null}
    </View>
  );
}
