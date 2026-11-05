import { describe, it, expect } from 'vitest';
import {
  clampProgress,
  progressPercent,
  syncDisplay,
  TOAST_DURATION_MS,
} from '../../design/components/Feedback/feedbackStyle';
import type { SyncState } from '../../design/components/Feedback/feedbackStyle';
import { color } from '../../design/tokens';
import { contrastRatio, MIN_TEXT, MIN_UI } from '../../design/contrast';

const SYNC_STATES: SyncState[] = ['synced', 'pending', 'error'];

describe('sync display', () => {
  it('maps each sync state to its label, icon and tone', () => {
    expect(syncDisplay('synced')).toEqual({
      labelKey: 'feedback.synced',
      icon: 'cloud-done-outline',
      tone: 'success',
    });
    expect(syncDisplay('pending')).toEqual({
      labelKey: 'feedback.syncPending',
      icon: 'sync-outline',
      tone: 'neutral',
    });
    expect(syncDisplay('error')).toEqual({
      labelKey: 'feedback.syncError',
      icon: 'alert-circle-outline',
      tone: 'caution',
    });
  });

  it('never uses the danger tone, so no sync problem looks like a red alarm', () => {
    for (const state of SYNC_STATES) {
      expect(syncDisplay(state).tone).not.toBe('danger');
    }
  });

  it('icon tone on the screen background meets UI contrast', () => {
    for (const state of SYNC_STATES) {
      const { tone } = syncDisplay(state);
      expect(contrastRatio(color.tone[tone].fg, color.bg.screen)).toBeGreaterThanOrEqual(MIN_UI);
    }
  });

  it('caption text secondary on the screen background meets text contrast', () => {
    expect(contrastRatio(color.text.secondary, color.bg.screen)).toBeGreaterThanOrEqual(MIN_TEXT);
  });
});

describe('offline banner contrast', () => {
  it('text primary and secondary on bg.subtle meet text contrast', () => {
    expect(contrastRatio(color.text.primary, color.bg.subtle)).toBeGreaterThanOrEqual(MIN_TEXT);
    expect(contrastRatio(color.text.secondary, color.bg.subtle)).toBeGreaterThanOrEqual(MIN_TEXT);
  });
});

describe('toast contrast', () => {
  it('inverse text on the navy toast background meets text contrast', () => {
    expect(contrastRatio(color.text.inverse, color.text.primary)).toBeGreaterThanOrEqual(MIN_TEXT);
  });
});

describe('progress bar contrast', () => {
  it('action primary fill on the bg.subtle track meets UI contrast', () => {
    expect(contrastRatio(color.action.primary, color.bg.subtle)).toBeGreaterThanOrEqual(MIN_UI);
  });
});

describe('progress helpers', () => {
  it('clamps below 0 to 0, above 1 to 1, and NaN to 0', () => {
    expect(clampProgress(-1)).toBe(0);
    expect(clampProgress(2)).toBe(1);
    expect(clampProgress(NaN)).toBe(0);
  });

  it('rounds the clamped value to a whole percent', () => {
    expect(progressPercent(0.456)).toBe(46);
  });
});

describe('toast timing', () => {
  it('auto-hides after 4 seconds', () => {
    expect(TOAST_DURATION_MS).toBe(4000);
  });
});
