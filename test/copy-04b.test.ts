// 04b task 17, copy pass: S06 copy from designes/design/screens.md and the S06 canvas source,
// and the rule that a button label is one to three words (04b decision 3).
import { describe, it, expect } from 'vitest';
import { t } from '../design/strings';
import type { StringKey } from '../design/strings';

// Every label the new Today and the v4 parts put on a button, tab or tile.
const BUTTON_LABELS: StringKey[] = [
  'today.markTaken',
  'today.uploadRecord',
  'today.addMedication',
  'today.showAll',
  'today.showFewer',
  'today.openMedicine',
  'today.taken',
  'today.skip',
  'common.undo',
  'common.retry',
  'common.cancel',
  'nav.today',
  'nav.records',
  'nav.medicines',
  'nav.profile',
];

describe('04b copy', () => {
  it.each(BUTTON_LABELS)('%s is one to three words', (key) => {
    const words = t(key).trim().split(/\s+/);
    expect(words.length).toBeGreaterThanOrEqual(1);
    expect(words.length).toBeLessThanOrEqual(3);
  });

  it('uses the S06 copy from the design', () => {
    expect(t('today.greeting.afternoon', { name: 'Asha' })).toBe('Good afternoon, Asha 👋');
    expect(t('today.subtitle')).toBe('Stay on track with your health today.');
    expect(t('today.heroLabel')).toBe("Today's Medications");
    expect(t('today.heroCount', { taken: '2', total: '6' })).toBe('2 of 6 taken');
    expect(t('today.heroNeedsConfirming', { count: '1' })).toBe('1 needs confirming');
    expect(t('today.heroAllDone')).toBe('All done for today ✓');
    expect(t('today.groupCountOne')).toBe('1 medicine');
    expect(t('today.groupCount', { count: '3' })).toBe('3 medicines');
    expect(t('today.markTaken')).toBe('Mark as Taken');
    expect(t('today.tapToUpdate')).toBe('Tap to update');
    expect(t('today.quickActions')).toBe('Quick Actions');
    expect(t('today.markedTaken', { name: 'Testmed B 20 mg', time: '1:42 PM' })).toBe(
      'Testmed B 20 mg marked as taken at 1:42 PM',
    );
    expect(t('dose.supplement')).toBe('Supplement');
  });

  it('says Missed only for a dose the user marked missed, and Not confirmed otherwise', () => {
    expect(t('status.missedByUser')).toBe('Missed');
    expect(t('status.notConfirmed')).toBe('Not confirmed');
  });
});
