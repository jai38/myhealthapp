import type { StringKey } from '../../strings';
import type { IconName } from '../Foundations/iconNames';
import { color } from '../../tokens';
import type { ToneName } from '../../tokens';

export type SyncState = 'synced' | 'pending' | 'error';

// Sync problems are calm: an error uses the caution tone and says nothing was lost.
// No state uses the danger tone.
export function syncDisplay(state: SyncState): { labelKey: StringKey; icon: IconName; tone: ToneName } {
  switch (state) {
    case 'synced':
      return { labelKey: 'feedback.synced', icon: 'cloud-done-outline', tone: 'success' };
    case 'pending':
      return { labelKey: 'feedback.syncPending', icon: 'sync-outline', tone: 'neutral' };
    case 'error':
      return { labelKey: 'feedback.syncError', icon: 'alert-circle-outline', tone: 'caution' };
  }
}

export function clampProgress(p: number): number {
  if (Number.isNaN(p)) return 0;
  return Math.min(1, Math.max(0, p));
}

export function progressPercent(p: number): number {
  return Math.round(clampProgress(p) * 100);
}

export const TOAST_DURATION_MS = 4000;

// The skeleton fill is drawn in base; the highlight is the surface behind it.
export const skeletonColors = {
  base: color.bg.subtle,
  highlight: color.bg.screen,
} as const;

export const SHIMMER_MS = 1200;
