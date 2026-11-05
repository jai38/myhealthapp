import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// CLAUDE.md rule 8: logs carry IDs, action codes and timestamps only, never health data.
describe('notification logs', () => {
  it('never interpolate a medicine name into a console message', () => {
    const src = readFileSync(
      new URL('../../services/notifications/notification-service.ts', import.meta.url),
      'utf8',
    );
    const logLines = src.split('\n').filter((l) => /console\.(log|warn|error|info)/.test(l));
    expect(logLines.length).toBeGreaterThan(0);
    for (const line of logLines) {
      expect(line).not.toMatch(/medicationName|nameAsWritten|instructions/);
    }
  });
});
