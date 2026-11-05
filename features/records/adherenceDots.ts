import type { AdherenceCounts } from '../../services/medications/medication-store';

export type AdherenceDotStatus = 'complete' | 'partial' | 'pending' | 'none';

/**
 * Dot state for one day. Only recorded outcomes colour the dot: unrecorded doses
 * leave it neutral ('pending'), never a miss (CLAUDE.md rule 15).
 */
export function adherenceDotStatus(
  a: Pick<AdherenceCounts, 'taken' | 'upcoming' | 'total'>,
): AdherenceDotStatus {
  if (a.total === 0) return 'none';
  if (a.taken === a.total) return 'complete';
  // Some taken and some not: caution only when a dose is past its window, not while still upcoming.
  if (a.taken > 0 && a.taken + a.upcoming < a.total) return 'partial';
  return 'pending';
}
