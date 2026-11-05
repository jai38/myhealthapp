// Pure route map for the five-tab shell. No React, so it is unit-tested directly.
import { tabs } from '../../design/components/Navigation/navStyle';
import type { TabKey } from '../../design/components/Navigation/navStyle';
import type { IconName } from '../../design/components/Foundations/iconNames';
import type { StringKey } from '../../design/strings';

export type RecordsView = 'timeline' | 'reports';

export interface ShellTab {
  key: TabKey;
  // The file name under app/(tabs)/ (Expo Router route name).
  routeName: string;
  // The path that opens the tab.
  href: string;
  titleKey: StringKey;
  icon: IconName;
  activeIcon: IconName;
}

const ROUTE_NAMES: Record<TabKey, { routeName: string; href: string }> = {
  today: { routeName: 'index', href: '/' },
  records: { routeName: 'records', href: '/records' },
  medicines: { routeName: 'medications', href: '/medications' },
  healthPlan: { routeName: 'health-plan', href: '/health-plan' },
  profile: { routeName: 'profile', href: '/profile' },
};

// Order and icons come from the design-system tab list, so the two cannot drift.
export const shellTabs: ShellTab[] = tabs.map((tab) => ({
  key: tab.key,
  ...ROUTE_NAMES[tab.key],
  titleKey: tab.labelKey,
  icon: tab.icon,
  activeIcon: tab.activeIcon,
}));

// Routes that only redirect. They stay out of the tab bar.
export const hiddenRouteNames = ['timeline', 'reports'] as const;

export const DEFAULT_RECORDS_VIEW: RecordsView = 'timeline';

export function parseRecordsView(value: string | string[] | undefined): RecordsView {
  const first = Array.isArray(value) ? value[0] : value;
  return first === 'reports' ? 'reports' : DEFAULT_RECORDS_VIEW;
}

export interface RouteTarget {
  tab: TabKey;
  pathname: string;
  params?: { view: RecordsView };
}

function targetFor(key: TabKey, view?: RecordsView): RouteTarget {
  const base = { tab: key, pathname: ROUTE_NAMES[key].href };
  return view ? { ...base, params: { view } } : base;
}

/** Link target for the Records tab with a segment selected. */
export function recordsTarget(view: RecordsView): RouteTarget {
  return targetFor('records', view);
}

/**
 * Maps a current or pre-shell path to the tab (and Records segment) that now
 * shows it. Returns null for a path the shell does not know.
 */
export function legacyRouteRedirect(path: string): RouteTarget | null {
  const clean = path
    .split(/[?#]/)[0]
    .replace(/\/\(tabs\)/g, '')
    .replace(/\/+$/, '');
  switch (clean) {
    case '':
    case '/index':
      return targetFor('today');
    case '/timeline':
      return targetFor('records', 'timeline');
    case '/reports':
      return targetFor('records', 'reports');
    case '/records':
      return targetFor('records');
    case '/medications':
    case '/medicines':
      return targetFor('medicines');
    case '/health-plan':
      return targetFor('healthPlan');
    case '/profile':
      return targetFor('profile');
    default:
      return null;
  }
}

/** Maps an Expo Router route name to the tab it highlights. */
export function tabKeyForRoute(routeName: string): TabKey | null {
  const direct = shellTabs.find((tab) => tab.routeName === routeName);
  if (direct) return direct.key;
  if (routeName === 'timeline' || routeName === 'reports') return 'records';
  return null;
}

/** Route name for a tab key. */
export function routeNameForTab(key: TabKey): string {
  return ROUTE_NAMES[key].routeName;
}

/** Where a medication reminder tap goes. It only opens the medicine; it records nothing. */
export function medicineOpenTarget(medicationId: string, stamp: string) {
  return {
    pathname: '/(tabs)/medications' as const,
    params: { openMedicationId: medicationId, t: stamp },
  };
}
