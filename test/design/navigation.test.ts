import { describe, it, expect } from 'vitest';
import {
  badgeText,
  bellLabel,
  initials,
  tabBarLayout,
  tabColors,
  tabs,
} from '../../design/components/Navigation/navStyle';
import { color } from '../../design/tokens';
import { contrastRatio, meetsTouchTarget, MIN_TEXT } from '../../design/contrast';
import { en, t } from '../../design/strings';

describe('tabs', () => {
  it('has five entries in order', () => {
    expect(tabs.map((tab) => tab.key)).toEqual([
      'today',
      'records',
      'medicines',
      'healthPlan',
      'profile',
    ]);
  });

  it('every active icon differs from its inactive icon', () => {
    for (const tab of tabs) {
      expect(tab.activeIcon).not.toBe(tab.icon);
    }
  });
});

describe('navigation colors meet contrast', () => {
  it('active and inactive tab text on the screen', () => {
    expect(contrastRatio(tabColors(true).fg, color.bg.screen)).toBeGreaterThanOrEqual(MIN_TEXT);
    expect(contrastRatio(tabColors(false).fg, color.bg.screen)).toBeGreaterThanOrEqual(MIN_TEXT);
  });

  it('notification badge text on its fill', () => {
    expect(contrastRatio(color.text.inverse, color.action.primary)).toBeGreaterThanOrEqual(
      MIN_TEXT,
    );
  });

  it('patient avatar initials on the blue tint', () => {
    expect(contrastRatio(color.tone.info.fg, color.bg.tintBlue)).toBeGreaterThanOrEqual(MIN_TEXT);
  });

  it('patient banner text on the teal tint', () => {
    expect(contrastRatio(color.tone.source.fg, color.bg.tintTeal)).toBeGreaterThanOrEqual(
      MIN_TEXT,
    );
  });

  it('patient pill name on the cool grey', () => {
    expect(contrastRatio(color.text.primary, color.bg.subtle)).toBeGreaterThanOrEqual(MIN_TEXT);
  });
});

describe('badgeText', () => {
  it('hides zero and negative counts and caps at 9+', () => {
    expect(badgeText(0)).toBeNull();
    expect(badgeText(-1)).toBeNull();
    expect(badgeText(1)).toBe('1');
    expect(badgeText(9)).toBe('9');
    expect(badgeText(10)).toBe('9+');
  });
});

describe('bellLabel', () => {
  it('matches the catalog strings', () => {
    expect(bellLabel(0)).toBe(en['nav.notificationsNone']);
    expect(bellLabel(3)).toBe(t('nav.notificationsCount', { count: 3 }));
  });
});

describe('initials', () => {
  it('takes first and last word initials, uppercased', () => {
    expect(initials('Asha Rao')).toBe('AR');
    expect(initials('asha')).toBe('A');
    expect(initials('Asha Devi Rao')).toBe('AR');
    expect(initials('  ')).toBe('');
  });
});

describe('tab bar layout', () => {
  it('meets the touch target', () => {
    expect(
      meetsTouchTarget({ minHeight: tabBarLayout.height, minWidth: tabBarLayout.itemMinWidth }),
    ).toBe(true);
  });
});
