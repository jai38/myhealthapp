import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { color, size, space } from '../../tokens';
import { t } from '../../strings';
import { tabBarLayout, tabColors, tabs } from './navStyle';
import type { TabKey } from './navStyle';

export interface TabBarProps {
  active: TabKey;
  onSelect: (key: TabKey) => void;
  testID?: string;
}

// Presentational only. Routing is wired in Phase 4.
export function TabBar({ active, onSelect, testID }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: insets.bottom }]}
    >
      <View style={styles.row}>
        {tabs.map((tab) => {
          const selected = tab.key === active;
          const colors = tabColors(selected);
          return (
            <Pressable
              key={tab.key}
              testID={testID && `${testID}-${tab.key}`}
              accessibilityRole="tab"
              accessibilityLabel={t(tab.labelKey)}
              accessibilityState={{ selected }}
              onPress={() => onSelect(tab.key)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <Icon name={selected ? tab.activeIcon : tab.icon} size="md" color={colors.fg} />
              <Text variant="caption" style={[styles.label, { color: colors.fg }]} numberOfLines={1}>
                {t(tab.labelKey)}
              </Text>
              <View style={[styles.indicator, { backgroundColor: colors.indicator }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: color.bg.screen,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border.subtle,
  },
  row: {
    flexDirection: 'row',
    height: tabBarLayout.height,
  },
  item: {
    flex: 1,
    minWidth: tabBarLayout.itemMinWidth,
    minHeight: size.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: space.xs,
  },
  pressed: {
    backgroundColor: color.bg.subtle,
  },
  label: {
    marginTop: space.xxs,
  },
  // Sits under the active tab, at the bottom edge of its item.
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: space.md,
    right: space.md,
    height: 3,
  },
});
