import { afterEach, describe, expect, it } from 'vitest';
import {
  MAX_PREVIEW_FONT_SCALE,
  PREVIEW_PATH,
  PREVIEW_SCREENS,
  PREVIEW_STATES,
  isPreviewEnabled,
  isPreviewPath,
  parsePreviewFontScale,
  parsePreviewScreen,
  parsePreviewState,
} from '../features/dev-preview/previewGuard';
import { initialProcessingStatus, setPreviewSeam } from '../features/dev-preview/previewSeam';
import { FROZEN_NOW, PREVIEW_EVENTS, frozenNowMs, previewScenario } from '../features/dev-preview/fixtures';
import { answer } from '../features/dev-preview/previewApi';
import { effectiveFontScale, applyPreviewFontScale } from '../features/dev-preview/previewFontScale';
import { freezeClock } from '../features/dev-preview/previewClock';
import { groupTodayDoses, todayScreenState } from '../features/today/todayModel';
import { textStyles } from '../design/typography';

describe('screen preview guard', () => {
  it('is unreachable in a release build', () => {
    expect(isPreviewEnabled(false)).toBe(false);
  });

  it('is reachable in a development build', () => {
    expect(isPreviewEnabled(true)).toBe(true);
  });

  it('matches only the preview path', () => {
    expect(isPreviewPath(PREVIEW_PATH)).toBe(true);
    expect(isPreviewPath(`${PREVIEW_PATH}/today`)).toBe(true);
    expect(isPreviewPath('/')).toBe(false);
    expect(isPreviewPath('/dev/preview-other')).toBe(false);
    expect(isPreviewPath('/dev/gallery')).toBe(false);
    expect(isPreviewPath('/medications')).toBe(false);
    expect(isPreviewPath(null)).toBe(false);
    expect(isPreviewPath(undefined)).toBe(false);
  });

  it('knows the four tabs and their states', () => {
    expect(PREVIEW_SCREENS).toEqual(['today', 'records', 'medicines', 'profile']);
    expect(parsePreviewScreen('today')).toBe('today');
    expect(parsePreviewScreen('health-plan')).toBeNull();
    expect(parsePreviewScreen(undefined)).toBeNull();
  });

  it('falls back to the first state for a missing or unknown state', () => {
    expect(parsePreviewState('today', 'allDone')).toBe('allDone');
    expect(parsePreviewState('today', undefined)).toBe(PREVIEW_STATES.today[0]);
    expect(parsePreviewState('today', 'nope')).toBe(PREVIEW_STATES.today[0]);
    expect(parsePreviewState('records', ['reports', 'timeline'])).toBe('reports');
  });

  it('keeps the font scale between 1 and 2', () => {
    expect(parsePreviewFontScale(undefined)).toBe(1);
    expect(parsePreviewFontScale('abc')).toBe(1);
    expect(parsePreviewFontScale('0.5')).toBe(1);
    expect(parsePreviewFontScale('1.5')).toBe(1.5);
    expect(parsePreviewFontScale('2')).toBe(2);
    expect(parsePreviewFontScale('9')).toBe(MAX_PREVIEW_FONT_SCALE);
  });
});

describe('preview upload seam', () => {
  afterEach(() => setPreviewSeam(null, true));

  it('is empty by default, so production behaviour is unchanged', () => {
    expect(initialProcessingStatus()).toBeNull();
  });

  it('is applied only in a development build', () => {
    setPreviewSeam({ processingStatus: 'x' }, false);
    expect(initialProcessingStatus()).toBeNull();
    setPreviewSeam({ processingStatus: 'x' }, true);
    expect(initialProcessingStatus()).toBe('x');
  });
});

