import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, typography, spacing } from '../theme/index';
import { authService, UserSession } from '../services/auth/auth-service';
import { AuthScreen } from '../features/auth/AuthScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { requestNotificationPermissions } from '../services/notifications/notification-service';

export default function RootLayout() {
  const [session, setSession] = useState<UserSession | null>(authService.getSession());
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Wait for AsyncStorage persisted session load
    authService.waitForInitialization().then(() => {
      const current = authService.getSession();
      setSession(current);
      setInitialized(true);
      if (current) {
        // Prompt for notification permissions on startup if authenticated
        requestNotificationPermissions().catch(() => {});
      }
    });

    const unsubscribe = authService.subscribe((currentSession) => {
      setSession(currentSession);
      setInitialized(true);
      if (currentSession) {
        requestNotificationPermissions().catch(() => {});
      }
    });

    return unsubscribe;
  }, []);

  if (!initialized) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <View style={styles.splashBadge}>
            <Text style={styles.splashIcon}>🩺</Text>
          </View>
          <Text style={styles.splashTitle}>MyHealth</Text>
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.md }} />
        </View>
      </SafeAreaProvider>
    );
  }

  // If not authenticated, land on Login / Register screen
  if (!session) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <ErrorBoundary>
          <AuthScreen />
        </ErrorBoundary>
      </SafeAreaProvider>
    );
  }

  // Authenticated: Render main tabs
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <ErrorBoundary>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  splashIcon: {
    fontSize: 34,
  },
  splashTitle: {
    ...typography.h2,
    color: colors.primaryDark,
    marginTop: spacing.md,
  },
});
