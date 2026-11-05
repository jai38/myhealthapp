import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Mask, Path, Rect, Stop } from 'react-native-svg';

// Ayoreni mark: a continuous infinity ribbon (lifelong care) with a person's head
// above it. Source of truth: design/assets/logo/ayoreni-mark.svg. Keep both in sync.
export const LOGO_ASPECT = 120 / 86;

const BLUE = '#0A5CE6';
const MID = '#0AA5F0';
const TEAL = '#00C9A7';

const RIBBON =
  'M60 56C70 44 80 36 92 36C104 36 112 45 112 56C112 67 104 76 92 76C80 76 70 68 60 56C50 44 40 36 28 36C16 36 8 45 8 56C8 67 16 76 28 76C40 76 50 68 60 56Z';
// The rising strand drawn on top, so the ribbon reads as crossing over itself.
const OVER = 'M44.75 70.5C50 67 55 62 60 56C65 50 70 45 75.25 41.5';

export interface LogoMarkProps {
  // Height in points. Width follows the mark's aspect ratio.
  size: number;
  // Paints the whole mark one color. Omit for the brand gradient.
  monoColor?: string;
}

export function LogoMark({ size, monoColor }: LogoMarkProps) {
  const stroke = monoColor ?? 'url(#ayoreniGrad)';
  const head = monoColor ?? TEAL;
  return (
    // No accessibility props here: Logo is the accessible element, and on web
    // react-native-svg would pass `accessible` straight to the DOM.
    <Svg width={size * LOGO_ASPECT} height={size} viewBox="0 2 120 86">
      <Defs>
        <LinearGradient id="ayoreniGrad" gradientUnits="userSpaceOnUse" x1="8" y1="78" x2="112" y2="22">
          <Stop offset="0" stopColor={BLUE} />
          <Stop offset="0.5" stopColor={MID} />
          <Stop offset="1" stopColor={TEAL} />
        </LinearGradient>
        <Mask id="ayoreniCross" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="100">
          <Rect width="120" height="100" fill="#fff" />
          <Path d={OVER} fill="none" stroke="#000" strokeWidth={21} />
        </Mask>
      </Defs>
      <Path d={RIBBON} mask="url(#ayoreniCross)" fill="none" stroke={stroke} strokeWidth={13} />
      <Path d={OVER} fill="none" stroke={stroke} strokeWidth={13} strokeLinecap="round" />
      <Circle cx={88} cy={15} r={8.5} fill={head} />
    </Svg>
  );
}
