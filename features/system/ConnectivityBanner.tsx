import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfflineBanner } from '../../design/components/Feedback/OfflineBanner';
import { color } from '../../design/tokens';
import { shouldShowOfflineBanner } from '../../services/network/connectivity';
import { useConnectivity } from '../../services/network/useConnectivity';

// Shown above the signed-in app. Clears on its own when the connection returns.
export function ConnectivityBanner() {
  const { status, refresh, refreshing } = useConnectivity();
  const insets = useSafeAreaInsets();
  if (!shouldShowOfflineBanner(status)) return null;
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: color.bg.subtle }}>
      <OfflineBanner onRetry={refresh} retrying={refreshing} testID="offline-banner" />
    </View>
  );
}
