import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, elevation, font, radius, size, space } from '../../tokens';
import { maxFontScaleFor, textStyles } from '../../typography';
import { t } from '../../strings';
import { UNDO_DURATION_MS, linkRowLayout } from './buttonStyle';

export interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  visible: boolean;
  testID?: string;
}

export function UndoToast({ message, onUndo, onDismiss, visible, testID }: UndoToastProps) {
  const insets = useSafeAreaInsets();

  // Keep the latest callback in a ref so a parent re-render does not restart the timer.
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => dismissRef.current(), UNDO_DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        elevation.raised,
        { bottom: insets.bottom + space.lg },
      ]}
    >
      <Text
        maxFontSizeMultiplier={maxFontScaleFor('body')}
        style={[textStyles.body, styles.message, { color: color.text.inverse }]}
      >
        {message}
      </Text>
      <Pressable
        testID={testID && `${testID}-undo`}
        accessibilityRole="button"
        accessibilityLabel={t('common.undo')}
        onPress={onUndo}
        style={({ pressed }) => [linkRowLayout, styles.undo, pressed && styles.undoPressed]}
      >
        <Text
          maxFontSizeMultiplier={maxFontScaleFor('bodyStrong')}
          style={[
            textStyles.bodyStrong,
            { fontFamily: font.bold, color: color.text.inverse },
          ]}
        >
          {t('common.undo')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingLeft: space.lg,
    paddingRight: space.sm,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    backgroundColor: color.text.primary,
  },
  message: {
    flex: 1,
  },
  undo: {
    justifyContent: 'center',
    paddingHorizontal: space.md,
    minWidth: size.touchMin,
  },
  undoPressed: {
    opacity: 0.7,
  },
});
