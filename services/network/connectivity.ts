// Pure connectivity mapping. No native imports, so Vitest can run it in node.

export type ConnectivityStatus = 'online' | 'offline' | 'unknown';

// The subset of NetInfo's state this app reads.
export interface NetInfoLike {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

/**
 * Turns NetInfo state into a status.
 * - No network connection at all: offline.
 * - Connected but reachability not yet known (null): unknown, never offline.
 * - Connected and reachable: online. Connected but proven unreachable: offline.
 */
export function toConnectivityStatus(state: NetInfoLike | null | undefined): ConnectivityStatus {
  if (!state) return 'unknown';
  if (state.isConnected === false) return 'offline';
  if (state.isInternetReachable === false) return 'offline';
  if (state.isConnected === true && state.isInternetReachable === true) return 'online';
  // Connected with reachability still null, or isConnected null: not proven either way.
  return 'unknown';
}

// The banner shows only on a confirmed offline state.
export function shouldShowOfflineBanner(status: ConnectivityStatus): boolean {
  return status === 'offline';
}
