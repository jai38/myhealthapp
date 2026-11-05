import type { IconName } from '../Foundations/iconNames';
import { color, size } from '../../tokens';
import { t } from '../../strings';
import type { StringKey } from '../../strings';

export type TabKey = 'today' | 'records' | 'medicines' | 'healthPlan' | 'profile';

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
    key: 'healthPlan',
    labelKey: 'nav.healthPlan',
    icon: 'clipboard-outline',
    activeIcon: 'clipboard',
  },
  {
    key: 'profile',
    labelKey: 'nav.profile',
    icon: 'person-circle-outline',
    activeIcon: 'person-circle',
  },
];

// The active tab is marked by a filled icon and the link color.
export function tabColors(active: boolean): { fg: string } {
  return { fg: active ? color.text.link : color.text.secondary };
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

export const tabBarLayout = { height: size.tabBarHeight, itemMinWidth: size.touchMin } as const;

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return '';
  const first = Array.from(words[0])[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';
  return (first + last).toUpperCase();
}
