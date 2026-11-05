import { describe, it, expect } from 'vitest';
import {
  defaultPasswordRules,
  evaluatePasswordRules,
  fieldColors,
  fieldLayout,
  fieldState,
  parseDecimal,
  sanitizeOtp,
} from '../../design/components/Inputs/inputStyle';
import type { FieldState } from '../../design/components/Inputs/inputStyle';
import { color } from '../../design/tokens';
import { contrastRatio, meetsTouchTarget, MIN_TEXT, MIN_UI } from '../../design/contrast';

const bools = [true, false];

describe('fieldState priority', () => {
  for (const disabled of bools) {
    for (const error of bools) {
      for (const focused of bools) {
        it(`disabled=${disabled} error=${error} focused=${focused}`, () => {
          const expected: FieldState = disabled
            ? 'disabled'
            : error
              ? 'error'
              : focused
                ? 'focused'
                : 'default';
          expect(fieldState({ focused, error, disabled })).toBe(expected);
        });
      }
    }
  }
});

const states: FieldState[] = ['default', 'focused', 'error', 'disabled'];

describe('field colors meet contrast in every state', () => {
  for (const state of states) {
    it(`${state}: value text and placeholder meet 4.5:1 on the field background`, () => {
      const { bg, text, placeholder } = fieldColors(state);
      expect(contrastRatio(text, bg)).toBeGreaterThanOrEqual(MIN_TEXT);
      expect(contrastRatio(placeholder, bg)).toBeGreaterThanOrEqual(MIN_TEXT);
    });

    it(`${state}: border meets 3:1 on the screen background`, () => {
      const { border } = fieldColors(state);
      expect(contrastRatio(border, color.bg.screen)).toBeGreaterThanOrEqual(MIN_UI);
    });
  }
});

describe('password rules', () => {
  const metKeys = (value: string) =>
    evaluatePasswordRules(value)
      .filter((r) => r.met)
      .map((r) => r.key);

  it("'abc' meets only the letter rule", () => {
    expect(metKeys('abc')).toEqual(['password.ruleLetter']);
  });

  it("'abcdefg1' meets all three rules", () => {
    expect(metKeys('abcdefg1')).toEqual(defaultPasswordRules.map((r) => r.key));
  });

  it("'' meets no rule", () => {
    expect(metKeys('')).toEqual([]);
  });
});

describe('sanitizeOtp', () => {
  it("keeps digits only, truncated to six", () => {
    expect(sanitizeOtp('12a3 45-67')).toBe('123456');
  });

  it("keeps a short code as typed", () => {
    expect(sanitizeOtp('12', 6)).toBe('12');
  });
});

describe('parseDecimal', () => {
  it.each([
    ['120', 120],
    [' 98.6 ', 98.6],
    ['-2', -2],
    ['0.5', 0.5],
  ])('parses %j to %d', (text, expected) => {
    expect(parseDecimal(text)).toBe(expected);
  });

  it.each(['', '.', '-', '1,5', '1.2.3', '1e3', 'abc', '5.'])(
    'returns null for %j',
    (text) => {
      expect(parseDecimal(text)).toBeNull();
    },
  );
});

describe('touch target', () => {
  it('the field box meets the 48 dp minimum', () => {
    expect(meetsTouchTarget({ minHeight: fieldLayout.minHeight, minWidth: 48 })).toBe(true);
  });
});
