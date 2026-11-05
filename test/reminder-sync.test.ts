import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildReminderSyncPayload } from '../services/medications/reminder-sync';

const NOW = new Date('2026-11-05T10:00:00').getTime();
const base = {
  nameAsWritten: 'Synthetic',
  reminderTimes: ['08:00'],
  prescribedInstructions: null,
  endDate: null as string | null,
};

describe('buildReminderSyncPayload', () => {
  it('excludes inactive, historical, paused, stopped and ended medicines', () => {
    const meds = [
      { ...base, id: 'active', status: 'ACTIVE' as const },
      { ...base, id: 'historical', status: 'INACTIVE' as const },
      { ...base, id: 'paused', status: 'PAUSED' as const },
      { ...base, id: 'ended', status: 'ACTIVE' as const, endDate: '2026-11-04' },
      { ...base, id: 'ends-today', status: 'ACTIVE' as const, endDate: '2026-11-05' },
    ];
    const ids = buildReminderSyncPayload(meds, NOW).map((m) => m.id);
    expect(ids).toEqual(['active', 'ends-today']);
  });

  it('carries endDate and never sets dose status fields', () => {
    const [m] = buildReminderSyncPayload(
      [{ ...base, id: 'a', status: 'ACTIVE' as const, endDate: '2026-12-01' }],
      NOW
    );
    expect(m).toEqual({
      id: 'a',
      name: 'Synthetic',
      isActive: true,
      reminderTimes: ['08:00'],
      instructions: undefined,
      endDate: '2026-12-01',
    });
    expect(Object.keys(m)).not.toContain('status');
  });

  it('is used by both Home and Medicines screens', () => {
    for (const f of ['../features/today/useTodayData.ts', '../features/medications/useMedicationsData.ts']) {
      const src = readFileSync(new URL(f, import.meta.url), 'utf-8');
      expect(src).toContain('buildReminderSyncPayload(');
    }
  });
});
