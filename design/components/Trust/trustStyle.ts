import type { StatusDisplay } from '../../status';
import { color, radius, space } from '../../tokens';

const DAY_MS = 24 * 60 * 60 * 1000;

export function pillColors(display: StatusDisplay): { bg: string; fg: string; border: string } {
  const tone = color.tone[display.tone];
  if (display.variant === 'filled') {
    return { bg: tone.fg, fg: color.text.inverse, border: tone.fg };
  }
  return { bg: tone.bg, fg: tone.fg, border: 'transparent' };
}

// The caller passes `now`, so this never reads the clock.
export function isStale(asOf: Date, now: Date, maxAgeDays: number): boolean {
  return now.getTime() - asOf.getTime() > maxAgeDays * DAY_MS;
}

// Pills are not pressable, so 28 is enough.
export const pillLayout = {
  minHeight: 28,
  paddingHorizontal: space.sm,
  borderRadius: radius.full,
} as const;
