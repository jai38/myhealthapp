import { font } from './tokens';

// Text styles carry no color. Color comes from the Text tone prop.
export const textStyles = {
  // Apple-like scale: large headings with tighter tracking, 17 pt body for easy reading.
  display: { fontFamily: font.bold, fontSize: 34, lineHeight: 41, letterSpacing: -0.6 },
  title1: { fontFamily: font.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  title2: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  title3: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: font.regular, fontSize: 17, lineHeight: 24 },
  bodyStrong: { fontFamily: font.semibold, fontSize: 17, lineHeight: 24 },
  callout: { fontFamily: font.regular, fontSize: 16, lineHeight: 22 },
  caption: { fontFamily: font.medium, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: font.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
} as const;

export type TextStyleName = keyof typeof textStyles;

export const DEFAULT_MAX_FONT_SCALE = 1.6;

// Large display text would overflow its line box at 1.6x, so it is capped lower.
export function maxFontScaleFor(name: TextStyleName): number {
  return name === 'display' || name === 'title1' ? 1.3 : DEFAULT_MAX_FONT_SCALE;
}
