import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  DUE_WINDOW_MINUTES,
  doseDisplayStateFor,
  greetingFor,
  greetingKey,
  groupTodayDoses,
  nextSameMedicineMs,
  pickNextDose,
  todayScreenState,
} from '../features/today/todayModel';
import { doseStatusDisplay } from '../design/status';
import { t } from '../design/strings';
import type { DoseLog, MedicationRecord } from '../services/medications/medication-service';

const MIN = 60_000;
const T0 = new Date('2026-11-05T08:00:00.000Z').getTime();

const dose = (over: Partial<DoseLog> = {}): DoseLog => ({
  id: 'd1',
  medicationId: 'm1',
  patientProfileId: 'p1',
  scheduledTime: new Date(T0).toISOString(),
  status: 'PENDING',
  actionTime: null,
  snoozeMinutes: null,
  createdAt: '2026-11-04T00:00:00.000Z',
  updatedAt: '2026-11-04T00:00:00.000Z',
  ...over,
});
const med = (over: Partial<MedicationRecord> = {}): MedicationRecord => ({
  id: 'm1',
  patientProfileId: 'p1',
  nameAsWritten: 'Synthetic 10mg',
  dosageForm: 'TABLET',
  route: 'ORAL',
  status: 'ACTIVE',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  ...over,
});
const at = (mins: number) => new Date(T0 + mins * MIN).toISOString();
const fmt = (d: Date) => d.toISOString();

