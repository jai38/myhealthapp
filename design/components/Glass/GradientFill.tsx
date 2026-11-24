import React, { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export interface GradientStop {
  offset: number;
  color: string;
}

export interface GradientFillProps {
  stops: GradientStop[];
  /** 'vertical' runs top to bottom; 'diagonal' is CSS 135deg, top left to bottom right. */
  direction?: 'vertical' | 'diagonal';
}

// A gradient painted behind a part's content. Decorative: hidden from accessibility and touch.
// The parent rounds it: give the parent a borderRadius and overflow 'hidden'. (An SVG corner
// radius larger than half the height turns a pill into an ellipse.)
export function GradientFill({ stops, direction = 'vertical' }: GradientFillProps) {
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const end = direction === 'vertical' ? { x2: '0', y2: '1' } : { x2: '1', y2: '1' };
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none" width="100%" height="100%">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" {...end}>
          {stops.map((s) => (
            <Stop key={s.offset} offset={String(s.offset)} stopColor={s.color} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
