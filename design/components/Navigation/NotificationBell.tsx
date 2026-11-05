import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from '../Actions/IconButton';
import { Text } from '../Foundations/Text';
import { color, font, radius, size, space } from '../../tokens';
import { badgeText, bellLabel } from './navStyle';

export interface NotificationBellProps {
  count: number;
  onPress: () => void;
  testID?: string;
}

export function NotificationBell({ count, onPress, testID }: NotificationBellProps) {
  const badge = badgeText(count);
  return (
    <View style={styles.wrap}>
      <IconButton
        icon="notifications-outline"
        accessibilityLabel={bellLabel(count)}
        onPress={onPress}
        testID={testID}
      />
      {badge !== null ? (
        // The badge is decorative: the button label already carries the count.
        <View
          testID={testID && `${testID}-badge`}
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={styles.badge}
        >
          <Text variant="caption" style={styles.badgeText}>
            {badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: size.touchMin,
    height: size.touchMin,
  },
  badge: {
    position: 'absolute',
    top: space.xxs,
    right: space.xxs,
    minWidth: 18,
    height: 18,
    paddingHorizontal: space.xxs,
    borderRadius: radius.full,
    backgroundColor: color.action.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: color.text.inverse,
    fontFamily: font.bold,
  },
});
