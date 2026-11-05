import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { areTestSamplesEnabled } from '../features/documents/pickerSamples';

describe('document picker test samples', () => {
  it('are offered only in development builds', () => {
    expect(areTestSamplesEnabled(true)).toBe(true);
    expect(areTestSamplesEnabled(false)).toBe(false);
  });

  it('the picker renders the sample buttons only behind the guard', () => {
    const src = readFileSync('features/documents/DocumentPickerModal.tsx', 'utf8');
    expect(src).toContain('areTestSamplesEnabled(__DEV__)');
    const guardAt = src.indexOf('areTestSamplesEnabled(__DEV__) ?');
    for (const key of ['samplePdf', 'samplePhoto', 'testOversized', 'testTxt']) {
      const at = src.indexOf(`documents.picker.${key}`);
      expect(at, key).toBeGreaterThan(guardAt);
    }
  });
});
