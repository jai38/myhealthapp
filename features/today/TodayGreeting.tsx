import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { color, radius, size, space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { StringKey } from '../../design/strings';

export interface TodayGreetingProps {
  greeting: { key: StringKey; params?: { name: string } };
  now: Date;
  onOpenProfile: () => void;
}

// Greeting, today's date, and the profile button.
export function TodayGreeting({ greeting, now, onOpenProfile }: TodayGreetingProps) {
  const date = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <View style={styles.row} testID="today-greeting">
      <View style={styles.titles}>
        <Text variant="title1" testID="today-greeting-title">
          {t(greeting.key, greeting.params)}
        </Text>
        <Text variant="callout" tone="secondary" testID="today-date">
          {date}
        </Text>
      </View>
      <Pressable
        testID="today-profile-button"
        accessibilityRole="button"
        accessibilityLabel={t('today.profileOpen')}
        onPress={onOpenProfile}
        hitSlop={space.sm}
        style={({ pressed }) => [styles.avatarHit, pressed && styles.pressed]}
      >
        <View style={styles.avatar}>
          <Icon name="person-outline" size="sm" tone="link" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.md,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  titles: {
    flex: 1,
    gap: space.xxs,
  },
  avatarHit: {
    minWidth: size.touchMin,
    minHeight: size.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: size.avatar,
    height: size.avatar,
    borderRadius: radius.full,
    backgroundColor: color.bg.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
