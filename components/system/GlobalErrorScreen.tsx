import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { typography, spacing, borderRadius } from '../../theme/index';

export type GlobalErrorVariant = 'offline' | 'error';

export interface GlobalErrorScreenProps {
  variant: GlobalErrorVariant;
  onRetry: () => void;
  retrying?: boolean;
  message?: string;
}

// Fixed palette for this screen. Calm, non-alarming: no red, no warning wording.
const PALETTE = {
  background: '#FFFFFF',
  heading: '#16324F',
  body: '#526372',
  button: '#2878C7',
  buttonText: '#FFFFFF',
  buttonDisabled: '#9DB8D6',
} as const;

const OFFLINE_TITLE = "You're offline";
const OFFLINE_BODY =
  'Your saved information is still on this device. Connect to the internet to refresh it.';
const ERROR_TITLE = 'Something went wrong';
const ERROR_FALLBACK_BODY = 'Nothing was lost. Please try again.';

export function getGlobalErrorCopy(
  variant: GlobalErrorVariant,
  message?: string,
): { title: string; body: string } {
  if (variant === 'offline') {
    return { title: OFFLINE_TITLE, body: OFFLINE_BODY };
  }
  const trimmed = message?.trim();
  return {
    title: ERROR_TITLE,
    body: trimmed ? trimmed : ERROR_FALLBACK_BODY,
  };
}

export const GlobalErrorScreen: React.FC<GlobalErrorScreenProps> = ({
  variant,
  onRetry,
  retrying = false,
  message,
}) => {
  const { title, body } = getGlobalErrorCopy(variant, message);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            {title}
          </Text>
          <Text style={styles.body}>{body}</Text>

          <TouchableOpacity
            style={[styles.button, retrying && styles.buttonDisabled]}
            onPress={onRetry}
            disabled={retrying}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            accessibilityState={{ disabled: retrying, busy: retrying }}
          >
            {retrying ? (
              <ActivityIndicator color={PALETTE.buttonText} size="small" />
            ) : (
              <Text style={styles.buttonText}>Retry</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  inner: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: PALETTE.heading,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodyMuted,
    color: PALETTE.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
    minHeight: 48,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: PALETTE.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: PALETTE.buttonDisabled,
  },
  buttonText: {
    ...typography.button,
    color: PALETTE.buttonText,
    textAlign: 'center',
  },
});
