import { describe, it, expect } from 'vitest';
import {
  asNeededMedications,
  dueNowRest,
  formatTodayTime,
  medicineFormFor,
  todaySections,
} from '../features/today/todaySections';
import { groupTodayDoses, todayScreenState } from '../features/today/todayModel';
import { doseStatusDisplay } from '../design/status';
import { t } from '../design/strings';
import type { DoseLog, MedicationRecord } from '../services/medications/medication-service';

const MIN = 60_000;
const NOW = new Date('2026-11-05T10:00:00.000Z').getTime();

const dose = (over: Partial<DoseLog> = {}): DoseLog => ({
  id: 'd1',
  medicationId: 'm1',
  patientProfileId: 'p1',
  scheduledTime: new Date(NOW).toISOString(),
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
  nameAsWritten: 'Synthetic Tab',
  dosageForm: 'TABLET',
  route: 'ORAL',
  status: 'ACTIVE',
  reminderTimes: ['08:00'],
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  ...over,
});

const groupsOf = (doses: DoseLog[]) => groupTodayDoses(doses, NOW, () => med());

describe('todaySections', () => {
  it('newUser shows the empty state and no quick actions', () => {
    const sections = todaySections('newUser', groupsOf([]));
    expect(sections).toEqual(['newUser']);
    expect(sections).not.toContain('quickActions');
  });

  it('loading and error show only their own state', () => {
    expect(todaySections('loading', groupsOf([]))).toEqual(['loading']);
    expect(todaySections('error', groupsOf([]))).toEqual(['error']);
  });

  it('due with an earlier not-confirmed dose shows the earlier section', () => {
    const earlier = dose({ id: 'e1', scheduledTime: new Date(NOW - 3 * 60 * MIN).toISOString() });
    const sections = todaySections('due', groupsOf([earlier]));
    expect(sections).toContain('earlierNotConfirmed');
    expect(sections).toEqual(['earlierNotConfirmed', 'quickActions']);
  });

  it('due orders next, due now, earlier, later, done, then as-needed and quick actions', () => {
    const doses = [
      dose({ id: 'taken', scheduledTime: new Date(NOW - 5 * 60 * MIN).toISOString(), status: 'TAKEN', actionTime: new Date(NOW - 5 * 60 * MIN).toISOString() }),
      dose({ id: 'earlier', scheduledTime: new Date(NOW - 3 * 60 * MIN).toISOString() }),
      dose({ id: 'due', scheduledTime: new Date(NOW - 10 * MIN).toISOString() }),
      dose({ id: 'later', scheduledTime: new Date(NOW + 120 * MIN).toISOString() }),
    ];
    const sections = todaySections('due', groupsOf(doses), true);
    expect(sections).toEqual([
      'next',
      'earlierNotConfirmed',
      'later',
      'done',
      'asNeeded',
      'quickActions',
    ]);
  });

  it('allDone shows the done list and never the next dose', () => {
    const doses = [dose({ id: 'a', status: 'TAKEN', actionTime: new Date(NOW - MIN).toISOString() })];
    const sections = todaySections('allDone', groupsOf(doses));
    expect(sections).toEqual(['allDone', 'done', 'quickActions']);
  });

  it('nothingDue shows the calm empty state and quick actions', () => {
    expect(todaySections('nothingDue', groupsOf([]))).toEqual(['nothingDue', 'quickActions']);
  });
});

describe('dueNowRest', () => {
  it('excludes the next dose from the due-now list', () => {
    const doses = [
      dose({ id: 'first', scheduledTime: new Date(NOW - 10 * MIN).toISOString() }),
      dose({ id: 'second', scheduledTime: new Date(NOW - 5 * MIN).toISOString() }),
    ];
    const groups = groupsOf(doses);
    expect(groups.next?.dose.id).toBe('first');
    expect(dueNowRest(groups).map((d) => d.dose.id)).toEqual(['second']);
  });
});

describe('dose pills on Today', () => {
  it('a not-confirmed dose uses the notConfirmed label and is never Taken or Missed', () => {
    const past = dose({ id: 'p', scheduledTime: new Date(NOW - 3 * 60 * MIN).toISOString() });
    const [item] = groupsOf([past]).earlierNotConfirmed;
    const display = doseStatusDisplay(item.state, formatTodayTime);
    expect(display?.labelKey).toBe('status.notConfirmed');
    expect(t(display!.labelKey)).toBe('Not confirmed');
  });
});

describe('asNeededMedications', () => {
  it('lists active medicines with no reminder times or an as-needed instruction', () => {
    const meds = [
      med({ id: 'a', reminderTimes: [] }),
      med({ id: 'b', reminderTimes: null, status: 'ACTIVE' }),
      med({ id: 'c', prescribedInstructions: 'Take as needed for pain' }),
      med({ id: 'd', prescribedInstructions: 'SOS for nausea' }),
      med({ id: 'e' }),
      med({ id: 'f', reminderTimes: [], status: 'COMPLETED' as MedicationRecord['status'] }),
    ];
    expect(asNeededMedications(meds).map((m) => m.id)).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('medicineFormFor', () => {
  it('maps dosage forms to icon shapes and falls back to other', () => {
    expect(medicineFormFor('TABLET')).toBe('tablet');
    expect(medicineFormFor('Syrup')).toBe('liquid');
    expect(medicineFormFor('Eye drops')).toBe('drops');
    expect(medicineFormFor('Unknown thing')).toBe('other');
    expect(medicineFormFor(null)).toBe('other');
  });
});

describe('todayScreenState for the new-user case', () => {
  it('is newUser when there are no medicines', () => {
    expect(todayScreenState({ initialized: true, loadFailed: false, medications: [], doses: [], nowMs: NOW })).toBe('newUser');
  });
});
