import { color, elevation, radius, space } from '../../tokens';

export const cardStyle = {
  // Flat white card on the grey screen. No border; only a hairline of depth.
  plain: {
    backgroundColor: color.bg.card,
    borderRadius: radius.lg,
    padding: space.lg,
    ...elevation.card,
  },
  hero: {
    backgroundColor: color.bg.tintBlue,
    borderRadius: radius.xl,
    padding: space.xl,
    ...elevation.none,
  },
} as const;

export const listRowLayout = {
  minHeight: 52,
  paddingVertical: space.md,
  paddingHorizontal: space.lg,
} as const;

export const iconTileSize = { md: 36, lg: 48 } as const;

export const iconTileRadius = { md: 10, lg: 12 } as const;

export type TileTone = keyof typeof color.tile;

// The glyph is always white. Every tile fill passes 3:1 against it (see contrast.ts).
export function iconTileColors(tone: TileTone): { bg: string; icon: string } {
  return { bg: color.tile[tone], icon: color.text.inverse };
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
