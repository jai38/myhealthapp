import type { TextStyle } from 'react-native';
import { font } from './tokens';

// Calm Glass UI v4 type scale (colour-shape-spec.md): Plus Jakarta Sans, Apple-HIG sizing.
// Large text gets negative tracking (the spec's percentages, as points: size × percent).
// Text styles carry no color. Color comes from the Text tone prop.
const track = (size: number, percent: number) => Math.round(size * percent * 100) / 10000;

export const textStyles = {
  // Large Title 34/40, 700, −3%: sign-in headline, hero numbers.
  display: { fontFamily: font.bold, fontSize: 34, lineHeight: 40, letterSpacing: track(34, -3) },
  // Title 1 28/34, 700, −2.5%: greeting, screen titles.
  title1: { fontFamily: font.bold, fontSize: 28, lineHeight: 34, letterSpacing: track(28, -2.5) },
  // Title 3 / Section 20/25, 700, −2%: Morning, Afternoon, Evening; section headers.
  title2: { fontFamily: font.bold, fontSize: 20, lineHeight: 25, letterSpacing: track(20, -2) },
  // Headline 17/22, 600, −1.5%: medicine names, card titles, form labels.
  title3: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22, letterSpacing: track(17, -1.5) },
  // Body 17/23, 400, −0.5%.
  body: { fontFamily: font.regular, fontSize: 17, lineHeight: 23, letterSpacing: track(17, -0.5) },
  bodyStrong: { fontFamily: font.semibold, fontSize: 17, lineHeight: 23, letterSpacing: track(17, -0.5) },
  // Subhead / Meta 15/20, 400: dose lines, secondary text.
  callout: { fontFamily: font.regular, fontSize: 15, lineHeight: 20 },
  // Footnote 13/18, 400: helper text, counts, consent text.
  caption: { fontFamily: font.regular, fontSize: 13, lineHeight: 18 },
  // Caption 12/16, 400: timestamps. The minimum size.
  caption2: { fontFamily: font.regular, fontSize: 12, lineHeight: 16 },
  // Chip 12/16, 600: status chips.
  chip: { fontFamily: font.semibold, fontSize: 12, lineHeight: 16 },
  // Overline 13, 600, +6%, uppercase: the hero card label.
  overline: {
    fontFamily: font.semibold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: track(13, 6),
    textTransform: 'uppercase',
  },
  // Button 17/20, 600, −1%: all buttons.
  button: { fontFamily: font.semibold, fontSize: 17, lineHeight: 20, letterSpacing: track(17, -1) },
  // Tab label 10.5/13, 600, +1%: bottom tabs only.
  tab: { fontFamily: font.semibold, fontSize: 10.5, lineHeight: 13, letterSpacing: track(10.5, 1) },
  // Wordmark 15, 700, +24%: "AYORENI" beside the logo.
  wordmark: { fontFamily: font.bold, fontSize: 15, lineHeight: 20, letterSpacing: track(15, 24) },
} as const satisfies Record<string, TextStyle>;

export type TextStyleName = keyof typeof textStyles;

// Tabular figures for every time, dose and reading.
export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };

export const DEFAULT_MAX_FONT_SCALE = 1.6;

// Large display text would overflow its line box at 1.6x, so it is capped lower.
export function maxFontScaleFor(name: TextStyleName): number {
  return name === 'display' || name === 'title1' ? 1.3 : DEFAULT_MAX_FONT_SCALE;
}
