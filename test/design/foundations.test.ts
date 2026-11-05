import { describe, it, expect } from 'vitest';
import { color, textToneColor } from '../../design/tokens';
import type { TextTone } from '../../design/tokens';
import { textStyles } from '../../design/typography';
import { contrastRatio, MIN_TEXT } from '../../design/contrast';
import {
  medicineFormIcon,
  resolveIconColor,
} from '../../design/components/Foundations/iconNames';
import type { IconName } from '../../design/components/Foundations/iconNames';
import { textStyleFor } from '../../design/components/Foundations/textStyle';

// Pill-picture icon names. Medicine forms must never map to one of these.
const PILL_PICTURE = /pill|capsule|bottle|bandage/i;

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

  it('every value is an IconName and a non-empty string', () => {
    // Type-level: fails to compile if any value is not an IconName.
    const typed: IconName[] = values;
    expect(typed).toHaveLength(values.length);
    for (const name of values) {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });

  it('no medicine form maps to a pill-picture icon', () => {
    for (const name of values) {
      expect(name).not.toMatch(PILL_PICTURE);
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
    expect(style.fontSize).toBe(24);
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
