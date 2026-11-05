import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { ConnectivityStatus, toConnectivityStatus } from './connectivity';

interface ConnectivityValue {
  status: ConnectivityStatus;
  // Re-checks the connection now.
  refresh: () => Promise<void>;
  refreshing: boolean;
}

const ConnectivityContext = createContext<ConnectivityValue>({
  status: 'unknown',
  refresh: async () => {},
  refreshing: false,
});

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectivityStatus>('unknown');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus(toConnectivityStatus(state));
    });
    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const state = await NetInfo.refresh();
      setStatus(toConnectivityStatus(state));
    } catch {
      // Keep the current status; the listener updates it when the network changes.
    } finally {
      setRefreshing(false);
    }
  }, []);

  const value = useMemo(() => ({ status, refresh, refreshing }), [status, refresh, refreshing]);
  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity(): ConnectivityValue {
  return useContext(ConnectivityContext);
}
