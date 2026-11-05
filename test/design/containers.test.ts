import { describe, it, expect } from 'vitest';
import {
  cardStyle,
  iconTileColors,
  listRowLayout,
  SHEET_MAX_HEIGHT_RATIO,
  stepStates,
} from '../../design/components/Containers/containerStyle';
import { color } from '../../design/tokens';
import { contrastRatio, meetsTouchTarget, MIN_TEXT, MIN_UI } from '../../design/contrast';

describe('icon tile colors meet UI contrast', () => {
  for (const tone of ['blue', 'teal', 'neutral'] as const) {
    it(`${tone} icon on its tile`, () => {
      const { icon, bg } = iconTileColors(tone);
      expect(contrastRatio(icon, bg)).toBeGreaterThanOrEqual(MIN_UI);
    });
  }
});

describe('hero card and pressed row text contrast', () => {
  it('hero card text primary and secondary on tint blue', () => {
    expect(cardStyle.hero.backgroundColor).toBe(color.bg.tintBlue);
    expect(contrastRatio(color.text.primary, color.bg.tintBlue)).toBeGreaterThanOrEqual(MIN_TEXT);
    expect(contrastRatio(color.text.secondary, color.bg.tintBlue)).toBeGreaterThanOrEqual(MIN_TEXT);
  });

  it('pressed list row subtitle (text secondary on subtle) meets text minimum', () => {
    expect(contrastRatio(color.text.secondary, color.bg.subtle)).toBeGreaterThanOrEqual(MIN_TEXT);
  });
});

describe('list row touch target', () => {
  it('meets the touch minimum', () => {
    expect(meetsTouchTarget({ minHeight: listRowLayout.minHeight, minWidth: 48 })).toBe(true);
  });
});

describe('stepStates', () => {
  it('marks done, current and upcoming steps', () => {
    expect(stepStates(4, 1)).toEqual(['done', 'current', 'upcoming', 'upcoming']);
  });

  it('clamps a current index above the range to the last step', () => {
    expect(stepStates(3, 9)).toEqual(['done', 'done', 'current']);
  });

  it('clamps a current index below the range to the first step', () => {
    expect(stepStates(3, -1)).toEqual(['current', 'upcoming', 'upcoming']);
  });
});

describe('bottom sheet height', () => {
  it('is between half and the full window', () => {
    expect(SHEET_MAX_HEIGHT_RATIO).toBeGreaterThan(0.5);
    expect(SHEET_MAX_HEIGHT_RATIO).toBeLessThanOrEqual(1);
  });
});
