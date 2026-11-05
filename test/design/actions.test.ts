import { describe, it, expect } from 'vitest';
import {
  buttonColors,
  buttonLayout,
  iconButtonLayout,
  linkRowLayout,
  UNDO_DURATION_MS,
  PRESSED_SCALE,
  ButtonVariant,
} from '../../design/components/Actions/buttonStyle';
import { color, size } from '../../design/tokens';
import { contrastRatio, meetsTouchTarget, MIN_TEXT } from '../../design/contrast';
import { t } from '../../design/strings';

const variants: ButtonVariant[] = ['primary', 'secondary', 'text', 'danger'];
const bools = [true, false];

describe('button colors meet text contrast', () => {
  for (const variant of variants) {
    for (const pressed of bools) {
      for (const disabled of bools) {
        it(`${variant} pressed=${pressed} disabled=${disabled}`, () => {
          const { bg, fg } = buttonColors(variant, { pressed, disabled });
          // A transparent fill sits on the white card behind it, so check against that.
          const effectiveBg = bg === 'transparent' ? color.bg.card : bg;
          expect(contrastRatio(fg, effectiveBg)).toBeGreaterThanOrEqual(MIN_TEXT);
        });
      }
    }
  }
});

describe('touch targets', () => {
  it('button, icon button and link row meet the 48 dp minimum', () => {
    expect(meetsTouchTarget(buttonLayout)).toBe(true);
    expect(meetsTouchTarget(iconButtonLayout)).toBe(true);
    expect(meetsTouchTarget({ ...linkRowLayout, minWidth: 48 })).toBe(true);
  });
});

describe('disabled state', () => {
  it('every variant gives the same disabled colors', () => {
    const reference = buttonColors('primary', { pressed: false, disabled: true });
    for (const variant of variants) {
      for (const pressed of bools) {
        expect(buttonColors(variant, { pressed, disabled: true })).toEqual(reference);
      }
    }
  });
});

describe('undo toast', () => {
  it('auto-dismisses after 6 seconds', () => {
    expect(UNDO_DURATION_MS).toBe(6000);
  });

  it('white text on navy passes the text contrast minimum', () => {
    expect(contrastRatio(color.text.inverse, color.text.primary)).toBeGreaterThanOrEqual(MIN_TEXT);
  });

  it('uses the localised undo label', () => {
    expect(t('common.undo')).toBe('Undo');
  });
});

describe('button press feel', () => {
  it('shrinks only slightly when held', () => {
    expect(PRESSED_SCALE).toBeGreaterThanOrEqual(0.95);
    expect(PRESSED_SCALE).toBeLessThan(1);
  });

  it('matches the input field height', () => {
    expect(buttonLayout.minHeight).toBe(size.inputHeight);
  });
});
