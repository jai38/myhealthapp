import { describe, it, expect } from 'vitest';
import {
  contrastRatio,
  flatten,
  specFailingPairs,
  themeContrastPairs,
} from '../../design/contrast';
import { color, layout, motion, radius, size, themes } from '../../design/tokens';
import type { ThemeColors } from '../../design/tokens';
import { resolveThemeName } from '../../design/theme';

const COLOR = /^(#[0-9A-F]{6}|rgba\(\d{1,3},\d{1,3},\d{1,3},(0|1|0?\.\d+)\))$/i;

function keyPaths(node: unknown, prefix = ''): string[] {
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

function values(node: unknown): string[] {
  if (typeof node === 'string') return [node];
  if (node && typeof node === 'object') return Object.values(node).flatMap(values);
  return [];
}

describe('v4 themes (Calm Glass UI v4)', () => {
  it('light and dark define the same tokens', () => {
    expect(keyPaths(themes.dark.color).sort()).toEqual(keyPaths(themes.light.color).sort());
  });

  it.each(['light', 'dark'] as const)('every %s colour is hex or rgba', (name) => {
    for (const v of values(themes[name].color)) expect(v).toMatch(COLOR);
  });

  it('keeps the spec values that pass', () => {
    const l: ThemeColors = themes.light.color;
    const d: ThemeColors = themes.dark.color;
    expect([l.bg.screen, d.bg.screen]).toEqual(['#F7FAFC', '#07111F']);
    expect([l.bg.surface, d.bg.surface]).toEqual(['#FFFFFF', '#0C1B2D']);
    expect([l.bg.glass, d.bg.glass]).toEqual(['rgba(255,255,255,0.72)', 'rgba(16,37,58,0.72)']);
    expect([l.text.primary, d.text.primary]).toEqual(['#0F172A', '#F7FAFF']);
    expect([l.text.secondary, d.text.secondary]).toEqual(['#5B6B7F', '#B7C4D6']);
    expect(d.text.tertiary).toBe('#8EA0B5');
    expect([l.action.blue, d.action.blue]).toEqual(['#0071FF', '#2E90FF']);
    expect([l.text.error, d.text.error]).toEqual(['#D0101F', '#FF6B76']);
    expect([l.hero.from, l.hero.mid, l.hero.to]).toEqual(['#0060FC', '#0080FC', '#00C69C']);
    expect(l.dose.notConfirmed).toEqual({ fg: '#9A5B00', bg: '#FFF1DB' });
    expect(l.dose.missed).toEqual({ fg: '#D0101F', bg: '#FDE8EA' });
    expect(d.dose.taken).toEqual({ fg: '#5FD38D', bg: 'rgba(95,211,141,0.14)' });
  });

  it('has no button glow in dark', () => {
    expect(themes.light.shadow.button).not.toBeNull();
    expect(themes.dark.shadow.button).toBeNull();
  });

  it('the legacy `color` export is the v4 light theme', () => {
    expect(color.bg.screen).toBe(themes.light.color.bg.screen);
    expect(color.text.primary).toBe(themes.light.color.text.primary);
    expect(color.text.tertiary).toBe(themes.light.color.text.tertiary);
    expect(color.text.link).toBe(themes.light.color.text.link);
    expect(color.tone.caution.fg).toBe(themes.light.color.dose.notConfirmed.fg);
  });
});

describe('v4 shape, layout and motion', () => {
  it('uses the spec radii, layout and motion', () => {
    expect([radius.hero, radius.card, radius.tile, radius.input, radius.iconChip]).toEqual([28, 22, 18, 16, 12]);
    expect(layout.tabBar).toEqual({ inset: 16, bottom: 30, height: 68, radius: 34 });
    expect(layout.screenMargin).toBe(16);
    expect(layout.rowMinHeight).toBe(68);
    expect(size.tabBarHeight).toBe(68);
    expect(motion.duration).toEqual({ fast: 150, base: 250, slow: 350 });
    expect(motion.easing.bezier).toEqual([0.2, 0, 0, 1]);
  });

  it('keeps touch targets at 48, above the spec minimum of 44', () => {
    expect(size.touchMin).toBeGreaterThanOrEqual(44);
    expect(size.touchMin).toBe(48);
  });
});

describe('flatten', () => {
  it('returns an opaque hex unchanged', () => {
    expect(flatten('#0F172A', '#F7FAFC')).toBe('#0F172A');
  });

  it('composites rgba over the layer under it', () => {
    expect(flatten('rgba(0,0,0,0.5)', '#FFFFFF')).toBe('#808080');
    expect(flatten('rgba(16,37,58,0.72)', '#07111F')).toBe('#0D1F32');
  });
});

describe.each(['light', 'dark'] as const)('%s theme contrast', (name) => {
  const pairs = themeContrastPairs(name);

  it('declares the text, tab, chip and button pairs', () => {
    expect(pairs.length).toBeGreaterThanOrEqual(28);
  });

  it.each(pairs.map((p) => [p.name, p] as const))(
    '%s',
    (_label, p) => {
      const ratio = contrastRatio(p.fg, p.bg);
      if (ratio < p.min) throw new Error(`${p.name}: measured ${ratio.toFixed(2)}, need ${p.min}`);
      expect(ratio).toBeGreaterThanOrEqual(p.min);
    },
  );
});

describe('spec values behind interim tokens', () => {
  it.each(specFailingPairs.map((p) => [p.name, p] as const))(
    '%s still fails, so its interim token stays',
    (_name, p) => {
      expect(contrastRatio(p.fg, p.bg)).toBeLessThan(p.min);
    },
  );
});

describe('resolveThemeName', () => {
  it('follows the system setting', () => {
    expect(resolveThemeName('dark', null)).toBe('dark');
    expect(resolveThemeName('light', null)).toBe('light');
  });

  it('falls back to light when the system gives no answer', () => {
    expect(resolveThemeName(null, null)).toBe('light');
    expect(resolveThemeName(undefined, null)).toBe('light');
  });

  it('a pinned scheme wins over the system', () => {
    expect(resolveThemeName('dark', 'light')).toBe('light');
    expect(resolveThemeName('light', 'dark')).toBe('dark');
  });
});

import { themedToneColor } from '../../design/components/Foundations/textStyle';
import { textToneColor } from '../../design/tokens';

describe('themedToneColor', () => {
  it('in the light theme equals the light text tones the app uses today', () => {
    for (const tone of Object.keys(textToneColor) as (keyof typeof textToneColor)[]) {
      expect(themedToneColor(tone, themes.light.color)).toBe(textToneColor[tone]);
    }
  });

  it('in the dark theme uses the dark text tokens', () => {
    expect(themedToneColor('primary', themes.dark.color)).toBe('#F7FAFF');
    expect(themedToneColor('danger', themes.dark.color)).toBe('#FF6B76');
  });
});

import { choiceColors } from '../../design/components/Inputs/choiceStyle';

describe('choiceColors with a theme', () => {
  it('in the light theme equals the light chip colours', () => {
    for (const selected of [true, false]) {
      for (const disabled of [true, false]) {
        expect(choiceColors({ selected, disabled, theme: themes.light.color })).toEqual(choiceColors({ selected, disabled }));
      }
    }
  });

  it('in the dark theme uses the dark fills', () => {
    expect(choiceColors({ selected: false, disabled: false, theme: themes.dark.color }).bg).toBe('rgba(255,255,255,0.07)');
  });
});
