import { describe, it, expect } from 'vitest';
import { choiceColors, choiceLayout } from '../../design/components/Inputs/choiceStyle';
import {
  buildPartialDate,
  daysInMonth,
  formatPartialDate,
  isLeapYear,
  validatePartialDate,
} from '../../design/components/Inputs/partialDate';
import { formatTime12, from12h, to12h } from '../../design/components/Inputs/time';
import { color } from '../../design/tokens';
import { contrastRatio, meetsTouchTarget, MIN_TEXT, MIN_UI } from '../../design/contrast';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

describe('choice colors meet contrast', () => {
  const states = [
    { name: 'selected', selected: true, disabled: false },
    { name: 'unselected', selected: false, disabled: false },
    { name: 'disabled', selected: false, disabled: true },
  ];

  for (const state of states) {
    it(`${state.name} text meets the text minimum`, () => {
      const { fg, bg } = choiceColors(state);
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(MIN_TEXT);
    });
  }

  for (const state of states.filter((s) => !s.disabled)) {
    it(`${state.name} border meets the UI minimum on the screen`, () => {
      const { border } = choiceColors(state);
      expect(contrastRatio(border, color.bg.screen)).toBeGreaterThanOrEqual(MIN_UI);
    });
  }
});

describe('choice layout', () => {
  it('meets the touch target', () => {
    expect(meetsTouchTarget(choiceLayout)).toBe(true);
  });
});

describe('leap years and month lengths', () => {
  it('isLeapYear', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
  });

  it('daysInMonth', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2021, 4)).toBe(30);
  });
});

describe('validatePartialDate', () => {
  it('accepts and rejects the expected shapes', () => {
    expect(validatePartialDate({ year: 2019 })).toBe(true);
    expect(validatePartialDate({ year: 2019, month: 2, day: 29 })).toBe(false);
    expect(validatePartialDate({ year: 2020, month: 2, day: 29 })).toBe(true);
    expect(validatePartialDate({ year: 2019, day: 3 })).toBe(false);
    expect(validatePartialDate({ year: 1899 })).toBe(false);
    expect(validatePartialDate({ year: 2019, month: 13 })).toBe(false);
  });
});

describe('buildPartialDate', () => {
  it('year precision returns only the year, with no month or day key', () => {
    const result = buildPartialDate('year', { day: '', month: '', year: '2019' });
    expect(result).toStrictEqual({ year: 2019 });
  });

  it('month precision with an empty month is null', () => {
    expect(buildPartialDate('month', { day: '', month: '', year: '2019' })).toBeNull();
  });

  it('day precision with an invalid day is null', () => {
    expect(buildPartialDate('day', { day: '31', month: '4', year: '2021' })).toBeNull();
  });
});

describe('formatPartialDate', () => {
  const monthLabel = (m: number) => MONTHS[m - 1];

  it('formats year, month and full date', () => {
    expect(formatPartialDate({ year: 2019 }, monthLabel)).toBe('2019');
    expect(formatPartialDate({ year: 2019, month: 3 }, monthLabel)).toBe('Mar 2019');
    expect(formatPartialDate({ year: 2019, month: 3, day: 12 }, monthLabel)).toBe('12 Mar 2019');
  });
});

describe('time conversion', () => {
  it('to12h', () => {
    expect(to12h({ hour: 0, minute: 5 })).toEqual({ hour: 12, minute: 5, period: 'am' });
    expect(to12h({ hour: 12, minute: 0 })).toEqual({ hour: 12, minute: 0, period: 'pm' });
    expect(to12h({ hour: 23, minute: 59 })).toEqual({ hour: 11, minute: 59, period: 'pm' });
  });

  it('from12h', () => {
    expect(from12h(12, 0, 'am')).toEqual({ hour: 0, minute: 0 });
    expect(from12h(13, 0, 'pm')).toBeNull();
    expect(from12h(5, 60, 'am')).toBeNull();
  });

  it('formatTime12', () => {
    expect(formatTime12({ hour: 7, minute: 5 }, 'AM', 'PM')).toBe('7:05 AM');
  });
});
