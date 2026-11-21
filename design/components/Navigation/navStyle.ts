import type { IconName } from '../Foundations/iconNames';
import { color, layout, size, space } from '../../tokens';
import { t } from '../../strings';
import type { StringKey } from '../../strings';

// Four tabs (04b task 9). Health Plan is not a tab until its phase (18); its route stays, unlinked.
export type TabKey = 'today' | 'records' | 'medicines' | 'profile';

export const tabs: { key: TabKey; labelKey: StringKey; icon: IconName; activeIcon: IconName }[] = [
  { key: 'today', labelKey: 'nav.today', icon: 'home-outline', activeIcon: 'home' },
  {
    key: 'records',
    labelKey: 'nav.records',
    icon: 'document-text-outline',
    activeIcon: 'document-text',
  },
  { key: 'medicines', labelKey: 'nav.medicines', icon: 'medkit-outline', activeIcon: 'medkit' },
  {
    key: 'profile',
    labelKey: 'nav.profile',
    icon: 'person-circle-outline',
    activeIcon: 'person-circle',
  },
];

// v4: the active tab has a filled icon in a blue-tint pill and an action-blue label; inactive
// tabs have an outline icon and a tertiary label.
export function tabColors(active: boolean): { fg: string; pill: string | null } {
  return active
    ? { fg: color.text.link, pill: color.bg.tintBlue }
    : { fg: color.text.tertiary, pill: null };
}

export function badgeText(count: number): string | null {
  if (count <= 0) return null;
  if (count > 9) return t('nav.notificationsMany');
  return String(count);
}

export function bellLabel(count: number): string {
  if (count === 0) return t('nav.notificationsNone');
  return t('nav.notificationsCount', { count });
}

export const tabBarLayout = {
  height: size.tabBarHeight,
  itemMinWidth: size.touchMin,
  inset: layout.tabBar.inset,
  bottom: layout.tabBar.bottom,
  radius: layout.tabBar.radius,
} as const;

/** Distance from the bar's bottom edge to the screen's: the spec's 30, or more over a taller home indicator. */
export function tabBarBottom(safeAreaBottom: number): number {
  return Math.max(tabBarLayout.bottom, safeAreaBottom);
}

/** Bottom padding a tab's scrolling content needs so its last row clears the floating bar. */
export function tabBarClearance(safeAreaBottom: number): number {
  return tabBarLayout.height + tabBarBottom(safeAreaBottom) + space.lg;
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return '';
  const first = Array.from(words[0])[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';
  return (first + last).toUpperCase();
}
