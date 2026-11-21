// Pure helpers for the v4 (Calm Glass) parts. No React, so they are unit-tested directly.
import type { DoseDisplayState } from '../../status';
import type { StatusColors, ThemeColors } from '../../tokens';

// ---- Dose status chip ----------------------------------------------------------------------

export type DoseChipColors = { fg: string; bg: string; gradient: { from: string; to: string } | null };

/**
 * Chip colours for a dose state (spec: "Dose status chips"). The label and icon always come
 * from doseStatusDisplay; this picks colours only. Missed is red only because the user chose it.
 */
export function doseChipColors(state: DoseDisplayState, c: ThemeColors): DoseChipColors | null {
  const soft = (s: StatusColors): DoseChipColors => ({ fg: s.fg, bg: s.bg, gradient: null });
  switch (state.kind) {
    case 'taken':
      return soft(c.dose.taken);
    case 'dueNow':
      return { fg: c.dose.dueNow.fg, bg: c.dose.dueNow.to, gradient: { from: c.dose.dueNow.from, to: c.dose.dueNow.to } };
    case 'notConfirmed':
      return soft(c.dose.notConfirmed);
    case 'missedByUser':
      return soft(c.dose.missed);
    case 'upcoming':
    case 'snoozed':
    case 'skipped':
      return soft(c.dose.upcoming);
    case 'pausedOrStopped':
      return null;
  }
}

// ---- Hero ring -----------------------------------------------------------------------------

/** Share of the ring to fill: recorded Taken doses over today's doses (decision D7, no %). */
export function ringProgress(taken: number, total: number): number {
  if (!Number.isFinite(taken) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.min(1, Math.max(0, taken / total));
}

// ---- Single notice slot --------------------------------------------------------------------

export type NoticeKind = 'error' | 'offline' | 'uploading' | 'saved' | 'info';

export interface Notice {
  id: string;
  kind: NoticeKind;
  message: string;
}

// Highest first. An error the user must act on beats progress, which beats a passing "saved".
const NOTICE_ORDER: NoticeKind[] = ['error', 'offline', 'uploading', 'saved', 'info'];

/**
 * The one notice to show (04b decision 3: one notice at a time). The others wait their turn:
 * when the shown one clears, the next highest takes the slot. Ties keep the caller's order.
 */
export function pickNotice(notices: readonly (Notice | null | undefined)[]): Notice | null {
  let best: Notice | null = null;
  for (const n of notices) {
    if (!n) continue;
    if (best === null || NOTICE_ORDER.indexOf(n.kind) < NOTICE_ORDER.indexOf(best.kind)) best = n;
  }
  return best;
}

// ---- Time wheel ----------------------------------------------------------------------------

export const WHEEL_MINUTE_STEP = 5;

/** Same day as `day`, at hour:minute. */
export function atTime(day: Date, hour: number, minute: number): Date {
  const d = new Date(day.getTime());
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** A chosen time, never later than `max` (S07: "other time" can't be in the future). */
export function clampToMax(value: Date, max: Date | null | undefined): Date {
  if (!max || value.getTime() <= max.getTime()) return value;
  return new Date(max.getTime());
}

/** Hours (0–23) the wheel offers on `day`: none after `max`'s hour on max's day. */
export function wheelHours(day: Date, max: Date | null | undefined): number[] {
  const all = Array.from({ length: 24 }, (_, h) => h);
  if (!max) return all;
  return all.filter((h) => atTime(day, h, 0).getTime() <= max.getTime());
}

/** Minutes in WHEEL_MINUTE_STEP steps for `hour` on `day`: none after `max`. */
export function wheelMinutes(day: Date, hour: number, max: Date | null | undefined): number[] {
  const all = Array.from({ length: 60 / WHEEL_MINUTE_STEP }, (_, i) => i * WHEEL_MINUTE_STEP);
  if (!max) return all;
  return all.filter((m) => atTime(day, hour, m).getTime() <= max.getTime());
}
