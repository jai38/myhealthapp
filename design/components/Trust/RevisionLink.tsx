import React from 'react';
import { Pressable } from 'react-native';
import { size, space } from '../../tokens';
import { t } from '../../strings';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';

export interface RevisionLinkProps {
  onPress: () => void;
  count?: number;
  testID?: string;
}

// Link colour is for white backgrounds only. On Cool Grey it fails 4.5:1,
// so place this link on bg.screen.
export function RevisionLink({ onPress, count, testID }: RevisionLinkProps) {
  const base = t('trust.revisions');
  const label = count !== undefined && count > 1 ? `${base} (${count})` : base;
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: space.xs,
        minHeight: size.touchMin,
      }}
    >
      <Icon name="git-compare-outline" size="sm" tone="link" testID={testID && `${testID}-icon`} />
      <Text variant="callout" tone="link" testID={testID && `${testID}-label`}>
        {label}
      </Text>
    </Pressable>
  );
}
