import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { radius, size, space } from '../../tokens';
import { textStyles } from '../../typography';
import { t } from '../../strings';
import { useReduceMotion } from '../Containers/useReduceMotion';
import { SHIMMER_MS, skeletonColors } from './feedbackStyle';

export interface SkeletonProps {
  shape: 'line' | 'block' | 'circle';
  width?: number | `${number}%`;
  height?: number;
  testID?: string;
}

const DEFAULTS = {
  line: { width: '100%', height: textStyles.body.lineHeight, radius: radius.sm },
  block: { width: '100%', height: 96, radius: radius.lg },
  circle: { width: size.avatar, height: size.avatar, radius: radius.full },
} as const;

export function Skeleton({ shape, width, height, testID }: SkeletonProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  const defaults = DEFAULTS[shape];

  useEffect(() => {
    // Reduced motion keeps a static base fill: no loop is started.
    if (reduceMotion) return undefined;
    const half = SHIMMER_MS / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: half, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: half, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      opacity.setValue(1);
    };
  }, [reduceMotion, opacity]);

  return (
    <View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.frame,
        {
          width: width ?? defaults.width,
          height: height ?? defaults.height,
          borderRadius: defaults.radius,
          backgroundColor: skeletonColors.highlight,
        },
      ]}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: skeletonColors.base, opacity }]}
      />
    </View>
  );
}

export interface SkeletonGroupProps {
  children: React.ReactNode;
  testID?: string;
}

// Screen readers hear "Loading" once, instead of each skeleton block.
export function SkeletonGroup({ children, testID }: SkeletonGroupProps) {
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loading')}
      style={styles.group}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
  },
  group: {
    gap: space.sm,
  },
});
