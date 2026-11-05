import { describe, it, expect, vi } from 'vitest';
import { isStale, pillColors } from '../../design/components/Trust/trustStyle';
import { doseStatusDisplay, trustLabelDisplay } from '../../design/status';
import type { DoseDisplayState, TrustKind } from '../../design/status';
import { color } from '../../design/tokens';
import type { ToneName } from '../../design/tokens';
import { contrastRatio, MIN_TEXT } from '../../design/contrast';

const FIXED = new Date(Date.UTC(2026, 10, 5, 9, 0));
const formatTime = (): string => '9:00 AM';
const formatDate = (): string => '1 Jan 2026';

const DOSE_STATES: DoseDisplayState[] = [
  { kind: 'upcoming', scheduledAt: FIXED },
  { kind: 'dueNow' },
  { kind: 'snoozed', remindAt: FIXED },
  { kind: 'taken', takenAt: FIXED },
  { kind: 'skipped' },
  { kind: 'missedByUser' },
  { kind: 'notConfirmed', scheduledAt: FIXED },
  { kind: 'pausedOrStopped' },
];

const TRUST_KINDS: TrustKind[] = [
  'fromDocument',
  'addedByYou',
  'fromDoctor',
  'aiDraft',
  'verifiedByYou',
  'uncertain',
];

const TONES = Object.keys(color.tone) as ToneName[];

describe('dose status pills meet text contrast', () => {
  for (const state of DOSE_STATES) {
    it(`${state.kind}`, () => {
      const display = doseStatusDisplay(state, formatTime);
      if (display === null) {
        expect(state.kind).toBe('pausedOrStopped');
        return;
      }
      const { fg, bg } = pillColors(display);
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(MIN_TEXT);
    });
  }
});

describe('trust label pills meet text contrast', () => {
  for (const kind of TRUST_KINDS) {
    it(kind, () => {
      const { fg, bg } = pillColors(trustLabelDisplay(kind));
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(MIN_TEXT);
    });
  }
});

describe('filled pill variant meets text contrast for every tone', () => {
  for (const tone of TONES) {
    it(tone, () => {
      const { fg, bg } = pillColors({
        labelKey: 'status.dueNow',
        tone,
        variant: 'filled',
        icon: 'alarm-outline',
      });
      expect(fg).toBe(color.text.inverse);
      expect(bg).toBe(color.tone[tone].fg);
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(MIN_TEXT);
    });
  }
});

describe('pillColors for dueNow', () => {
  it('is the filled variant on the info tone', () => {
    const display = doseStatusDisplay({ kind: 'dueNow' }, formatTime);
    expect(display).not.toBeNull();
    expect(pillColors(display!)).toEqual({
      bg: color.tone.info.fg,
      fg: color.text.inverse,
      border: color.tone.info.fg,
    });
  });
});

describe('isStale', () => {
  const asOf = new Date(Date.UTC(2026, 0, 1));

  it('is false inside the window', () => {
    expect(isStale(asOf, new Date(Date.UTC(2026, 2, 1)), 90)).toBe(false);
  });

  it('is true past the window', () => {
    expect(isStale(asOf, new Date(Date.UTC(2026, 5, 1)), 90)).toBe(true);
  });

  it('is false at exactly the window length', () => {
    // 2026-01-01 plus 90 days is 2026-04-01.
    expect(isStale(asOf, new Date(Date.UTC(2026, 3, 1)), 90)).toBe(false);
  });

  it('does not read the clock', () => {
    const spy = vi.spyOn(Date, 'now').mockImplementation(() => {
      throw new Error('clock read');
    });
    try {
      expect(() => isStale(asOf, new Date(Date.UTC(2026, 5, 1)), 90)).not.toThrow();
    } finally {
      spy.mockRestore();
    }
  });
});

describe('revision link and disclaimer text contrast', () => {
  it('revision link text.link on bg.screen', () => {
    expect(contrastRatio(color.text.link, color.bg.screen)).toBeGreaterThanOrEqual(MIN_TEXT);
  });

  it('disclaimer text.primary on bg.subtle', () => {
    expect(contrastRatio(color.text.primary, color.bg.subtle)).toBeGreaterThanOrEqual(MIN_TEXT);
  });

  it('disclaimer text.secondary on bg.subtle', () => {
    expect(contrastRatio(color.text.secondary, color.bg.subtle)).toBeGreaterThanOrEqual(MIN_TEXT);
  });
});
