import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppStatus,
  AppStatusDecision,
  appStatusDecision,
  applyDismissal,
  shouldRecheck,
} from '../../services/app-status/appStatus';
import { fetchAppStatus } from '../../services/app-status/appStatusClient';
import { loadDismissedVersion, saveDismissedVersion } from '../../services/app-status/appStatusStorage';
import { updateUrlFor } from '../../services/app-status/storeLinks';
import { getApiBaseUrl } from '../../services/api/client';

const RECHECK_INTERVAL_MS = 5 * 60 * 1000;

export interface AppStatusState {
  decision: AppStatusDecision;
  maintenanceMessage?: string;
  checking: boolean;
  recheck: () => void;
  openUpdate: () => void;
  dismissOptional: () => void;
}

// Checks at launch and on return to the foreground (at most every few minutes).
// Never blocks launch: the app renders while this runs, and any failure leaves the decision 'ok'.
export function useAppStatus(): AppStatusState {
  const currentVersion = Constants.expoConfig?.version ?? null;
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const lastChecked = useRef<number | null>(null);
  const inFlight = useRef(false);

  const check = useCallback(async (force: boolean) => {
    if (inFlight.current) return;
    if (!force && !shouldRecheck(lastChecked.current, Date.now(), RECHECK_INTERVAL_MS)) return;
    inFlight.current = true;
    setChecking(true);
    try {
      const next = await fetchAppStatus(getApiBaseUrl());
      lastChecked.current = Date.now();
      setStatus(next);
    } finally {
      inFlight.current = false;
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    loadDismissedVersion(AsyncStorage).then((v) => {
      if (alive) setDismissed(v);
    });
    check(false);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check(false);
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, [check]);

  const decision = applyDismissal(appStatusDecision(status, currentVersion), status, dismissed);

  return {
    decision,
    maintenanceMessage: status?.maintenance.message,
    checking,
    recheck: () => {
      check(true);
    },
    openUpdate: () => {
      Linking.openURL(updateUrlFor(Platform.OS)).catch(() => {});
    },
    dismissOptional: () => {
      if (!status) return;
      setDismissed(status.latestVersion);
      saveDismissedVersion(AsyncStorage, status.latestVersion);
    },
  };
}
