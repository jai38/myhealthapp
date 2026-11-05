import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { color } from '../design/tokens';
import { useAppFonts } from '../design/fonts';
import { authService, UserSession, SessionEndReason } from '../services/auth/auth-service';
import { AuthScreen } from '../features/auth/AuthScreen';
import { RestoringScreen } from '../features/auth/RestoringScreen';
import { authGateState, showsSessionEndedNote } from '../features/auth/authGate';
import { ErrorBoundary } from '../features/system/ErrorBoundary';
import { ConnectivityBanner } from '../features/system/ConnectivityBanner';
import { ConnectivityProvider } from '../services/network/useConnectivity';
import { medicineOpenTarget } from '../features/shell/tabs';
import { isGalleryEnabled, isGalleryPath } from '../design/gallery/galleryGuard';
import {
  requestNotificationPermissions,
  registerNotificationResponseListener,
} from '../services/notifications/notification-service';

export default function RootLayout() {
  const [session, setSession] = useState<UserSession | null>(authService.getSession());
  const [endReason, setEndReason] = useState<SessionEndReason | null>(authService.getEndReason());
  const [initialized, setInitialized] = useState<boolean>(false);
  const pathname = usePathname();
  // Inter for every screen. Never blocks for long: on a load error the system font is used.
  const { loaded: fontsLoaded } = useAppFonts();

  useEffect(() => {
    // Wait for AsyncStorage persisted session load
    authService.waitForInitialization().then(() => {
      const current = authService.getSession();
      setSession(current);
      setEndReason(authService.getEndReason());
      setInitialized(true);
      if (current) {
        // Prompt for notification permissions on startup if authenticated
        requestNotificationPermissions().catch(() => {});
      }
    });

    // Only the initial load ends the restoring state; this subscriber just follows later changes.
    const unsubscribe = authService.subscribe((currentSession) => {
      setSession(currentSession);
      setEndReason(authService.getEndReason());
      if (currentSession) {
        requestNotificationPermissions().catch(() => {});
      }
    });

    // Handle tapping on medication notification to open medication modal
    const unsubNotification = registerNotificationResponseListener((medicationId) => {
      setTimeout(() => {
        router.push(medicineOpenTarget(medicationId, Date.now().toString()));
      }, 100);
    });

    return () => {
      unsubscribe();
      unsubNotification();
    };
  }, []);

  const gate = authGateState({ initialized, session, endReason });

  // Dev only: the component gallery opens without sign-in, so it needs no backend.
  if (isGalleryEnabled(__DEV__) && isGalleryPath(pathname)) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    );
  }

  if (gate === 'restoring' || !fontsLoaded) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RestoringScreen />
      </SafeAreaProvider>
    );
  }

  // Signed out or expired: the signed-in tree below is not rendered at all, so no patient data can show.
  if (gate !== 'signedIn') {
    return (
      <SafeAreaProvider key="signedOut">
        <StatusBar style="dark" />
        <ConnectivityProvider>
          <ConnectivityBanner />
          <View style={styles.appBody}>
            <ErrorBoundary>
              <AuthScreen sessionEnded={showsSessionEndedNote(gate)} />
            </ErrorBoundary>
          </View>
        </ConnectivityProvider>
      </SafeAreaProvider>
    );
  }

  // Authenticated: Render main tabs
  return (
    <SafeAreaProvider key="signedIn">
      <StatusBar style="dark" />
      <ConnectivityProvider>
        <ConnectivityBanner />
        <View style={styles.appBody}>
          <ErrorBoundary>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: color.bg.card },
                headerTintColor: color.text.primary,
                headerTitleStyle: { fontWeight: '600' },
                contentStyle: { backgroundColor: color.bg.screen },
                headerShadowVisible: false,
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </ErrorBoundary>
        </View>
      </ConnectivityProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appBody: {
    flex: 1,
  },
});