describe('doseDisplayStateFor', () => {
  it('window is 2 hours (ST-01, locked 24 November 2026)', () => expect(DUE_WINDOW_MINUTES).toBe(120));

  it('CLINICAL (ST-01): Due now for 2 hours from the scheduled time: 1h59 Due now, 2h01 Not confirmed', () => {
    const d = dose();
    expect(doseDisplayStateFor(d, T0 - 1).kind).toBe('upcoming');
    expect(doseDisplayStateFor(d, T0).kind).toBe('dueNow');
    expect(doseDisplayStateFor(d, T0 + 119 * MIN).kind).toBe('dueNow');
    expect(doseDisplayStateFor(d, T0 + 120 * MIN).kind).toBe('notConfirmed');
    expect(doseDisplayStateFor(d, T0 + 121 * MIN).kind).toBe('notConfirmed');
  });

  it("CLINICAL (ST-01): the window ends early at the same medicine's next dose", () => {
    const first = dose({ id: 'first', scheduledTime: at(0) });
    const second = dose({ id: 'second', scheduledTime: at(60) });
    const otherMed = dose({ id: 'other', medicationId: 'm2', scheduledTime: at(30) });
    const doses = [first, second, otherMed];
    expect(nextSameMedicineMs(first, doses)).toBe(T0 + 60 * MIN);
    // A dose 1 hour before the next dose of the same medicine: Due now until the next one starts.
    expect(doseDisplayStateFor(first, T0 + 59 * MIN, undefined, nextSameMedicineMs(first, doses)).kind).toBe('dueNow');
    expect(doseDisplayStateFor(first, T0 + 60 * MIN, undefined, nextSameMedicineMs(first, doses)).kind).toBe(
      'notConfirmed',
    );
    // Another medicine's dose never shortens the window.
    expect(nextSameMedicineMs(otherMed, doses)).toBeNull();
    // Through groupTodayDoses, the same rule applies (AT-ST-02: doses at 8:00 and 9:00).
    const g = groupTodayDoses([first, second], T0 + 61 * MIN);
    expect(g.earlierNotConfirmed.map((d) => d.dose.id)).toEqual(['first']);
    expect(g.dueNow.map((d) => d.dose.id)).toEqual(['second']);
  });

  it('AT-ST-01: dose at 8:00, next 20:00, nothing recorded: Upcoming, Due now at 8:00, Not confirmed at 10:00', () => {
    const d8 = dose({ id: 'd8', scheduledTime: at(0) });
    const d20 = dose({ id: 'd20', scheduledTime: at(12 * 60) });
    const next = nextSameMedicineMs(d8, [d8, d20]);
    expect(doseDisplayStateFor(d8, T0 - MIN, undefined, next).kind).toBe('upcoming');
    expect(doseDisplayStateFor(d8, T0, undefined, next).kind).toBe('dueNow');
    expect(doseDisplayStateFor(d8, T0 + 120 * MIN, undefined, next).kind).toBe('notConfirmed');
  });

  it('CLINICAL: an unrecorded past dose is notConfirmed, never taken or missedByUser', () => {
    for (const mins of [121, 180, 60 * 24, 60 * 24 * 30]) {
      const state = doseDisplayStateFor(dose(), T0 + mins * MIN);
      expect(state.kind).toBe('notConfirmed');
      const display = doseStatusDisplay(state, fmt);
      expect(display?.labelKey).toBe('status.notConfirmed');
      expect(t(display!.labelKey)).toBe('Not confirmed');
    }
  });

  it('taken uses the recorded actionTime, else the record updatedAt, never the scheduled time', () => {
    const recorded = doseDisplayStateFor(dose({ status: 'TAKEN', actionTime: at(7) }), T0 + 500 * MIN);
    expect(recorded).toEqual({ kind: 'taken', takenAt: new Date(at(7)) });
    const noAction = doseDisplayStateFor(
      dose({ status: 'TAKEN', actionTime: null, updatedAt: at(12) }),
      T0 + 500 * MIN,
    );
    expect(noAction).toEqual({ kind: 'taken', takenAt: new Date(at(12)) });
  });

  it('CLINICAL (ST-01, AT-ST-03): a snoozed dose keeps its time-based word with the reminder time, never Taken', () => {
    const snoozed = dose({ status: 'SNOOZED', snoozeMinutes: 15, updatedAt: at(5) });
    // Within the window: Due now, plus "Reminder again at" 8:20 (updatedAt 8:05 + 15).
    expect(doseDisplayStateFor(snoozed, T0 + 6 * MIN)).toEqual({ kind: 'dueNow', remindAt: new Date(at(20)) });
    // Once the reminder time has passed, still Due now, with no stale reminder line.
    expect(doseDisplayStateFor(snoozed, T0 + 30 * MIN)).toEqual({ kind: 'dueNow' });
    // After the window, Not confirmed like any other unrecorded dose: never Taken, never Missed.
    for (const mins of [120, 200, 600]) {
      const state = doseDisplayStateFor(snoozed, T0 + mins * MIN);
      expect(state.kind).toBe('notConfirmed');
    }
    // The snooze never extends the window.
    const lateSnooze = dose({ status: 'SNOOZED', snoozeMinutes: 15, updatedAt: at(115) });
    expect(doseDisplayStateFor(lateSnooze, T0 + 121 * MIN).kind).toBe('notConfirmed');
    expect(t(doseStatusDisplay(doseDisplayStateFor(snoozed, T0 + 6 * MIN), fmt)!.labelKey)).toBe('Due now');
  });

  it('skipped, and paused/stopped', () => {
    expect(doseDisplayStateFor(dose({ status: 'SKIPPED' }), T0).kind).toBe('skipped');
    expect(doseDisplayStateFor(dose(), T0, med({ status: 'PAUSED' })).kind).toBe('pausedOrStopped');
    expect(doseDisplayStateFor(dose(), T0, med({ status: 'DISCONTINUED' })).kind).toBe(
      'pausedOrStopped',
    );
    expect(
      doseDisplayStateFor(dose({ status: 'TAKEN', actionTime: at(1) }), T0, med({ status: 'PAUSED' }))
        .kind,
    ).toBe('taken');
  });
});

describe('pickNextDose', () => {
  const now = T0 + 30 * MIN;
  const due = dose({ id: 'due', scheduledTime: at(0) });
  // Snoozed 20 minutes ago at 8:20, scheduled 8:10: Due now (ST-01), so it competes on time.
  const snoozed = dose({
    id: 'snz',
    medicationId: 'm2',
    scheduledTime: at(10),
    status: 'SNOOZED',
    snoozeMinutes: 15,
    updatedAt: at(20),
  });
  // Separate medicines, so the next-dose cap (ST-01) doesn't apply between them.
  const upcoming = dose({ id: 'up', medicationId: 'm3', scheduledTime: at(120) });
  const stale = dose({ id: 'stale', medicationId: 'm4', scheduledTime: at(-300) });

  it('the earliest Due now dose (snoozed or not) beats upcoming', () => {
    expect(pickNextDose([upcoming, snoozed, due, stale], now)?.id).toBe('due');
    expect(pickNextDose([upcoming, snoozed, stale], now)?.id).toBe('snz');
    expect(pickNextDose([upcoming, stale], now)?.id).toBe('up');
  });
  it('a snoozed dose past its window is never the next dose', () => {
    const oldSnooze = dose({ id: 'old', scheduledTime: at(-200), status: 'SNOOZED', snoozeMinutes: 15, updatedAt: at(25) });
    expect(pickNextDose([oldSnooze], now)).toBeNull();
  });
  it('never picks a notConfirmed dose; empty gives null', () => {
    expect(pickNextDose([stale], now)).toBeNull();
    expect(pickNextDose([], now)).toBeNull();
  });
  it('both screens use the shared rule', () => {
    const src = (f: string) => readFileSync(new URL(f, import.meta.url), 'utf8');
    // Medicines calls the rule directly; Today gets `next` from useToday, which groups with it.
    expect(src('../features/medications/MedicationsScreen.tsx')).toContain('pickNextDose');
    expect(src('../features/today/useToday.ts')).toContain('groupTodayDoses');
    expect(src('../features/today/HomeScreen.tsx')).toMatch(/useToday\(\)/);
    expect(src('../features/today/HomeScreen.tsx')).not.toMatch(/scheduledTime\)\.getTime\(\) - now/);
    expect(readFileSync(new URL('../features/today/utils.ts', import.meta.url), 'utf8')).not.toContain(
      'getSpotlightDose',
    );
  });
});

