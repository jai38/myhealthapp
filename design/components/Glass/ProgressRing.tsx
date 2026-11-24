import React from 'react';
import Svg, { Circle } from 'react-native-svg';

export interface ProgressRingProps {
  /** 0 to 1. */
  progress: number;
  size?: number;
  stroke?: number;
  color: string;
  trackColor: string;
  testID?: string;
}

// The hero's ring. Decorative: the hero says "N of M taken" in words. No percentage (D7).
export function ProgressRing({ progress, size = 72, stroke = 8, color, trackColor, testID }: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  return (
    <Svg width={size} height={size} pointerEvents="none" testID={testID}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
      {p > 0 ? (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - p)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ) : null}
    </Svg>
  );
}
