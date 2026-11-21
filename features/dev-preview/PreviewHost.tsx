// DEV ONLY. Renders one of the real tab screens, unchanged, inside the same chrome the
// signed-in app uses (offline banner, header, tab bar), fed from synthetic fixtures.
//
// How the data gets in without touching production code paths:
//   - `fetch` is replaced by a fake backend (previewApi.ts), so the real services, schemas
//     and medication store run as normal and no request leaves the page.
//   - A synthetic signed-in session is set in memory only. Nothing is written for it to disk.
//   - The clock is frozen (previewClock.ts) at 10:30 on 6 November 2026.
//   - Connectivity comes from the existing ConnectivityContext, given an explicit status.
//   - An upload already in progress comes from the one-line seam in previewSeam.ts.
// Everything is put back when the preview unmounts.
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { TabBar } from '../../design/components/Navigation/TabBar';
import type { TabKey } from '../../design/components/Navigation/navStyle';
import { useAppFonts } from '../../design/fonts';
import { color, themes } from '../../design/tokens';
import { ThemeProvider } from '../../design/theme';
import { TabBarClearanceProvider } from '../../design/components/Navigation/TabBarClearance';
import { t } from '../../design/strings';
import { authService } from '../../services/auth/auth-service';
import type { UserSession } from '../../services/auth/auth-service';
import { medicationStore } from '../../services/medications/medication-store';
import { ConnectivityContext } from '../../services/network/useConnectivity';
import { ConnectivityBanner } from '../system/ConnectivityBanner';
import { ScreenHeader } from '../shell/ScreenHeader';
import { shellTabs } from '../shell/tabs';
import HomeScreen from '../today/HomeScreen';
import RecordsScreen from '../records/RecordsScreen';
import MedicationsScreen from '../medications/MedicationsScreen';
import ProfileScreen from '../account/ProfileScreen';
import { frozenNowMs, PREVIEW_SESSION, previewScenario } from './fixtures';
import { blocked, installPreviewApi } from './previewApi';
import { freezeClock } from './previewClock';
import { applyPreviewFontScale } from './previewFontScale';
import type { PreviewScreen, PreviewTheme } from './previewGuard';
import { setPreviewSeam } from './previewSeam';

export interface PreviewHostProps {
  screen: PreviewScreen;
  state: string;
  /** 1 = normal text. 2 approximates Android's largest system font (see previewFontScale.ts). */
  fontScale: number;
  /** Pins the v4 theme. Parts still on the light `color` export stay light. */
  theme?: PreviewTheme;
}

const TAB_FOR_SCREEN: Record<PreviewScreen, TabKey> = {
  today: 'today',
  records: 'records',
  medicines: 'medicines',
  profile: 'profile',
};

type AuthInternals = {
  currentSession: UserSession | null;
  notifyListeners: () => void;
};

// The preview signs in a synthetic user in memory by setting the service's own fields.
// It never calls login or saveSession, so nothing is persisted and no request is made.
function setPreviewSession(session: UserSession | null): void {
  const internals = authService as unknown as AuthInternals;
  internals.currentSession = session;
  internals.notifyListeners();
}

function waitForStore(): Promise<void> {
  return new Promise((resolve) => {
    if (medicationStore.isInitialized()) {
      resolve();
      return;
    }
    const unsubscribe = medicationStore.subscribe(() => {
      if (medicationStore.isInitialized()) {
        unsubscribe();
        resolve();
      }
    });
  });
}

function ScreenFor({ screen }: { screen: PreviewScreen }) {
  switch (screen) {
    case 'today':
      return <HomeScreen />;
    case 'records':
      return <RecordsScreen />;
    case 'medicines':
      return <MedicationsScreen />;
    case 'profile':
      return <ProfileScreen />;
  }
}

export function PreviewHost({ screen, state, fontScale, theme = 'light' }: PreviewHostProps) {
  const { loaded: fontsLoaded } = useAppFonts();
  const [ready, setReady] = useState(false);
  const scenario = useMemo(() => previewScenario(screen, state), [screen, state]);

  useEffect(() => {
    let cancelled = false;
    const undo: (() => void)[] = [];

    (async () => {
      const nowMs = frozenNowMs();
      undo.push(applyPreviewFontScale(fontScale));
      undo.push(installPreviewApi(scenario));
      undo.push(freezeClock(nowMs));
      setPreviewSeam(
        {
          processingStatus: scenario.uploading ? t('prescription.uploading') : null,
        },
        __DEV__,
      );
      undo.push(() => setPreviewSeam(null, __DEV__));

      await authService.waitForInitialization();
      setPreviewSession(PREVIEW_SESSION);
      undo.push(() => setPreviewSession(null));
      await waitForStore();
      // Start from an empty store, whatever an earlier preview left behind.
      await medicationStore.clearUserStorage();

      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
      while (undo.length > 0) undo.pop()?.();
    };
  }, [scenario, fontScale]);

  // Tells the screenshot script the screen has been up long enough to be still.
  useEffect(() => {
    if (!ready) return undefined;
    const g = globalThis as unknown as Record<string, unknown>;
    g.__previewSettled = false;
    g.__previewBlocked = blocked;
    const id = setTimeout(() => {
      g.__previewSettled = true;
    }, 1200);
    return () => clearTimeout(id);
  }, [ready]);

  const connectivity = useMemo(
    () => ({
      status: scenario.offline ? ('offline' as const) : ('online' as const),
      refresh: async () => {},
      refreshing: false,
    }),
    [scenario.offline],
  );

  if (!fontsLoaded || !ready) {
    return (
      <View style={styles.loading} testID="preview-loading">
        <ActivityIndicator color={color.action.primary} />
      </View>
    );
  }

  const tab = TAB_FOR_SCREEN[screen];
  const titleKey = shellTabs.find((s) => s.key === tab)?.titleKey ?? 'nav.today';

  return (
    <ThemeProvider scheme={theme}>
      <TabBarClearanceProvider>
      <ConnectivityContext.Provider value={connectivity}>
        <View
          style={[styles.root, { backgroundColor: themes[theme].color.bg.screen }]}
          testID={`preview-${screen}-${state}`}
        >
          <ConnectivityBanner />
          <ScreenHeader title={t(titleKey)} />
          <View style={styles.body}>
            <ScreenFor screen={screen} />
          </View>
          <TabBar active={tab} onSelect={() => {}} testID="tab-bar" />
        </View>
      </ConnectivityContext.Provider>
      </TabBarClearanceProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg.screen },
  body: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.bg.screen,
  },
});
