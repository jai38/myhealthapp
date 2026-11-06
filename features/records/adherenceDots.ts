import type { AdherenceCounts } from '../../services/medications/medication-store';

export type AdherenceDotStatus = 'complete' | 'partial' | 'pending' | 'none';

/**
 * Dot state for one day. Only recorded outcomes colour the dot. A dose nobody recorded
 * (Not confirmed) is never counted as taken or missed, and never turns the dot to caution
 * (CLAUDE.md rule 15). A day with nothing recorded is neutral 'none' (shown as "no data").
 */
export function adherenceDotStatus(
  a: Pick<AdherenceCounts, 'taken' | 'skipped' | 'missed' | 'upcoming' | 'total'>,
): AdherenceDotStatus {
  if (a.total === 0) return 'none';
  const recorded = a.taken + a.skipped + a.missed;
  if (recorded === 0) return 'none';
  if (a.taken === a.total) return 'complete';
  // Caution only for a recorded skip or miss next to a taken dose, and only once nothing is still upcoming.
  if (a.taken > 0 && a.skipped + a.missed > 0 && a.upcoming === 0) return 'partial';
  return 'pending';
}
