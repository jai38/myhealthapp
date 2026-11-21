// Pure view model for S06 Today (04b task 13, designes/design/screens.md). No React, no clock
// reads. It arranges what todayModel already decided; it never changes a dose's state.
//
// Clinical rules kept here:
// - The hero counts recorded Taken doses only (decision D7); a skipped dose is not "taken".
// - An unrecorded past dose is Not confirmed, counted as "needs confirming", never as Missed.
// - Mark as Taken goes under one Due now row only, and records nothing by itself.
import type { StringKey } from '../../design/strings';
import type { Notice } from '../../design/components/Glass/glassStyle';
import type { GroupedTodayDoses, TodayDose, TodayScreenState } from './todayModel';

export type DayPart = 'morning' | 'afternoon' | 'evening';

export const DAY_PART_TITLE: Record<DayPart, StringKey> = {
  morning: 'today.morning',
  afternoon: 'today.afternoon',
  evening: 'today.evening',
};

/** Rows a group shows before "Show all" (screens.md: 4–5). */
export const ROWS_BEFORE_SHOW_ALL = 5;

/** Morning before noon, afternoon 12:00–16:59, evening from 17:00. */
export function dayPartOf(hour: number): DayPart {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export interface TodayGroup {
  part: DayPart;
  items: TodayDose[];
  taken: number;
  total: number;
}

/** Today's doses in Morning, Afternoon and Evening, by scheduled time. Empty groups are left out. */
export function todayGroups(items: readonly TodayDose[]): TodayGroup[] {
  const parts: DayPart[] = ['morning', 'afternoon', 'evening'];
  return parts
    .map((part) => {
      const inPart = items
        .filter((d) => dayPartOf(new Date(d.scheduledMs).getHours()) === part)
        .slice()
        .sort((a, b) => a.scheduledMs - b.scheduledMs);
      return {
        part,
        items: inPart,
        taken: inPart.filter((d) => d.state.kind === 'taken').length,
        total: inPart.length,
      };
    })
    .filter((g) => g.total > 0);
}

/** Every dose in the groups, once. */
export function allTodayItems(groups: GroupedTodayDoses): TodayDose[] {
  const seen = new Map<string, TodayDose>();
  for (const d of [...groups.dueNow, ...groups.earlierNotConfirmed, ...groups.later, ...groups.done]) {
    seen.set(d.dose.id, d);
  }
  if (groups.next) seen.set(groups.next.dose.id, groups.next);
  return [...seen.values()];
}

/** The one dose that gets the Mark as Taken button: the earliest Due now dose, or none. */
export function markTakenDoseId(groups: GroupedTodayDoses): string | null {
  return groups.next && groups.next.state.kind === 'dueNow' ? groups.next.dose.id : null;
}

export interface HeroModel {
  headlineKey: StringKey;
  headlineParams?: Record<string, string>;
  lines: { key: StringKey; params?: Record<string, string> }[];
  /** Recorded Taken doses only. */
  taken: number;
  total: number;
}

/**
 * The hero: "N of M taken", the next dose, and how many need confirming. All done says so;
 * the ring still counts Taken only, so a day with a skipped dose never shows a full ring.
 */
export function heroModel(input: {
  screenState: TodayScreenState;
  items: readonly TodayDose[];
  next: { name: string; time: string } | null;
}): HeroModel {
  const { screenState, items, next } = input;
  const taken = items.filter((d) => d.state.kind === 'taken').length;
  const total = items.length;
  const needsConfirming = items.filter((d) => d.state.kind === 'notConfirmed').length;

  if (screenState === 'nothingDue') {
    return { headlineKey: 'today.nothingDueTitle', lines: [], taken: 0, total: 0 };
  }
  if (screenState === 'allDone') {
    return { headlineKey: 'today.heroAllDone', lines: [], taken, total };
  }
  const lines: HeroModel['lines'] = [];
  if (next) lines.push({ key: 'today.heroNext', params: next });
  if (needsConfirming > 0) {
    lines.push({
      key: needsConfirming === 1 ? 'today.heroNeedsConfirming' : 'today.heroNeedConfirming',
      params: { count: String(needsConfirming) },
    });
  }
  return {
    headlineKey: 'today.heroCount',
    headlineParams: { taken: String(taken), total: String(total) },
    lines,
    taken,
    total,
  };
}

/**
 * What wants the single notice slot. While the Undo toast shows, the slot stays empty, so
 * the toast never stacks with an upload or any other notice.
 */
export function todayNotices(input: {
  toastVisible: boolean;
  loadError: string | null;
  uploadError: string | null;
  uploading: string | null;
  saved: string | null;
}): Notice[] {
  if (input.toastVisible) return [];
  const out: Notice[] = [];
  if (input.loadError) out.push({ id: 'load-error', kind: 'error', message: input.loadError });
  if (input.uploadError) out.push({ id: 'upload-error', kind: 'error', message: input.uploadError });
  if (input.uploading) out.push({ id: 'uploading', kind: 'uploading', message: input.uploading });
  if (input.saved) out.push({ id: 'saved', kind: 'saved', message: input.saved });
  return out;
}

/** "5 mg · Oral Tablet · 1:00 PM": what is recorded, nothing invented (no quantity until Phase 12). */
export function doseDetail(parts: { strength?: string | null; form?: string | null; time: string }): string {
  return [parts.strength, parts.form, parts.time]
    .map((p) => (p ?? '').trim())
    .filter((p) => p !== '')
    .join(' · ');
}
