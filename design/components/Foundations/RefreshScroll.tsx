import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import type { ScrollViewProps } from 'react-native';
import { color } from '../../tokens';

export interface RefreshScrollProps extends Omit<ScrollViewProps, 'refreshControl'> {
  onRefresh: () => Promise<void>;
  testID?: string;
}

export function RefreshScroll({ onRefresh, children, testID, ...rest }: RefreshScrollProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch {
      // The caller owns error display. The spinner must still stop.
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      {...rest}
      testID={testID}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={color.action.primary}
          colors={[color.action.primary]}
        />
      }
    >
      {children}
    </ScrollView>
  );
}
