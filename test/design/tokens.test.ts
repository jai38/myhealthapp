import { describe, it, expect } from 'vitest';
import { color, size, motionDuration, textToneColor } from '../../design/tokens';
import { textStyles, maxFontScaleFor } from '../../design/typography';

const HEX = /^#[0-9A-F]{6}$/i;

function collectColorValues(node: unknown): string[] {
  if (typeof node === 'string') return [node];
  if (node && typeof node === 'object') {
    return Object.values(node).flatMap(collectColorValues);
  }
  return [];
}

describe('design tokens', () => {
  it('every color value is a 6-digit hex string', () => {
    const values = collectColorValues(color);
    expect(values.length).toBeGreaterThan(0);
    for (const value of values) {
      expect(value).toMatch(HEX);
    }
  });

  it('minimum touch size is 48', () => {
    expect(size.touchMin).toBe(48);
  });

  it('motionDuration returns 0 with reduced motion and the token value otherwise', () => {
    expect(motionDuration('base', true)).toBe(0);
    expect(motionDuration('base', false)).toBe(250);
  });
});

describe('text styles', () => {
  it('every style has fontFamily, fontSize and lineHeight, with lineHeight >= fontSize', () => {
    const entries = Object.entries(textStyles);
    expect(entries.length).toBe(14);
    for (const [, style] of entries) {
      expect(style.fontFamily).toBeTruthy();
      expect(style.fontSize).toBeGreaterThan(0);
      expect(style.lineHeight).toBeGreaterThanOrEqual(style.fontSize);
    }
  });

  it('caps display and title1 at 1.3 and every other style at 1.6', () => {
    expect(maxFontScaleFor('display')).toBe(1.3);
    expect(maxFontScaleFor('title1')).toBe(1.3);
    expect(maxFontScaleFor('body')).toBe(1.6);
  });
});

describe('v4 type scale', () => {
  it('uses Plus Jakarta Sans at 400, 600 and 700 only', () => {
    const families = new Set(Object.values(textStyles).map((s) => s.fontFamily));
    expect([...families].sort()).toEqual(
      ['PlusJakartaSans_400Regular', 'PlusJakartaSans_600SemiBold', 'PlusJakartaSans_700Bold'],
    );
  });

  it('matches the spec sizes, line heights and tracking', () => {
    expect(textStyles.display).toMatchObject({ fontSize: 34, lineHeight: 40, letterSpacing: -1.02 });
    expect(textStyles.title1).toMatchObject({ fontSize: 28, lineHeight: 34, letterSpacing: -0.7 });
    expect(textStyles.title2).toMatchObject({ fontSize: 20, lineHeight: 25, letterSpacing: -0.4 });
    expect(textStyles.title3).toMatchObject({ fontSize: 17, lineHeight: 22 });
    expect(textStyles.body).toMatchObject({ fontSize: 17, lineHeight: 23 });
    expect(textStyles.button).toMatchObject({ fontSize: 17, lineHeight: 20 });
    expect(textStyles.chip).toMatchObject({ fontSize: 12, lineHeight: 16 });
    expect(textStyles.tab).toMatchObject({ fontSize: 10.5, lineHeight: 13 });
    expect(textStyles.overline).toMatchObject({ textTransform: 'uppercase', letterSpacing: 0.78 });
  });

  it('nothing is smaller than the 10.5 tab label', () => {
    for (const s of Object.values(textStyles)) expect(s.fontSize).toBeGreaterThanOrEqual(10.5);
  });
});

describe('textToneColor', () => {
  it('has all six tone keys', () => {
    expect(Object.keys(textToneColor).sort()).toEqual(
      ['danger', 'inverse', 'link', 'primary', 'secondary', 'tertiary'],
    );
  });
});
