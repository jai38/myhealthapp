import { describe, it, expect } from 'vitest';
import {
  contrastRatio,
  contrastPairs,
  forbiddenPairs,
  meetsTouchTarget,
  MIN_TOUCH,
} from '../../design/contrast';

describe('contrastRatio', () => {
  it('measures black on white as 21:1', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
  });

  it('measures white on white as 1:1', () => {
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('measures clear blue on white as about 4.56:1', () => {
    expect(contrastRatio('#2878C7', '#FFFFFF')).toBeCloseTo(4.56, 2);
  });
});

describe('contrastPairs', () => {
  it('declares at least 17 pairs', () => {
    expect(contrastPairs.length).toBeGreaterThanOrEqual(17);
  });

  it.each(contrastPairs.map((p) => [p.name, p] as const))(
    '%s meets its minimum',
    (_name, p) => {
      const ratio = contrastRatio(p.fg, p.bg);
      if (ratio < p.min) {
        throw new Error(`${p.name}: measured ${ratio.toFixed(2)}, need ${p.min}`);
      }
      expect(ratio).toBeGreaterThanOrEqual(p.min);
    },
  );
});

describe('forbiddenPairs', () => {
  it.each(forbiddenPairs.map((p) => [p.name, p] as const))(
    '%s stays below its minimum',
    (_name, p) => {
      const ratio = contrastRatio(p.fg, p.bg);
      expect(ratio).toBeLessThan(p.min);
    },
  );
});

describe('meetsTouchTarget', () => {
  it('accepts minHeight and minWidth at 48', () => {
    expect(meetsTouchTarget({ minHeight: 48, minWidth: 48 })).toBe(true);
  });

  it('rejects 40 by 40', () => {
    expect(meetsTouchTarget({ height: 40, width: 40 })).toBe(false);
  });

  it('accepts 40 by 40 with a 4 point hit slop', () => {
    expect(meetsTouchTarget({ height: 40, width: 40 }, 4)).toBe(true);
  });

  it('rejects an empty style', () => {
    expect(meetsTouchTarget({})).toBe(false);
  });

  it('uses the 48 point minimum', () => {
    expect(MIN_TOUCH).toBe(48);
  });
});
