// App lock gate (Phase 5 task 12; screens.md A01 "locked" and "failed"). Wraps the signed-in app.
// When app lock is on and the app goes to the background, it locks: the app stays mounted (so
// nothing is lost) but is hidden from view and from screen readers, and A01 "Ayoreni is locked"
// covers it. The phone's prompt opens on its own when the lock screen appears.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { t } from '../../design/strings';
import { isAppLockOn, shouldLock, unlockWithDevice } from '../../services/security/app-lock';
import type { AppStateName } from '../../services/security/app-lock';
import { A01Locked } from './SecurityScreens';

export interface AppLockGateProps {
  children: React.ReactNode;
  /** For tests and the preview: start locked, and use this unlock instead of the phone's. */
  initiallyLocked?: boolean;
  unlock?: (prompt: string) => Promise<boolean>;
}

export function AppLockGate({ children, initiallyLocked = false, unlock = unlockWithDevice }: AppLockGateProps) {
  const [locked, setLocked] = useState(initiallyLocked);
  const [failed, setFailed] = useState(false);
  const enabled = useRef(false);
  const prompting = useRef(false);

  useEffect(() => {
    let alive = true;
    void isAppLockOn().then((on) => {
      if (alive) enabled.current = on;
    });
    const sub = AppState.addEventListener('change', (next) => {
      // Re-read, so turning the lock on or off in Profile takes effect without a restart.
      void isAppLockOn().then((on) => {
        enabled.current = on;
        if (shouldLock(next as AppStateName, on)) {
          setFailed(false);
          setLocked(true);
        }
      });
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  const tryUnlock = useCallback(async () => {
    if (prompting.current) return;
    prompting.current = true;
    try {
      const ok = await unlock(t('a01.prompt'));
      if (ok) {
        setLocked(false);
        setFailed(false);
      } else {
        setFailed(true);
      }
    } finally {
      prompting.current = false;
    }
  }, [unlock]);

  // A01: "The system prompt opens on its own when the screen appears."
  useEffect(() => {
    if (locked && !failed) void tryUnlock();
  }, [locked, failed, tryUnlock]);

  return (
    <View style={styles.root}>
      <View
        style={[styles.root, locked ? styles.hidden : null]}
        accessibilityElementsHidden={locked}
        importantForAccessibility={locked ? 'no-hide-descendants' : 'auto'}
        testID="app-lock-content"
      >
        {children}
      </View>
      {locked ? (
        <View style={StyleSheet.absoluteFill} testID="app-lock-screen">
          <A01Locked failed={failed} onUnlock={() => void tryUnlock()} onUsePin={() => void tryUnlock()} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hidden: { display: 'none' },
});
