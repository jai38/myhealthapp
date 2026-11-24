import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../../design/components/Navigation/TopBar';
import { AppHeader } from '../../design/components/Glass/AppHeader';
import { useTheme } from '../../design/theme';
import { shouldShowOfflineBanner } from '../../services/network/connectivity';
import { useConnectivity } from '../../services/network/useConnectivity';

export interface ScreenHeaderProps {
  title: string;
  /** 'brand': the v4 logo lockup (Today, S06); 'title': the tab's name. */
  variant?: 'title' | 'brand';
  testID?: string;
}

// Shared header for every tab. When the offline banner is showing it already covers
// the status bar area, so the header drops its own top inset.
export function ScreenHeader({ title, variant = 'title', testID }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { color: c } = useTheme();
  const { status } = useConnectivity();
  const topInset = shouldShowOfflineBanner(status) ? 0 : insets.top;
  return (
    <View style={{ paddingTop: topInset, backgroundColor: c.bg.screen }}>
      {variant === 'brand' ? <AppHeader testID={testID} /> : <TopBar title={title} testID={testID} />}
    </View>
  );
}
