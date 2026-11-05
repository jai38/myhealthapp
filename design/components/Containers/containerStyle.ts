import { color, elevation, radius, size, space } from '../../tokens';

export const cardStyle = {
  plain: {
    backgroundColor: color.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border.subtle,
    padding: space.lg,
    ...elevation.card,
  },
  hero: {
    backgroundColor: color.bg.tintBlue,
    borderRadius: radius.xl,
    padding: space.xl,
    ...elevation.raised,
  },
} as const;

export const listRowLayout = {
  minHeight: 64,
  paddingVertical: space.md,
  paddingHorizontal: space.lg,
} as const;

export const iconTileSize = { md: size.tile, lg: size.tileLg } as const;

export function iconTileColors(tone: 'blue' | 'teal' | 'neutral'): { bg: string; icon: string } {
  switch (tone) {
    case 'blue':
      return { bg: color.bg.tintBlue, icon: color.tone.info.fg };
    case 'teal':
      return { bg: color.bg.tintTeal, icon: color.tone.source.fg };
    case 'neutral':
      return { bg: color.bg.subtle, icon: color.text.secondary };
  }
}

export type StepState = 'done' | 'current' | 'upcoming';

// current is 0-based and clamped into range, so an out-of-range value still marks one step.
export function stepStates(total: number, current: number): StepState[] {
  if (total <= 0) return [];
  const active = Math.min(Math.max(current, 0), total - 1);
  return Array.from({ length: total }, (_, i): StepState => {
    if (i < active) return 'done';
    if (i === active) return 'current';
    return 'upcoming';
  });
}

export const SHEET_MAX_HEIGHT_RATIO = 0.9;
