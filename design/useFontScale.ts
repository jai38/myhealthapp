import { useWindowDimensions } from 'react-native';

/** Above this system text scale, side-by-side parts stack so labels keep one line. */
export const STACK_AT_FONT_SCALE = 1.3;

/**
 * The system text scale. The dev screen preview, which has no system setting on web, sets
 * globalThis.__previewFontScale to the scale it imitates (features/dev-preview/previewFontScale.ts).
 */
export function useFontScale(): number {
  const { fontScale } = useWindowDimensions();
  const preview = (globalThis as { __previewFontScale?: number }).__previewFontScale;
  return Math.max(fontScale || 1, typeof preview === 'number' ? preview : 1);
}
