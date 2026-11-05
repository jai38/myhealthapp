import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  DUE_WINDOW_MINUTES,
  doseDisplayStateFor,
  greetingFor,
  greetingKey,
  groupTodayDoses,
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
  it('window constant is 60', () => expect(DUE_WINDOW_MINUTES).toBe(60));

  it('boundaries: upcoming, dueNow at scheduled and +59, notConfirmed at +60', () => {
    const d = dose();
    expect(doseDisplayStateFor(d, T0 - 1).kind).toBe('upcoming');
    expect(doseDisplayStateFor(d, T0).kind).toBe('dueNow');
    expect(doseDisplayStateFor(d, T0 + 59 * MIN).kind).toBe('dueNow');
    expect(doseDisplayStateFor(d, T0 + 60 * MIN).kind).toBe('notConfirmed');
  });

  it('CLINICAL: an unrecorded past dose is notConfirmed, never taken or missedByUser', () => {
    for (const mins of [61, 180, 60 * 24, 60 * 24 * 30]) {
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

  it('skipped, snoozed (remind = updatedAt + snooze), and paused/stopped', () => {
    expect(doseDisplayStateFor(dose({ status: 'SKIPPED' }), T0).kind).toBe('skipped');
    const snoozed = dose({ status: 'SNOOZED', snoozeMinutes: 15, updatedAt: at(5) });
    expect(doseDisplayStateFor(snoozed, T0 + 6 * MIN)).toEqual({
      kind: 'snoozed',
      remindAt: new Date(at(20)),
    });
    expect(doseDisplayStateFor(snoozed, T0 + 80 * MIN).kind).toBe('notConfirmed');
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
  const snoozed = dose({
    id: 'snz',
    scheduledTime: at(-120),
    status: 'SNOOZED',
    snoozeMinutes: 15,
    updatedAt: at(20),
  });
  const upcoming = dose({ id: 'up', scheduledTime: at(120) });
  const stale = dose({ id: 'stale', scheduledTime: at(-300) });

  it('dueNow beats snoozed beats upcoming', () => {
    expect(pickNextDose([upcoming, snoozed, due, stale], now)?.id).toBe('due');
    expect(pickNextDose([upcoming, snoozed, stale], now)?.id).toBe('snz');
    expect(pickNextDose([upcoming, stale], now)?.id).toBe('up');
  });
  it('picks the snoozed dose with the earliest reminder time', () => {
    const later = dose({
      id: 'snz2',
      scheduledTime: at(-200),
      status: 'SNOOZED',
      snoozeMinutes: 15,
      updatedAt: at(25),
    });
    expect(pickNextDose([later, snoozed], now)?.id).toBe('snz');
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
    expect(t(g.key, g.params)).toBe('Good morning, Asha');
    const n = greetingFor(9, undefined);
    expect(n.params).toBeUndefined();
    expect(t(n.key)).toBe('Good morning');
  });
});
