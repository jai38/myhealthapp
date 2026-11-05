import { describe, it, expect, vi } from 'vitest';
import { doseStatusDisplay, trustLabelDisplay } from '../../design/status';
import type { DoseDisplayState, TrustKind } from '../../design/status';
import { en } from '../../design/strings';

const A = new Date('2030-01-15T07:23:00Z');
const B = new Date('2030-01-15T21:00:00Z');
const stub = (d: Date): string => (d === A ? '7:23 AM' : '9:00 PM');

const states: DoseDisplayState[] = [
  { kind: 'upcoming', scheduledAt: B },
  { kind: 'dueNow' },
  { kind: 'snoozed', remindAt: A },
  { kind: 'taken', takenAt: A },
  { kind: 'skipped' },
  { kind: 'missedByUser' },
  { kind: 'notConfirmed', scheduledAt: B },
  { kind: 'pausedOrStopped' },
];

const trustKinds: TrustKind[] = [
  'fromDocument',
  'addedByYou',
  'fromDoctor',
  'aiDraft',
  'verifiedByYou',
  'uncertain',
];

const display = (s: DoseDisplayState) => doseStatusDisplay(s, stub);

describe('doseStatusDisplay table', () => {
  type Row = [DoseDisplayState, string, Record<string, string> | undefined, string, string, string];
  const rows: Row[] = [
    [states[0]!, 'status.upcoming', { time: '9:00 PM' }, 'info', 'soft', 'time-outline'],
    [states[1]!, 'status.dueNow', undefined, 'info', 'filled', 'alarm-outline'],
    [states[2]!, 'status.snoozed', { time: '7:23 AM' }, 'caution', 'soft', 'notifications-outline'],
    [states[3]!, 'status.taken', { time: '7:23 AM' }, 'success', 'soft', 'checkmark-circle'],
    [states[4]!, 'status.skipped', undefined, 'neutral', 'soft', 'remove-circle-outline'],
    [states[5]!, 'status.missedByUser', undefined, 'neutral', 'soft', 'ellipse-outline'],
    [states[6]!, 'status.notConfirmed', undefined, 'neutral', 'soft', 'help-circle-outline'],
  ];

  it.each(rows)('%j', (state, labelKey, labelParams, tone, variant, icon) => {
    const out = display(state);
    expect(out).not.toBeNull();
    expect(out!.labelKey).toBe(labelKey);
    expect(out!.labelParams).toEqual(labelParams);
    expect(out!.tone).toBe(tone);
    expect(out!.variant).toBe(variant);
    expect(out!.icon).toBe(icon);
  });

  it('pausedOrStopped is the eighth state and shows nothing', () => {
    expect(states).toHaveLength(8);
    expect(display({ kind: 'pausedOrStopped' })).toBeNull();
  });

  it('only dueNow is filled', () => {
    for (const s of states) {
      const out = display(s);
      if (out) expect(out.variant).toBe(s.kind === 'dueNow' ? 'filled' : 'soft');
    }
  });
});

describe('dose status safety regressions', () => {
  it('notConfirmed never yields taken or missedByUser, and is neutral', () => {
    const out = display({ kind: 'notConfirmed', scheduledAt: B })!;
    expect(out.labelKey).not.toBe('status.taken');
    expect(out.labelKey).not.toBe('status.missedByUser');
    expect(out.tone).toBe('neutral');
  });

  it('snoozed never yields taken', () => {
    const out = display({ kind: 'snoozed', remindAt: A })!;
    expect(out.labelKey).not.toBe('status.taken');
    expect(out.tone).not.toBe('success');
  });

  it('no dose state ever yields tone danger', () => {
    for (const s of states) {
      expect(display(s)?.tone).not.toBe('danger');
    }
  });

  it('only missedByUser yields status.missedByUser', () => {
    for (const s of states) {
      const out = display(s);
      expect(out?.labelKey === 'status.missedByUser').toBe(s.kind === 'missedByUser');
    }
  });

  it('only taken yields tone success', () => {
    for (const s of states) {
      expect(display(s)?.tone === 'success').toBe(s.kind === 'taken');
    }
  });

  it('pausedOrStopped is null', () => {
    expect(display({ kind: 'pausedOrStopped' })).toBeNull();
  });

  it('formatTime is called with the state own date, not a different one', () => {
    const cases: [DoseDisplayState, Date][] = [
      [{ kind: 'upcoming', scheduledAt: B }, B],
      [{ kind: 'snoozed', remindAt: A }, A],
      [{ kind: 'taken', takenAt: A }, A],
    ];
    for (const [state, expected] of cases) {
      const spy = vi.fn((_d: Date) => 'x');
      doseStatusDisplay(state, spy);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0]![0]).toBe(expected);
    }
  });

  it('formatTime is not called for states without a time label', () => {
    const spy = vi.fn((_d: Date) => 'x');
    const noTime: DoseDisplayState[] = [
      { kind: 'dueNow' },
      { kind: 'skipped' },
      { kind: 'missedByUser' },
      { kind: 'notConfirmed', scheduledAt: B },
      { kind: 'pausedOrStopped' },
    ];
    for (const s of noTime) doseStatusDisplay(s, spy);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('trustLabelDisplay', () => {
  const rows: [TrustKind, string, string, string][] = [
    ['fromDocument', 'trust.fromDocument', 'source', 'document-text-outline'],
    ['addedByYou', 'trust.addedByYou', 'neutral', 'person-outline'],
    ['fromDoctor', 'trust.fromDoctor', 'source', 'medkit-outline'],
    ['aiDraft', 'trust.aiDraft', 'caution', 'sparkles-outline'],
    ['verifiedByYou', 'trust.verifiedByYou', 'success', 'shield-checkmark-outline'],
    ['uncertain', 'trust.uncertain', 'caution', 'alert-circle-outline'],
  ];

  it.each(rows)('%s', (kind, key, tone, icon) => {
    const out = trustLabelDisplay(kind);
    expect(out.labelKey).toBe(key);
    expect(out.tone).toBe(tone);
    expect(out.icon).toBe(icon);
    expect(out.variant).toBe('soft');
  });
});

describe('label keys', () => {
  it('every returned labelKey exists in en', () => {
    const keys = new Set<string>();
    for (const s of states) {
      const out = display(s);
      if (out) keys.add(out.labelKey);
    }
    for (const k of trustKinds) keys.add(trustLabelDisplay(k).labelKey);
    for (const k of keys) {
      expect(Object.prototype.hasOwnProperty.call(en, k)).toBe(true);
    }
  });
});
