// DEV ONLY. Web has no system font-size setting, so the preview approximates Android's
// largest one. The app's own `Text` caps system scaling per style (maxFontScaleFor: 1.3 for
// display and title1, 1.6 for the rest), so a phone set to 2.0 renders text at
// min(2.0, cap) times its size. This applies exactly that factor to the shared text scale
// in design/typography.ts, font size and line height together.
//
// What it does not model: icons and fixed-height controls (they do not grow on a phone either),
// Android's nonlinear scaling for small text, and display-size settings. Treat it as a close
// approximation of the capped text, not a replacement for the owner's phone check.
import { maxFontScaleFor, textStyles } from '../../design/typography';
import type { TextStyleName } from '../../design/typography';

type MutableStyle = { fontSize: number; lineHeight: number };

/** Text factor for one style at a given system scale: the system scale, capped like `Text` does. */
export function effectiveFontScale(name: TextStyleName, systemScale: number): number {
  return Math.min(systemScale, maxFontScaleFor(name));
}

/** Scales the shared text styles in place. Returns a function that restores the originals. */
export function applyPreviewFontScale(systemScale: number): () => void {
  const names = Object.keys(textStyles) as TextStyleName[];
  const originals = new Map<TextStyleName, MutableStyle>();
  for (const name of names) {
    const style = textStyles[name] as unknown as MutableStyle;
    originals.set(name, { fontSize: style.fontSize, lineHeight: style.lineHeight });
  }
  if (systemScale > 1) {
    for (const name of names) {
      const base = originals.get(name) as MutableStyle;
      const factor = effectiveFontScale(name, systemScale);
      const style = textStyles[name] as unknown as MutableStyle;
      style.fontSize = base.fontSize * factor;
      style.lineHeight = base.lineHeight * factor;
    }
  }
  return () => {
    for (const name of names) {
      const base = originals.get(name) as MutableStyle;
      const style = textStyles[name] as unknown as MutableStyle;
      style.fontSize = base.fontSize;
      style.lineHeight = base.lineHeight;
    }
  };
}
