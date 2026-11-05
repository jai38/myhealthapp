import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { Text } from '../Foundations/Text';
import { color, radius, space } from '../../tokens';
import { t } from '../../strings';
import { useReduceMotion } from '../Containers/useReduceMotion';
import { progressPercent } from './feedbackStyle';

const INDETERMINATE_SEGMENT = 0.3;
const SLIDE_MS = 1400;

export interface ProgressBarProps {
  // 0 to 1. Omit for indeterminate progress.
  progress?: number;
  label?: string;
  showProcessingNote?: boolean;
  testID?: string;
}

export function ProgressBar({ progress, label, showProcessingNote = false, testID }: ProgressBarProps) {
  const reduceMotion = useReduceMotion();
  const indeterminate = progress === undefined;
  const percent = progress === undefined ? 0 : progressPercent(progress);
  const [trackWidth, setTrackWidth] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!indeterminate || reduceMotion) return undefined;
    const loop = Animated.loop(
      Animated.timing(slide, {
        toValue: 1,
        duration: SLIDE_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      slide.setValue(0);
    };
  }, [indeterminate, reduceMotion, slide]);

  const segmentWidth = trackWidth * INDETERMINATE_SEGMENT;
  const translateX = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [-segmentWidth, trackWidth],
  });

  const caption =
    label ?? (indeterminate ? t('common.loading') : t('feedback.progress', { percent }));

  const onTrackLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={indeterminate ? { min: 0, max: 100 } : { min: 0, max: 100, now: percent }}
      style={styles.root}
    >
      <Text variant="caption" tone="secondary" testID={testID && `${testID}-caption`}>
        {caption}
      </Text>
      <View style={styles.track} onLayout={onTrackLayout}>
        {indeterminate && !reduceMotion && (
          <Animated.View
            testID={testID && `${testID}-fill`}
            style={[styles.fill, { width: segmentWidth, transform: [{ translateX }] }]}
          />
        )}
        {indeterminate && reduceMotion && (
          <View testID={testID && `${testID}-fill`} style={[styles.fill, { width: '30%' }]} />
        )}
        {!indeterminate && (
          <View
            testID={testID && `${testID}-fill`}
            style={[styles.fill, { width: `${percent}%` }]}
          />
        )}
      </View>
      {showProcessingNote && (
        <Text variant="caption" tone="secondary" testID={testID && `${testID}-note`}>
          {t('feedback.processing')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.xs,
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: color.bg.subtle,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: color.action.primary,
  },
});
