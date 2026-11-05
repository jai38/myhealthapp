import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../../design/components/Navigation/TopBar';
import { color } from '../../design/tokens';
import { shouldShowOfflineBanner } from '../../services/network/connectivity';
import { useConnectivity } from '../../services/network/useConnectivity';

export interface ScreenHeaderProps {
  title: string;
  testID?: string;
}

// Shared header for every tab. When the offline banner is showing it already covers
// the status bar area, so the header drops its own top inset.
export function ScreenHeader({ title, testID }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { status } = useConnectivity();
  const topInset = shouldShowOfflineBanner(status) ? 0 : insets.top;
  return (
    <View style={{ paddingTop: topInset, backgroundColor: color.bg.screen }}>
      <TopBar title={title} testID={testID} />
    </View>
  );
}
