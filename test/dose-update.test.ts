// S07 Dose update (04b task 14): the pure model. Clinical rules: the sheet opens only for a dose
// awaiting an answer and not in the future; Missed only from the patient's choice; a taken
// time is never in the future; Save stays off until a complete choice.
import { describe, it, expect } from 'vitest';
import {
  EMPTY_DRAFT,
  SKIP_REASONS,
  buildDoseUpdate,
  canOpenDoseUpdate,
  canSave,
  latestTakenTime,
} from '../features/today/doseUpdate';
import { t } from '../design/strings';

const NOW = new Date(2026, 10, 6, 10, 30).getTime();
const at = (h: number, m = 0) => new Date(2026, 10, 6, h, m).toISOString();

describe('canOpenDoseUpdate', () => {
  const active = { status: 'ACTIVE' as const };
  it('opens for a Due now or Not confirmed dose', () => {
    expect(canOpenDoseUpdate({ status: 'PENDING', scheduledTime: at(10) }, active, NOW)).toBe(true);
    expect(canOpenDoseUpdate({ status: 'PENDING', scheduledTime: at(8) }, active, NOW)).toBe(true);
    expect(canOpenDoseUpdate({ status: 'SNOOZED', scheduledTime: at(9) }, active, NOW)).toBe(true);
  });

  it('never opens for a future, recorded, paused or stopped dose', () => {
    expect(canOpenDoseUpdate({ status: 'PENDING', scheduledTime: at(13) }, active, NOW)).toBe(false);
    expect(canOpenDoseUpdate({ status: 'TAKEN', scheduledTime: at(8) }, active, NOW)).toBe(false);
    expect(canOpenDoseUpdate({ status: 'MISSED', scheduledTime: at(8) }, active, NOW)).toBe(false);
    expect(canOpenDoseUpdate({ status: 'PENDING', scheduledTime: at(8) }, { status: 'PAUSED' }, NOW)).toBe(false);
    expect(canOpenDoseUpdate({ status: 'PENDING', scheduledTime: at(8) }, { status: 'DISCONTINUED' }, NOW)).toBe(false);
  });
});

describe('canSave', () => {
  it('is off until a choice', () => {
    expect(canSave(EMPTY_DRAFT)).toBe(false);
    expect(canSave({ ...EMPTY_DRAFT, choice: 'missed' })).toBe(true);
    expect(canSave({ ...EMPTY_DRAFT, choice: 'skipped' })).toBe(true);
    expect(canSave({ ...EMPTY_DRAFT, choice: 'took' })).toBe(true);
  });

  it('needs a time when "Other time" is chosen', () => {
    expect(canSave({ ...EMPTY_DRAFT, choice: 'took', when: 'other' })).toBe(false);
    expect(canSave({ ...EMPTY_DRAFT, choice: 'took', when: 'other', otherTime: new Date(NOW) })).toBe(true);
  });
});

describe('buildDoseUpdate', () => {
  it('records nothing without a choice', () => {
    expect(buildDoseUpdate(EMPTY_DRAFT, at(8), NOW)).toBeNull();
  });

  it('taken as scheduled uses the scheduled time; just now uses now', () => {
    expect(buildDoseUpdate({ ...EMPTY_DRAFT, choice: 'took' }, at(8), NOW)).toEqual({ action: 'TAKEN', actionTime: at(8) });
    expect(buildDoseUpdate({ ...EMPTY_DRAFT, choice: 'took', when: 'now' }, at(8), NOW)).toEqual({
      action: 'TAKEN',
      actionTime: new Date(NOW).toISOString(),
    });
  });

  it('another time is never in the future', () => {
    const later = new Date(NOW + 60 * 60_000);
    expect(buildDoseUpdate({ ...EMPTY_DRAFT, choice: 'took', when: 'other', otherTime: later }, at(8), NOW)).toEqual({
      action: 'TAKEN',
      actionTime: new Date(NOW).toISOString(),
    });
    expect(buildDoseUpdate({ ...EMPTY_DRAFT, choice: 'took', when: 'other', otherTime: new Date(at(9, 15)) }, at(8), NOW)).toEqual({
      action: 'TAKEN',
      actionTime: at(9, 15),
    });
  });

  it('skipped sends the reason only when one was chosen', () => {
    expect(buildDoseUpdate({ ...EMPTY_DRAFT, choice: 'skipped' }, at(8), NOW)).toEqual({ action: 'SKIPPED' });
    expect(buildDoseUpdate({ ...EMPTY_DRAFT, choice: 'skipped', reason: 'RAN_OUT' }, at(8), NOW)).toEqual({
      action: 'SKIPPED',
      skipReason: 'RAN_OUT',
    });
  });

  it('missed only from the "No, I missed it" choice, and never carries a reason', () => {
    expect(buildDoseUpdate({ ...EMPTY_DRAFT, choice: 'missed', reason: 'RAN_OUT' }, at(8), NOW)).toEqual({ action: 'MISSED' });
    for (const choice of ['took', 'skipped'] as const) {
      expect(buildDoseUpdate({ ...EMPTY_DRAFT, choice }, at(8), NOW)?.action).not.toBe('MISSED');
    }
  });
});

describe('latestTakenTime', () => {
  it('is now for a dose today', () => {
    expect(latestTakenTime(new Date(at(8)).getTime(), NOW).getTime()).toBe(NOW);
  });
});

describe('S07 copy', () => {
  it('matches the design', () => {
    expect(t('doseUpdate.question')).toBe('Did you take this dose?');
    expect(t('doseUpdate.footnote')).toBe("This only updates your log. It doesn't change your schedule or reminders.");
    expect(SKIP_REASONS.map((r) => t(r.labelKey))).toEqual(['Felt unwell', 'Doctor advised', 'Ran out', 'Side effects', 'Other']);
  });
});
