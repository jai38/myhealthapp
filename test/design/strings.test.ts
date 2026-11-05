import { describe, it, expect } from 'vitest';
import { t, en } from '../../design/strings';

describe('design strings catalog', () => {
  it('returns a plain string for a key without params', () => {
    expect(t('common.retry')).toBe('Retry');
  });

  it('fills a {time} placeholder', () => {
    expect(t('status.taken', { time: '7:23 AM' })).toBe('Taken at 7:23 AM');
  });

  it('fills a numeric {count} placeholder', () => {
    expect(t('nav.notificationsCount', { count: 3 })).toBe('3 new notifications');
  });

  it('leaves a placeholder in place when its param is missing', () => {
    expect(t('status.taken')).toBe('Taken at {time}');
    expect(t('status.taken', { date: 'x' })).toBe('Taken at {time}');
  });

  it('every catalog value is a non-empty string with no outer whitespace', () => {
    const values = Object.values(en);
    expect(values.length).toBeGreaterThan(0);
    for (const value of values) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
      expect(value).toBe(value.trim());
    }
  });

  it('does not throw for an unknown key at runtime and returns the key', () => {
    // @ts-expect-error unknown key fails typecheck
    const result = t('not.a.key');
    expect(result).toBe('not.a.key');
  });
});
