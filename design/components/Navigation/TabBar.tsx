import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { size, space } from '../../tokens';
import { useTheme } from '../../theme';
import { t } from '../../strings';
import { tabBarBottom, tabBarLayout, tabs } from './navStyle';
import type { TabKey } from './navStyle';

export interface TabBarProps {
  active: TabKey;
  onSelect: (key: TabKey) => void;
  testID?: string;
}

// v4 floating frosted pill: inset 16, 30 above the bottom edge, 68 high, radius 34. It floats
// over the screen, so each tab's scrolling content adds tabBarClearance() at the bottom.
// Blur is drawn on web; native shows the translucent fill alone until expo-blur is added.
export function TabBar({ active, onSelect, testID }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { color: c, shadow } = useTheme();
  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      style={[
        styles.bar,
        shadow.card,
        {
          bottom: tabBarBottom(insets.bottom),
          backgroundColor: c.bg.tabBar,
          borderColor: c.bg.glassEdge,
        },
        Platform.OS === 'web' ? ({ backdropFilter: 'blur(24px)' } as object) : null,
      ]}
    >
      {tabs.map((tab) => {
        const selected = tab.key === active;
        const fg = selected ? c.text.link : c.text.tertiary;
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
            <View style={[styles.pill, selected ? { backgroundColor: c.bg.tintBlue } : null]}>
              <Icon name={selected ? tab.activeIcon : tab.icon} size="md" color={fg} />
            </View>
            {/* The tab style caps system text at TAB_LABEL_MAX_SCALE (typography.ts). */}
            <Text variant="tab" style={{ color: fg }} numberOfLines={1}>
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: tabBarLayout.inset,
    right: tabBarLayout.inset,
    minHeight: tabBarLayout.height,
    borderRadius: tabBarLayout.radius,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xxs,
  },
  item: {
    flex: 1,
    minWidth: tabBarLayout.itemMinWidth,
    minHeight: size.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
    paddingVertical: space.xs,
  },
  pill: {
    paddingHorizontal: space.md,
    paddingVertical: space.xxs,
    borderRadius: 9999,
  },
  pressed: {
    opacity: 0.7,
  },
});
