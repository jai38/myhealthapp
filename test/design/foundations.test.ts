import { describe, it, expect } from 'vitest';
import { color, textToneColor } from '../../design/tokens';
import type { TextTone } from '../../design/tokens';
import { textStyles } from '../../design/typography';
import { contrastRatio, MIN_TEXT } from '../../design/contrast';
import {
  medicineFormIcon,
  resolveIconColor,
} from '../../design/components/Foundations/iconNames';
import { textStyleFor } from '../../design/components/Foundations/textStyle';

// Pill-picture icon names. Medicine forms must never map to one of these.

// Every tone a Text can take. Compile-time check: adding a tone breaks this record.
const TEXT_TONE_KEYS: Record<TextTone, true> = {
  primary: true,
  secondary: true,
  tertiary: true,
  inverse: true,
  link: true,
  danger: true,
};
const TEXT_TONES = Object.keys(TEXT_TONE_KEYS) as TextTone[];

describe('medicineFormIcon', () => {
  const values = Object.values(medicineFormIcon);

  it('covers all eight forms with a distinct glyph each', () => {
    expect(Object.keys(medicineFormIcon).sort()).toEqual(
      ['capsule', 'drops', 'inhaler', 'injection', 'liquid', 'other', 'tablet', 'topical'],
    );
    expect(new Set(values).size).toBe(values.length);
  });

  it('uses monochrome glyph names, never colored or image variants', () => {
    // Glyph fonts render in one color; this guards against image-style names.
    for (const name of values) {
      expect(name).not.toMatch(/color|image|photo|emoji/i);
    }
  });
});

describe('resolveIconColor', () => {
  it('resolves a text tone to its text color', () => {
    expect(resolveIconColor('primary')).toBe(color.text.primary);
  });

  it('resolves a status tone to its foreground color', () => {
    expect(resolveIconColor('success')).toBe(color.tone.success.fg);
  });
});

describe('textStyleFor', () => {
  it('merges the variant font size with the tone color', () => {
    const style = textStyleFor('title1', 'secondary');
    expect(style.fontSize).toBe(textStyles.title1.fontSize);
    expect(style.fontSize).toBe(textStyles.title1.fontSize);
    expect(style.color).toBe(color.text.secondary);
  });
});

describe('text tone contrast', () => {
  it.each(TEXT_TONES)('%s passes MIN_TEXT on its declared background', (tone) => {
    // Inverse text sits on filled actions, not on the white screen.
    const background = tone === 'inverse' ? color.action.primary : color.bg.screen;
    const ratio = contrastRatio(textToneColor[tone], background);
    expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT);
  });
});
