// DEV ONLY. The screen preview renders the real tab screens from synthetic fixtures
// with no backend and no sign-in. Like the component gallery, it must never be
// reachable in a release build, where __DEV__ is false.
export const PREVIEW_PATH = '/dev/preview';

export type PreviewScreen = 'today' | 'records' | 'medicines' | 'profile';

// Every state of every screen. The first entry of each list is the default.
export const PREVIEW_STATES = {
  today: [
    'newUser',
    // S06 (04b brief): one Due now and one Not confirmed; afterTaken taps Mark as Taken.
    'returning',
    'afterTaken',
    'nothingDue',
    'dueNow',
    'manyDue',
    'allDone',
    'allDone-uploading',
    'error',
    'offline',
    'uploading',
    'loading',
  ],
  records: ['timeline', 'filteredEmpty', 'reports'],
  medicines: ['list', 'empty'],
  profile: ['signedIn'],
} as const satisfies Record<PreviewScreen, readonly string[]>;

export const PREVIEW_SCREENS = Object.keys(PREVIEW_STATES) as PreviewScreen[];

export const MAX_PREVIEW_FONT_SCALE = 2;

export type PreviewTheme = 'light' | 'dark';

/** `theme` query value. Anything but "dark" means light, the app's theme today. */
export function parsePreviewTheme(value: string | string[] | undefined): PreviewTheme {
  return first(value) === 'dark' ? 'dark' : 'light';
}

export function isPreviewEnabled(isDev: boolean): boolean {
  return isDev === true;
}

export function isPreviewPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === PREVIEW_PATH || pathname.startsWith(`${PREVIEW_PATH}/`);
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** The screen named in the path, or null when it is not one of the four tabs. */
export function parsePreviewScreen(value: string | string[] | undefined): PreviewScreen | null {
  const v = first(value);
  return PREVIEW_SCREENS.find((s) => s === v) ?? null;
}

/** The requested state, or the screen's first state when it is missing or unknown. */
export function parsePreviewState(screen: PreviewScreen, value: string | string[] | undefined): string {
  const states: readonly string[] = PREVIEW_STATES[screen];
  const v = first(value);
  return v !== undefined && states.includes(v) ? v : states[0];
}

/** `fontScale` query value, kept between 1 and 2. Anything else means 1 (no scaling). */
export function parsePreviewFontScale(value: string | string[] | undefined): number {
  const n = Number(first(value));
  if (!Number.isFinite(n) || n <= 1) return 1;
  return Math.min(n, MAX_PREVIEW_FONT_SCALE);
}
