import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { size, space } from '../../tokens';
import { t } from '../../strings';

export interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
  testID?: string;
}

export function SectionHeader({
  title,
  onViewAll,
  viewAllLabel = t('common.viewAll'),
  testID,
}: SectionHeaderProps) {
  return (
    <View style={styles.row} testID={testID}>
      <Text variant="title2" tone="primary" accessibilityRole="header" style={styles.title} testID={testID && `${testID}-title`}>
        {title}
      </Text>
      {onViewAll !== undefined && (
        <Pressable
          testID={testID && `${testID}-view-all`}
          accessibilityRole="button"
          accessibilityLabel={viewAllLabel}
          onPress={onViewAll}
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
        >
          <Text variant="bodyStrong" tone="link">
            {viewAllLabel}
          </Text>
          <Icon name="chevron-forward" size="sm" tone="link" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: size.touchMin,
  },
  title: {
    flexShrink: 1,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: size.touchMin,
    minWidth: size.touchMin,
    gap: space.xs,
  },
  pressed: {
    opacity: 0.7,
  },
});
