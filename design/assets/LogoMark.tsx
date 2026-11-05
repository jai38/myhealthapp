import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { color } from '../tokens';

// Placeholder until the owner's SVG arrives. Replace the paths in this file only.
export function LogoMark({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessible={false}>
      <Path
        d="M8 34 C8 18 18 8 38 8 C38 26 30 36 8 34 Z"
        fill={color.action.primary}
      />
      <Path
        d="M18 42 C18 28 26 20 42 20 C42 36 34 44 18 42 Z"
        fill={color.action.secondary}
      />
    </Svg>
  );
}
