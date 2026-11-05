import { describe, it, expect } from 'vitest';
import {
  hiddenRouteNames,
  legacyRouteRedirect,
  medicineOpenTarget,
  parseRecordsView,
  recordsTarget,
  routeNameForTab,
  shellTabs,
  tabKeyForRoute,
} from '../features/shell/tabs';
import { en } from '../design/strings';

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const tabsDir = join(__dirname, '..', 'app', '(tabs)');
const routeFiles = readdirSync(tabsDir).map((f) => f.replace(/\.tsx$/, ''));

describe('shell tab map', () => {
  it('has the five tabs in order', () => {
    expect(shellTabs.map((tab) => tab.key)).toEqual([
      'today',
      'records',
      'medicines',
      'healthPlan',
      'profile',
    ]);
  });

  it('every tab has a route file, a real icon pair and a title string', () => {
    for (const tab of shellTabs) {
      expect(routeFiles).toContain(tab.routeName);
      expect(Object.prototype.hasOwnProperty.call(en, tab.titleKey)).toBe(true);
    }
  });

  it('old routes exist only as redirects and are hidden from the bar', () => {
    for (const name of hiddenRouteNames) {
      expect(routeFiles).toContain(name);
      expect(shellTabs.some((tab) => tab.routeName === name)).toBe(false);
      const src = readFileSync(join(tabsDir, `${name}.tsx`), 'utf8');
      expect(src).toContain('<Redirect');
      expect(tabKeyForRoute(name)).toBe('records');
    }
  });

  it('every tab title string used by the Records switch and Health Plan exists', () => {
    for (const key of ['records.timeline', 'records.reports', 'healthPlan.soonTitle', 'healthPlan.soonBody']) {
      expect(Object.prototype.hasOwnProperty.call(en, key)).toBe(true);
    }
  });

  it('route name and tab key round-trip', () => {
    for (const tab of shellTabs) {
      expect(tabKeyForRoute(routeNameForTab(tab.key))).toBe(tab.key);
    }
    expect(tabKeyForRoute('nope')).toBeNull();
  });
});

describe('legacyRouteRedirect', () => {
  it('maps the root to Today', () => {
    expect(legacyRouteRedirect('/')?.tab).toBe('today');
    expect(legacyRouteRedirect('/(tabs)')?.tab).toBe('today');
  });

  it('maps /timeline and /reports to the right Records segment', () => {
    expect(legacyRouteRedirect('/timeline')).toEqual({
      tab: 'records',
      pathname: '/records',
      params: { view: 'timeline' },
    });
    expect(legacyRouteRedirect('/(tabs)/reports')).toEqual({
      tab: 'records',
      pathname: '/records',
      params: { view: 'reports' },
    });
  });

  it('keeps /medications on the Medicines tab, ignoring query and trailing slash', () => {
    expect(legacyRouteRedirect('/medications?openMedicationId=x')?.tab).toBe('medicines');
    expect(legacyRouteRedirect('/(tabs)/medications/')?.tab).toBe('medicines');
  });

  it('every mapped path lands on a tab that exists', () => {
    for (const path of ['/', '/timeline', '/reports', '/medications', '/records', '/health-plan', '/profile']) {
      const target = legacyRouteRedirect(path);
      expect(target).not.toBeNull();
      expect(shellTabs.some((tab) => tab.key === target?.tab)).toBe(true);
    }
    expect(legacyRouteRedirect('/unknown')).toBeNull();
  });
});

describe('records view and notification target', () => {
  it('defaults to the timeline and accepts only known segments', () => {
    expect(parseRecordsView(undefined)).toBe('timeline');
    expect(parseRecordsView('reports')).toBe('reports');
    expect(parseRecordsView(['reports'])).toBe('reports');
    expect(parseRecordsView('bogus')).toBe('timeline');
    expect(recordsTarget('reports').params).toEqual({ view: 'reports' });
  });

  it('a reminder tap opens the medicine on the Medicines tab and carries no dose action', () => {
    const target = medicineOpenTarget('med-1', '123');
    expect(legacyRouteRedirect(target.pathname)?.tab).toBe('medicines');
    expect(target.params).toEqual({ openMedicationId: 'med-1', t: '123' });
  });
});
