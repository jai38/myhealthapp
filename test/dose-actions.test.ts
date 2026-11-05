import { describe, it, expect } from 'vitest';
import { canActOnDose } from '../features/medications/dose-display';

describe('canActOnDose', () => {
  it('offers actions for pending and snoozed doses of an active medicine', () => {
    expect(canActOnDose({ status: 'PENDING' }, { status: 'ACTIVE' })).toBe(true);
    expect(canActOnDose({ status: 'SNOOZED' }, { status: 'ACTIVE' })).toBe(true);
  });

  it.each(['INACTIVE', 'COMPLETED', 'DISCONTINUED'] as const)(
    'offers no actions for pending or snoozed doses of a %s medicine',
    (status) => {
      expect(canActOnDose({ status: 'PENDING' }, { status } as never)).toBe(false);
      expect(canActOnDose({ status: 'SNOOZED' }, { status } as never)).toBe(false);
    },
  );

  it('offers no actions for already recorded doses', () => {
    expect(canActOnDose({ status: 'TAKEN' }, { status: 'ACTIVE' })).toBe(false);
    expect(canActOnDose({ status: 'SKIPPED' }, { status: 'ACTIVE' })).toBe(false);
  });
});

describe('dose history wiring', () => {
  it('the detail card gates its actions on canActOnDose', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync('features/medications/detail/DoseHistoryCard.tsx', 'utf8');
    expect(src).toContain('canActOnDose(dose, medication)');
    expect(src).not.toMatch(/dose\.status === 'PENDING' \|\| dose\.status === 'SNOOZED'/);
  });
});
