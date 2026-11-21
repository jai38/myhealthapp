import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { elevation, font, radius, size, space } from '../../tokens';
import { useTheme } from '../../theme';
import { useTabBarClearance } from '../Navigation/TabBarClearance';
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
  const { name, color: c } = useTheme();
  // Above the floating tab bar on a tab; above the home indicator elsewhere.
  const clearance = useTabBarClearance();
  // v4: a dark toast in both themes ("<Medicine> marked as taken at <time>", Undo).
  const toastBg = name === 'light' ? c.text.primary : c.bg.surface;

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
        {
          bottom: clearance > 0 ? clearance - space.sm : insets.bottom + space.lg,
          backgroundColor: toastBg,
          borderColor: c.bg.glassEdge,
        },
      ]}
    >
      <Text
        maxFontSizeMultiplier={maxFontScaleFor('body')}
        style={[textStyles.body, styles.message, { color: c.text.inverse }]}
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
            { fontFamily: font.bold, color: name === 'light' ? c.brand.tealGlow : c.text.link },
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
    borderRadius: radius.input,
    borderWidth: 1,
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
