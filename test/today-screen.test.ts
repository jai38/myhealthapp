import { describe, it, expect } from 'vitest';
import { asNeededMedications, formatTodayTime, medicineFormFor } from '../features/today/todaySections';
import {
  ROWS_BEFORE_SHOW_ALL,
  allTodayItems,
  dayPartOf,
  doseDetail,
  heroModel,
  markTakenDoseId,
  todayGroups,
  todayNotices,
} from '../features/today/todayView';
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

describe('S06 view model (todayView)', () => {
  const at = (h: number, m = 0) => {
    const d = new Date(NOW);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const nowAt = (h: number, m = 0) => {
    const d = new Date(NOW);
    d.setHours(h, m, 0, 0);
    return d.getTime();
  };

  it('groups by Morning, Afternoon and Evening and hides empty groups', () => {
    const doses = [
      dose({ id: 'a', scheduledTime: at(8) }),
      dose({ id: 'b', scheduledTime: at(20) }),
    ];
    const g = groupTodayDoses(doses, nowAt(10, 30), () => med());
    const groups = todayGroups(allTodayItems(g));
    expect(groups.map((x) => x.part)).toEqual(['morning', 'evening']);
    expect(dayPartOf(11)).toBe('morning');
    expect(dayPartOf(12)).toBe('afternoon');
    expect(dayPartOf(17)).toBe('evening');
  });

  it('the hero counts recorded Taken doses only, and Not confirmed as needing confirming', () => {
    const doses = [
      dose({ id: 'taken', scheduledTime: at(7), status: 'TAKEN', actionTime: at(7, 5) }),
      dose({ id: 'skipped', scheduledTime: at(7, 30), status: 'SKIPPED' }),
      dose({ id: 'nc', scheduledTime: at(8) }),
      dose({ id: 'due', scheduledTime: at(10) }),
      dose({ id: 'later', scheduledTime: at(20) }),
    ];
    const g = groupTodayDoses(doses, nowAt(10, 30), () => med());
    const hero = heroModel({ screenState: 'due', items: allTodayItems(g), next: { name: 'X', time: '10:00 AM' } });
    expect(hero.taken).toBe(1);
    expect(hero.total).toBe(5);
    expect(t(hero.headlineKey, hero.headlineParams)).toBe('1 of 5 taken');
    expect(hero.lines.map((l) => t(l.key, l.params))).toEqual(['Next: X · 10:00 AM', '1 needs confirming']);
  });

  it('all done says so, and a skipped dose keeps the ring short of full', () => {
    const doses = [
      dose({ id: 'taken', scheduledTime: at(7), status: 'TAKEN', actionTime: at(7, 5) }),
      dose({ id: 'skipped', scheduledTime: at(8), status: 'SKIPPED' }),
    ];
    const g = groupTodayDoses(doses, nowAt(10, 30), () => med());
    const hero = heroModel({ screenState: 'allDone', items: allTodayItems(g), next: null });
    expect(t(hero.headlineKey)).toBe('All done for today ✓');
    expect(hero.taken).toBe(1);
    expect(hero.total).toBe(2);
  });

  it('Mark as Taken goes under the earliest Due now dose only, never an upcoming or Not confirmed one', () => {
    const due = groupTodayDoses(
      [dose({ id: 'nc', scheduledTime: at(8) }), dose({ id: 'due', scheduledTime: at(10) }), dose({ id: 'due2', medicationId: 'm2', scheduledTime: at(10, 15) })],
      nowAt(10, 30),
      () => med(),
    );
    expect(markTakenDoseId(due)).toBe('due');
    const onlyLater = groupTodayDoses([dose({ id: 'later', scheduledTime: at(20) })], nowAt(10, 30), () => med());
    expect(markTakenDoseId(onlyLater)).toBeNull();
    const onlyNc = groupTodayDoses([dose({ id: 'nc', scheduledTime: at(8) })], nowAt(10, 30), () => med());
    expect(markTakenDoseId(onlyNc)).toBeNull();
  });

  it('the Undo toast keeps the notice slot empty, so the two never stack', () => {
    const base = { loadError: null, uploadError: null, uploading: 'Uploading', saved: null };
    expect(todayNotices({ ...base, toastVisible: true })).toEqual([]);
    expect(todayNotices({ ...base, toastVisible: false }).map((n) => n.kind)).toEqual(['uploading']);
  });

  it('dose detail joins what is recorded and invents nothing', () => {
    expect(doseDetail({ strength: '5 mg', form: 'Tablet', time: '1:00 PM' })).toBe('5 mg · Tablet · 1:00 PM');
    expect(doseDetail({ strength: '', form: null, time: '1:00 PM' })).toBe('1:00 PM');
  });

  it('shows up to five rows before Show all', () => {
    expect(ROWS_BEFORE_SHOW_ALL).toBe(5);
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

describe('todayScreenState while the first load runs', () => {
  const base = { initialized: true, loadFailed: false, medications: [], doses: [], nowMs: NOW };
  it('is loading, not new user, with nothing cached and the first load still running', () => {
    expect(todayScreenState({ ...base, loadSettled: false })).toBe('loading');
  });
  it('is new user once the load settled with no medicines', () => {
    expect(todayScreenState({ ...base, loadSettled: true })).toBe('newUser');
    expect(todayScreenState(base)).toBe('newUser');
  });
  it('shows cached medicines at once, without waiting for the load', () => {
    expect(todayScreenState({ ...base, medications: [med()], loadSettled: false })).toBe('nothingDue');
  });
});
