import React from 'react';
import { TabBar } from '../../design/components/Navigation/TabBar';
import type { TabKey } from '../../design/components/Navigation/navStyle';
import { routeNameForTab, tabKeyForRoute } from './tabs';

// The parts of the router's tab bar props this adapter uses.
export interface RouterTabBarProps {
  state: { index: number; routes: { key: string; name: string; params?: object }[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented?: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
}

// Connects the design-system TabBar to Expo Router.
export function RouterTabBar({ state, navigation }: RouterTabBarProps) {
  const current = state.routes[state.index];
  const active: TabKey = (current && tabKeyForRoute(current.name)) ?? 'today';

  const onSelect = (key: TabKey) => {
    const route = state.routes.find((r) => r.name === routeNameForTab(key));
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(route.name, route.params);
  };

  return <TabBar active={active} onSelect={onSelect} testID="tab-bar" />;
}
