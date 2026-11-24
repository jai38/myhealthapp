import { describe, it, expect } from 'vitest';
import {
  atTime,
  clampToMax,
  doseChipColors,
  pickNotice,
  ringProgress,
  wheelHours,
  wheelMinutes,
} from '../../design/components/Glass/glassStyle';
import { themes } from '../../design/tokens';

const day = new Date(2026, 10, 6, 0, 0);
const max = new Date(2026, 10, 6, 10, 30);

describe('doseChipColors', () => {
  const c = themes.light.color;
  it('uses the spec colours per status', () => {
    expect(doseChipColors({ kind: 'taken', takenAt: max }, c)).toMatchObject({ fg: c.dose.taken.fg, bg: c.dose.taken.bg });
    expect(doseChipColors({ kind: 'notConfirmed', scheduledAt: max }, c)).toMatchObject({ fg: c.dose.notConfirmed.fg });
    expect(doseChipColors({ kind: 'upcoming', scheduledAt: max }, c)).toMatchObject({ fg: c.dose.upcoming.fg });
    expect(doseChipColors({ kind: 'dueNow' }, c)?.gradient).toEqual({ from: c.dose.dueNow.from, to: c.dose.dueNow.to });
  });

  it('is red only for a dose the user marked missed, never for Not confirmed', () => {
    expect(doseChipColors({ kind: 'missedByUser' }, c)?.fg).toBe(c.dose.missed.fg);
    expect(doseChipColors({ kind: 'notConfirmed', scheduledAt: max }, c)?.fg).not.toBe(c.dose.missed.fg);
  });

  it('draws no chip for a paused or stopped medicine', () => {
    expect(doseChipColors({ kind: 'pausedOrStopped' }, c)).toBeNull();
  });
});

describe('ringProgress', () => {
  it('is taken over total, kept between 0 and 1', () => {
    expect(ringProgress(2, 5)).toBe(0.4);
    expect(ringProgress(3, 3)).toBe(1);
    expect(ringProgress(4, 3)).toBe(1);
    expect(ringProgress(0, 0)).toBe(0);
    expect(ringProgress(Number.NaN, 3)).toBe(0);
  });
});

describe('pickNotice (one notice at a time)', () => {
  it('shows only the most important notice', () => {
    const shown = pickNotice([
      { id: 's', kind: 'saved', message: 'Saved' },
      { id: 'u', kind: 'uploading', message: 'Uploading' },
      null,
    ]);
    expect(shown?.id).toBe('u');
    expect(pickNotice([{ id: 'u', kind: 'uploading', message: '' }, { id: 'e', kind: 'error', message: '' }])?.id).toBe('e');
  });

  it('shows nothing when no notice wants the slot', () => {
    expect(pickNotice([null, undefined])).toBeNull();
  });

  it('keeps the caller order for equal kinds', () => {
    expect(pickNotice([{ id: 'a', kind: 'saved', message: '' }, { id: 'b', kind: 'saved', message: '' }])?.id).toBe('a');
  });
});

describe('time wheel limits (S07: other time cannot be in the future)', () => {
  it('offers no hour after the limit', () => {
    expect(wheelHours(day, max)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(wheelHours(day, null)).toHaveLength(24);
  });

  it('offers no minute after the limit in its hour', () => {
    expect(wheelMinutes(day, 10, max)).toEqual([0, 5, 10, 15, 20, 25, 30]);
    expect(wheelMinutes(day, 9, max)).toHaveLength(12);
  });

  it('pulls a later time back to the limit', () => {
    expect(clampToMax(atTime(day, 11, 0), max).getTime()).toBe(max.getTime());
    expect(clampToMax(atTime(day, 9, 0), max).getTime()).toBe(atTime(day, 9, 0).getTime());
  });
});
