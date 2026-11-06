// Pure Today model. No React, no clock reads: `nowMs` is always a parameter.
// One dose-state model and one "next dose" rule, shared by Today and Medicines.
//
// Clinical rules (CLAUDE.md 10-15):
// - A dose is Taken only when the user recorded it. An unrecorded past dose is
//   `notConfirmed`: never Taken, never Missed.
// - A notification being delivered, dismissed or snoozed changes nothing here.
import { doseStatusDisplay, type DoseDisplayState, type StatusDisplay } from '../../design/status';
import type { StringKey } from '../../design/strings';
import type { DoseLog, MedicationRecord } from '../../services/medications/medication-service';

/** Minutes after the scheduled time during which an unrecorded dose is still "due now". */
export const DUE_WINDOW_MINUTES = 60;
const MINUTE_MS = 60_000;

export interface TodayDose {
  dose: DoseLog;
  state: DoseDisplayState;
  scheduledMs: number;
}

export type TodayScreenState = 'loading' | 'newUser' | 'nothingDue' | 'due' | 'allDone' | 'error';

type MedLookup = (medicationId: string) => MedicationRecord | undefined | null;

function parseMs(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function isActiveMedication(med: MedicationRecord | undefined | null): boolean {
  return !med || med.status === 'ACTIVE';
}

/**
 * Display state for one dose.
 * - TAKEN: `takenAt` is the user's recorded `actionTime`. If the server sent no
 *   `actionTime`, fall back to the record's own `updatedAt` (when the user's action
 *   was saved). It is never derived from the scheduled time while a record time exists.
 * - SNOOZED: reminder time is `updatedAt + snoozeMinutes` (the snooze action saved at
 *   `updatedAt`). Once that is more than the due window past, the dose is
 *   `notConfirmed`, not a stale snooze.
 * - A user-recorded MISSED (not in today's DoseStatus enum; handled defensively) is `missedByUser`.
 * - PENDING: upcoming, then dueNow for DUE_WINDOW_MINUTES, then `notConfirmed`.
 * - PENDING/SNOOZED doses of a medicine that is not ACTIVE are `pausedOrStopped`
 *   (pass `med`; omit it to treat the medicine as active).
 */
export function doseDisplayStateFor(
  dose: DoseLog,
  nowMs: number,
  med?: MedicationRecord | null,
): DoseDisplayState {
  const status: string = dose.status;
  const scheduledMs = parseMs(dose.scheduledTime) ?? 0;
  const scheduledAt = new Date(scheduledMs);

  if (status === 'TAKEN') {
    // No recorded time at all: takenAt is an invalid Date, never the scheduled time.
    // Use doseStatusDisplayFor so the label says "time unknown" instead of a time.
    const takenMs = parseMs(dose.actionTime) ?? parseMs(dose.updatedAt);
    return { kind: 'taken', takenAt: new Date(takenMs ?? Number.NaN) };
  }
  if (status === 'SKIPPED') return { kind: 'skipped' };
  if (status === 'MISSED') return { kind: 'missedByUser' };

  if (!isActiveMedication(med)) return { kind: 'pausedOrStopped' };

  const windowMs = DUE_WINDOW_MINUTES * MINUTE_MS;

  if (status === 'SNOOZED') {
    const remindMs = (parseMs(dose.updatedAt) ?? scheduledMs) + (dose.snoozeMinutes ?? 0) * MINUTE_MS;
    if (nowMs >= remindMs + windowMs) return { kind: 'notConfirmed', scheduledAt };
    return { kind: 'snoozed', remindAt: new Date(remindMs) };
  }

  // PENDING (and anything unrecognised): never Taken, never Missed.
  if (nowMs < scheduledMs) return { kind: 'upcoming', scheduledAt };
  if (nowMs < scheduledMs + windowMs) return { kind: 'dueNow' };
  return { kind: 'notConfirmed', scheduledAt };
}

/** True when the dose has a valid scheduled time. */
export function hasScheduledTime(dose: Pick<DoseLog, 'scheduledTime'>): boolean {
  return parseMs(dose.scheduledTime) !== null;
}

/** True when a Taken dose has a recorded time (actionTime, else updatedAt). */
export function hasTakenTime(dose: Pick<DoseLog, 'actionTime' | 'updatedAt'>): boolean {
  return parseMs(dose.actionTime) !== null || parseMs(dose.updatedAt) !== null;
}

/**
 * Status pill content for a dose and its state. Same as doseStatusDisplay, except a
 * dose with no valid scheduled time shows "Time unknown" (not a 1970 time), and a Taken
 * dose with no recorded time shows "Taken, time unknown" (rule 13: never guess a time).
 */
export function doseStatusDisplayFor(
  dose: DoseLog,
  state: DoseDisplayState,
  formatTime: (d: Date) => string,
): StatusDisplay | null {
  if (state.kind === 'taken' && !hasTakenTime(dose)) {
    return { labelKey: 'status.takenTimeUnknown', tone: 'success', variant: 'soft', icon: 'checkmark-circle' };
  }
  if ((state.kind === 'notConfirmed' || state.kind === 'upcoming') && !hasScheduledTime(dose)) {
    return { labelKey: 'status.timeUnknown', tone: 'neutral', variant: 'soft', icon: 'help-circle-outline' };
  }
  return doseStatusDisplay(state, formatTime);
}

/** Doses with their display state, sorted by time. Paused/stopped medicines are excluded. */
export function toTodayDoses(doses: DoseLog[], nowMs: number, medFor?: MedLookup): TodayDose[] {
  return doses
    .map((dose) => ({
      dose,
      state: doseDisplayStateFor(dose, nowMs, medFor ? medFor(dose.medicationId) : undefined),
      scheduledMs: parseMs(dose.scheduledTime) ?? 0,
    }))
    .filter((d) => d.state.kind !== 'pausedOrStopped')
    .sort((a, b) => a.scheduledMs - b.scheduledMs);
}

function remindMsOf(d: TodayDose): number {
  return d.state.kind === 'snoozed' ? d.state.remindAt.getTime() : d.scheduledMs;
}

function earliestOfKind(
  items: TodayDose[],
  kind: DoseDisplayState['kind'],
  by: (d: TodayDose) => number,
): TodayDose | null {
  return items
    .filter((d) => d.state.kind === kind)
    .reduce<TodayDose | null>((best, d) => (best === null || by(d) < by(best) ? d : best), null);
}

function pickNextTodayDose(items: TodayDose[]): TodayDose | null {
  return (
    earliestOfKind(items, 'dueNow', (d) => d.scheduledMs) ??
    earliestOfKind(items, 'snoozed', remindMsOf) ??
    earliestOfKind(items, 'upcoming', (d) => d.scheduledMs)
  );
}

/**
 * THE next-dose rule, for Today and Medicines: earliest dueNow; else the snoozed dose
 * with the earliest reminder time; else the earliest upcoming; else null.
 * `notConfirmed` doses are never the next dose.
 */
export function pickNextDose(doses: DoseLog[], nowMs: number, medFor?: MedLookup): DoseLog | null {
  return pickNextTodayDose(toTodayDoses(doses, nowMs, medFor))?.dose ?? null;
}

export interface GroupedTodayDoses {
  next: TodayDose | null;
  dueNow: TodayDose[];
  /** Unrecorded doses past their window ("earlier today"), so the patient can record them. */
  earlierNotConfirmed: TodayDose[];
  /** Upcoming and snoozed doses other than `next`. */
  later: TodayDose[];
  /** Recorded: taken, skipped, missedByUser. */
  done: TodayDose[];
}

const RECORDED_KINDS: ReadonlyArray<DoseDisplayState['kind']> = ['taken', 'skipped', 'missedByUser'];

export function groupTodayDoses(doses: DoseLog[], nowMs: number, medFor?: MedLookup): GroupedTodayDoses {
  const items = toTodayDoses(doses, nowMs, medFor);
  const next = pickNextTodayDose(items);
  return {
    next,
    dueNow: items.filter((d) => d.state.kind === 'dueNow'),
    earlierNotConfirmed: items.filter((d) => d.state.kind === 'notConfirmed'),
    later: items.filter(
      (d) =>
        (d.state.kind === 'upcoming' || d.state.kind === 'snoozed') &&
        !(next !== null && d.dose.id === next.dose.id),
    ),
    done: items.filter((d) => RECORDED_KINDS.includes(d.state.kind)),
  };
}

/**
 * Screen state per the brief's T1 row. Offline is orthogonal (see useToday).
 * allDone: every scheduled dose today is recorded and none is pending. A not-confirmed
 * dose is unrecorded, so it keeps the screen in `due`.
 */
export function todayScreenState(input: {
  initialized: boolean;
  loadFailed: boolean;
  medications: MedicationRecord[];
  doses: DoseLog[];
  nowMs: number;
}): TodayScreenState {
  const { initialized, loadFailed, medications, doses, nowMs } = input;
  const nothingCached = medications.length === 0 && doses.length === 0;
  if (nothingCached) {
    if (loadFailed) return 'error';
    if (!initialized) return 'loading';
  }
  if (medications.length === 0) return 'newUser';
  const items = toTodayDoses(doses, nowMs, (id) => medications.find((m) => m.id === id));
  if (items.length === 0) return 'nothingDue';
  return items.every((d) => RECORDED_KINDS.includes(d.state.kind)) ? 'allDone' : 'due';
}

export type GreetingKey = 'today.greeting.morning' | 'today.greeting.afternoon' | 'today.greeting.evening';

/** Morning 5-11, afternoon 12-16, evening otherwise. */
export function greetingKey(hour: number): GreetingKey {
  if (hour >= 5 && hour <= 11) return 'today.greeting.morning';
  if (hour >= 12 && hour <= 16) return 'today.greeting.afternoon';
  return 'today.greeting.evening';
}

export function firstNameOf(fullName: string | null | undefined): string | null {
  const first = (fullName ?? '').trim().split(/\s+/)[0];
  return first ? first : null;
}

/** Greeting string key and params. Without a name, the `...NoName` variant is returned. */
export function greetingFor(
  hour: number,
  fullName: string | null | undefined,
): { key: StringKey; params?: { name: string } } {
  const base = greetingKey(hour);
  const name = firstNameOf(fullName);
  return name ? { key: base, params: { name } } : { key: `${base}NoName` as StringKey };
}
