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
    expect(motionDuration('base', false)).toBe(200);
  });
});

describe('text styles', () => {
  it('every style has fontFamily, fontSize and lineHeight, with lineHeight >= fontSize', () => {
    const entries = Object.entries(textStyles);
    expect(entries.length).toBe(9);
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

describe('textToneColor', () => {
  it('has all six tone keys', () => {
    expect(Object.keys(textToneColor).sort()).toEqual(
      ['danger', 'inverse', 'link', 'primary', 'secondary', 'tertiary'],
    );
  });
});