describe('preview fixtures', () => {
  const now = frozenNowMs();

  function todayState(state: string) {
    const s = previewScenario('today', state);
    return {
      s,
      screenState: todayScreenState({
        initialized: true,
        loadFailed: false,
        medications: s.medications,
        doses: s.doses.filter((d) => d.scheduledTime.startsWith('2026-11-06')),
        nowMs: now,
      }),
      groups: groupTodayDoses(
        s.doses.filter((d) => d.scheduledTime.startsWith('2026-11-06')),
        now,
        (id) => s.medications.find((m) => m.id === id),
      ),
    };
  }

  it('freezes the clock at 10:30 on 6 November 2026', () => {
    const d = new Date(now);
    expect([d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]).toEqual([
      FROZEN_NOW.year,
      FROZEN_NOW.month,
      FROZEN_NOW.day,
      FROZEN_NOW.hour,
      FROZEN_NOW.minute,
    ]);
  });

  it('builds each Today state the screen model reads as intended', () => {
    expect(todayState('newUser').screenState).toBe('newUser');
    expect(todayState('nothingDue').screenState).toBe('nothingDue');
    expect(todayState('allDone').screenState).toBe('allDone');
    expect(todayState('allDone-uploading').screenState).toBe('allDone');
    expect(todayState('allDone-uploading').s.uploading).toBe(true);

    const due = todayState('dueNow');
    expect(due.screenState).toBe('due');
    expect(due.groups.dueNow).toHaveLength(1);
    expect(due.groups.earlierNotConfirmed).toHaveLength(0);

    const many = todayState('manyDue');
    expect(many.screenState).toBe('due');
    expect(many.groups.dueNow.length).toBeGreaterThanOrEqual(3);
    expect(many.groups.earlierNotConfirmed).toHaveLength(2);
  });

  it('marks the error and offline states', () => {
    expect(previewScenario('today', 'error').apiFails).toBe(true);
    expect(previewScenario('today', 'offline').offline).toBe(true);
    expect(previewScenario('today', 'dueNow').offline).toBe(false);
  });

  it('has six active and two prescribed medicines, and an empty state', () => {
    const list = previewScenario('medicines', 'list').medications;
    expect(list.filter((m) => m.status === 'ACTIVE')).toHaveLength(6);
    expect(list.filter((m) => m.status === 'INACTIVE')).toHaveLength(2);
    expect(previewScenario('medicines', 'empty').medications).toHaveLength(0);
  });

  it('is obviously synthetic', () => {
    const names = previewScenario('medicines', 'list').medications.map((m) => m.nameAsWritten);
    for (const name of names) expect(name).toMatch(/^(Testmed|Samplecillin|Demopril)/);
    expect(PREVIEW_EVENTS).toHaveLength(12);
    const years = new Set(PREVIEW_EVENTS.map((e) => e.eventDate.slice(0, 4)));
    expect(years.size).toBeGreaterThanOrEqual(3);
  });
});

describe('preview fake backend', () => {
  const scenario = previewScenario('records', 'timeline');

  async function get(path: string, query = '') {
    const res = answer(scenario, 'GET', path, new URLSearchParams(query));
    return { status: res.status, body: (await res.json()) as any };
  }

  it('filters and pages the timeline like the real endpoint', async () => {
    const all = await get('/timeline', 'limit=20&offset=0');
    expect(all.body.pagination.totalCount).toBe(12);
    const none = await get('/timeline', 'search=zzzz&limit=20&offset=0');
    expect(none.body.data).toHaveLength(0);
    const year = await get('/timeline', 'year=2025');
    expect(year.body.data.every((e: any) => e.eventDate.startsWith('2025'))).toBe(true);
    const page = await get('/timeline', 'limit=5&offset=10');
    expect(page.body.data).toHaveLength(2);
  });

  it('answers a server error for every call when the scenario fails', async () => {
    const failing = previewScenario('today', 'error');
    const res = answer(failing, 'GET', '/medications', new URLSearchParams());
    expect(res.status).toBe(500);
  });

  it('does not know any other route', async () => {
    expect((await get('/auth/login')).status).toBe(404);
  });
});

describe('preview font scale', () => {
  it('applies the app caps to a system scale of 2', () => {
    expect(effectiveFontScale('body', 2)).toBe(1.6);
    expect(effectiveFontScale('display', 2)).toBe(1.3);
    expect(effectiveFontScale('body', 1.2)).toBe(1.2);
  });

  it('scales the shared text styles and restores them', () => {
    const base = { size: textStyles.body.fontSize, line: textStyles.body.lineHeight, display: textStyles.display.fontSize };
    const restore = applyPreviewFontScale(2);
    expect(textStyles.body.fontSize).toBeCloseTo(base.size * 1.6);
    expect(textStyles.body.lineHeight).toBeCloseTo(base.line * 1.6);
    expect(textStyles.display.fontSize).toBeCloseTo(base.display * 1.3);
    restore();
    expect(textStyles.body.fontSize).toBe(base.size);
    expect(textStyles.display.fontSize).toBe(base.display);
  });

  it('changes nothing at scale 1', () => {
    const before = textStyles.body.fontSize;
    const restore = applyPreviewFontScale(1);
    expect(textStyles.body.fontSize).toBe(before);
    restore();
  });
});

describe('preview clock', () => {
  it('freezes new Date() and Date.now() only, and restores them', () => {
    const real = Date;
    const restore = freezeClock(frozenNowMs());
    expect(Date.now()).toBe(frozenNowMs());
    expect(new Date().getTime()).toBe(frozenNowMs());
    expect(new Date('2020-01-02T03:04:05Z').toISOString()).toBe('2020-01-02T03:04:05.000Z');
    expect(new Date() instanceof real).toBe(true);
    restore();
    expect(Date).toBe(real);
    expect(Date.now()).not.toBe(frozenNowMs());
  });
});
