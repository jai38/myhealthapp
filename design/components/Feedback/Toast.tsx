import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../Foundations/Text';
import { color, elevation, radius, space } from '../../tokens';
import { TOAST_DURATION_MS } from './feedbackStyle';

export interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  testID?: string;
}

// For a toast with an action, use UndoToast instead.
export function Toast({ message, visible, onHide, testID }: ToastProps) {
  const insets = useSafeAreaInsets();

  // Keep the latest callback in a ref so a parent re-render does not restart the timer.
  const hideRef = useRef(onHide);
  hideRef.current = onHide;

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => hideRef.current(), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible, message]);

  if (!visible) return null;

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.toast, elevation.raised, { bottom: insets.bottom + space.lg }]}
    >
      <Text variant="body" tone="inverse" testID={testID && `${testID}-message`}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: color.text.primary,
  },
});