describe('groupTodayDoses', () => {
  it('groups by state, sorted by time', () => {
    const now = T0 + 30 * MIN;
    const g = groupTodayDoses(
      [
        dose({ id: 'late', scheduledTime: at(300) }),
        dose({ id: 'old', scheduledTime: at(-200) }),
        dose({ id: 'done', scheduledTime: at(-100), status: 'TAKEN', actionTime: at(-95) }),
        dose({ id: 'due', scheduledTime: at(0) }),
        dose({ id: 'up', scheduledTime: at(120) }),
      ],
      now,
    );
    expect(g.next?.dose.id).toBe('due');
    expect(g.dueNow.map((d) => d.dose.id)).toEqual(['due']);
    expect(g.earlierNotConfirmed.map((d) => d.dose.id)).toEqual(['old']);
    expect(g.later.map((d) => d.dose.id)).toEqual(['up', 'late']);
    expect(g.done.map((d) => d.dose.id)).toEqual(['done']);
  });
});

describe('todayScreenState', () => {
  const base = {
    initialized: true,
    loadFailed: false,
    medications: [med()],
    doses: [] as DoseLog[],
    nowMs: T0,
  };
  it('loading and error only when nothing is cached', () => {
    expect(todayScreenState({ ...base, initialized: false, medications: [] })).toBe('loading');
    expect(todayScreenState({ ...base, loadFailed: true, medications: [] })).toBe('error');
    expect(todayScreenState({ ...base, loadFailed: true })).not.toBe('error');
    expect(todayScreenState({ ...base, initialized: false })).not.toBe('loading');
  });
  it('newUser, nothingDue, due, allDone', () => {
    expect(todayScreenState({ ...base, medications: [] })).toBe('newUser');
    expect(todayScreenState(base)).toBe('nothingDue');
    expect(todayScreenState({ ...base, doses: [dose()] })).toBe('due');
    expect(
      todayScreenState({
        ...base,
        nowMs: T0 + 500 * MIN,
        doses: [dose({ status: 'TAKEN', actionTime: at(1) }), dose({ id: 'b', status: 'SKIPPED' })],
      }),
    ).toBe('allDone');
    // An unrecorded past dose keeps the screen in due, never allDone.
    expect(todayScreenState({ ...base, nowMs: T0 + 500 * MIN, doses: [dose()] })).toBe('due');
  });
});

describe('greeting', () => {
  it('boundaries', () => {
    expect(greetingKey(4)).toBe('today.greeting.evening');
    expect(greetingKey(5)).toBe('today.greeting.morning');
    expect(greetingKey(11)).toBe('today.greeting.morning');
    expect(greetingKey(12)).toBe('today.greeting.afternoon');
    expect(greetingKey(16)).toBe('today.greeting.afternoon');
    expect(greetingKey(17)).toBe('today.greeting.evening');
    expect(greetingKey(0)).toBe('today.greeting.evening');
  });
  it('uses the first name only, with a no-name variant', () => {
    const g = greetingFor(9, '  Asha  Rao ');
    expect(g.params).toEqual({ name: 'Asha' });
    expect(t(g.key, g.params)).toBe('Good morning, Asha 👋');
    const n = greetingFor(9, undefined);
    expect(n.params).toBeUndefined();
    expect(t(n.key)).toBe('Good morning 👋');
  });
});
