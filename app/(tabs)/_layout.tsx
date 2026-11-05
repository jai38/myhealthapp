import React from 'react';
import { Tabs } from 'expo-router';
import { t } from '../../design/strings';
import { RouterTabBar } from '../../features/shell/RouterTabBar';
import type { RouterTabBarProps } from '../../features/shell/RouterTabBar';
import { ScreenHeader } from '../../features/shell/ScreenHeader';
import { hiddenRouteNames, shellTabs } from '../../features/shell/tabs';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <RouterTabBar {...(props as unknown as RouterTabBarProps)} />}
      screenOptions={{
        header: ({ options }) => <ScreenHeader title={String(options.title ?? '')} />,
      }}
    >
      {shellTabs.map((tab) => (
        <Tabs.Screen key={tab.key} name={tab.routeName} options={{ title: t(tab.titleKey) }} />
      ))}
      {/* Old routes only redirect to Records. They stay out of the tab bar. */}
      {hiddenRouteNames.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null, headerShown: false }} />
      ))}
    </Tabs>
  );
}
