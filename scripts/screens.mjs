#!/usr/bin/env node
// Screenshots every state of the four tab screens from the dev-only screen preview
// (app/dev/preview/[tab].tsx), which renders the real screens from synthetic fixtures.
// No backend and no sign-in are needed, and the preview makes no network calls.
//
// Usage (Expo web build must be running: npx expo start --web --port 8081):
//   node scripts/screens.mjs                          -> docs/phases/04b-screens/before/
//   node scripts/screens.mjs --out <dir>              -> a different folder (for example the "after" set)
//   node scripts/screens.mjs --only today,medicines   -> some screens only
//   node scripts/screens.mjs --state today:allDone    -> one state only (repeatable)
//
// Each state is captured three ways, named <screen>-<state>_<variant>.png:
//   360        360 x 800 phone, normal text
//   430        430 x 932 large phone, normal text
//   360-fs2    360 x 800 with fontScale=2, the preview's approximation of Android's largest
//              system font (see features/dev-preview/previewFontScale.ts)
// When a screen scrolls, a second image <name>_full.png shows all of its content.
// index.json lists every image with scroll, overflow and clipping measurements.
//
// Needs playwright-core (a pinned devDependency) and a Chromium that matches it.
// Set PLAYWRIGHT_CHROMIUM_PATH to use a specific browser executable.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:8081';
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUT = resolve(projectRoot, '..', 'docs', 'phases', '04b-screens', 'before');

const VARIANTS = [
  { name: '360', width: 360, height: 800, fontScale: 1 },
  { name: '430', width: 430, height: 932, fontScale: 1 },
  { name: '360-fs2', width: 360, height: 800, fontScale: 2 },
];

// Extra URL parts and user steps that reach a state. Everything else is just ?state=<state>.
const EXTRA = {
  // The real Records screen reads ?view= from the URL, as it does in the app.
  'records:reports': { query: '&view=reports' },
  // "Filtered with no results" is reached the way a person reaches it: by typing a search.
  'records:filteredEmpty': {
    steps: async (page) => {
      await page.fill('[data-testid="timeline-search-input"]', 'zzzz');
      await page.waitForSelector('[data-testid="timeline-no-match"]', { timeout: 15000 });
      await page.waitForTimeout(400);
    },
  },
};

async function loadStates() {
  // One source of truth: the state lists in previewGuard.ts.
  const source = await readFile(join(projectRoot, 'features', 'dev-preview', 'previewGuard.ts'), 'utf8');
  const block = /PREVIEW_STATES = \{([\s\S]*?)\} as const/.exec(source);
  if (!block) throw new Error('Could not read PREVIEW_STATES from previewGuard.ts');
  const states = {};
  for (const m of block[1].matchAll(/(\w+):\s*\[([\s\S]*?)\]/g)) {
    states[m[1]] = [...m[2].matchAll(/'([^']+)'/g)].map((s) => s[1]);
  }
  return states;
}

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT, only: null, states: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') args.out = resolve(argv[++i]);
    else if (argv[i] === '--only') args.only = argv[++i].split(',');
    else if (argv[i] === '--state') args.states.push(argv[++i]);
    else throw new Error(`Unknown argument ${argv[i]}`);
  }
  return args;
}

// Runs in the page. Measures scrolling, horizontal overflow and clipped text.
function measure() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const describe = (el) => {
    const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50);
    return `${el.tagName.toLowerCase()}${el.dataset.testid ? `[${el.dataset.testid}]` : ''} "${text}"`;
  };
  const visible = (el, r) => {
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  };

  let scroller = null;
  let scrollExtra = 0;
  const horizontal = [];
  const clipped = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!visible(el, r)) continue;
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1) {
      const extra = el.scrollHeight - el.clientHeight;
      if (extra > scrollExtra) {
        scroller = el;
        scrollExtra = extra;
      }
    }
    const isText = el.children.length === 0 && (el.textContent || '').trim() !== '';
    if (isText && (r.right > vw + 1 || r.left < -1) && !el.closest('[data-hscroll]')) {
      // Text inside a horizontally scrolling strip is meant to extend past the edge.
      let inStrip = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        if (/(auto|scroll)/.test(getComputedStyle(p).overflowX) && p.scrollWidth > p.clientWidth + 1) inStrip = true;
      }
      if (!inStrip) horizontal.push(describe(el));
    }
    if (isText && /(hidden|clip)/.test(s.overflowX + s.overflowY)) {
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) clipped.push(describe(el));
    }
  }
  return {
    pageScrollsHorizontally: document.documentElement.scrollWidth > vw + 1,
    scrolls: scrollExtra > 0,
    scrollExtra,
    viewport: { width: vw, height: vh },
    horizontalOverflow: horizontal.slice(0, 8),
    clippedText: clipped.slice(0, 8),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  let playwright;
  try {
    playwright = await import('playwright-core');
  } catch {
    console.error('playwright-core is not installed. Run: npm install');
    process.exit(2);
  }

  try {
    const response = await fetch(`${BASE_URL}/dev/preview/today`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (err) {
    console.error(`The Expo web build is not reachable at ${BASE_URL} (${err.message}). Start it with: npx expo start --web --port 8081`);
    process.exit(3);
  }

  const allStates = await loadStates();
  const jobs = [];
  for (const [screen, states] of Object.entries(allStates)) {
    if (args.only && !args.only.includes(screen)) continue;
    for (const state of states) {
      if (args.states.length > 0 && !args.states.includes(`${screen}:${state}`)) continue;
      jobs.push({ screen, state });
    }
  }
  if (jobs.length === 0) {
    console.error('No states selected.');
    process.exit(1);
  }

  await mkdir(args.out, { recursive: true });

  let browser;
  try {
    browser = await playwright.chromium.launch({
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    });
  } catch (err) {
    console.error(`Could not start Chromium (${err.message}).`);
    process.exit(4);
  }

  const index = [];
  const outsideRequests = new Set();
  try {
    for (const variant of VARIANTS) {
      const context = await browser.newContext({
        viewport: { width: variant.width, height: variant.height },
        deviceScaleFactor: 2,
        timezoneId: 'Asia/Kolkata',
        locale: 'en-IN',
        colorScheme: 'light',
        reducedMotion: 'reduce',
      });
      // The preview must never reach a real server: anything outside localhost is refused and listed.
      await context.route('**/*', (route) => {
        const { hostname, protocol } = new URL(route.request().url());
        const local = hostname === 'localhost' || hostname === '127.0.0.1' || protocol === 'data:' || protocol === 'blob:';
        if (local) return route.continue();
        outsideRequests.add(route.request().url());
        return route.abort();
      });

      for (const { screen, state } of jobs) {
        const extra = EXTRA[`${screen}:${state}`] ?? {};
        const url =
          `${BASE_URL}/dev/preview/${screen}?state=${encodeURIComponent(state)}` +
          (variant.fontScale > 1 ? `&fontScale=${variant.fontScale}` : '') +
          (extra.query ?? '');
        const name = `${screen}-${state}_${variant.name}`;

        const page = await context.newPage();
        const consoleErrors = [];
        page.on('console', (m) => {
          if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
        });
        page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${String(e.message).slice(0, 200)}`));

        await page.goto(url, { waitUntil: 'load', timeout: 120000 });
        await page.waitForSelector(`[data-testid="preview-${screen}-${state}"]`, { timeout: 120000 });
        await page.waitForFunction(() => globalThis.__previewSettled === true, null, { timeout: 30000 });
        await page.evaluate(() => document.fonts.ready);
        if (extra.steps) await extra.steps(page);
        await page.waitForTimeout(300);

        const file = `${name}.png`;
        await page.screenshot({ path: join(args.out, file), animations: 'disabled' });
        const m = await page.evaluate(measure);
        const entry = { file, screen, state, variant: variant.name, ...m, fullFile: null, consoleErrors };

        if (m.scrolls) {
          // Show all the content: grow the window by what the scroll area hides, then restore it.
          await page.setViewportSize({ width: variant.width, height: variant.height + m.scrollExtra });
          await page.waitForTimeout(300);
          entry.fullFile = `${name}_full.png`;
          await page.screenshot({ path: join(args.out, entry.fullFile), animations: 'disabled' });
          await page.setViewportSize({ width: variant.width, height: variant.height });
        }

        const blocked = await page.evaluate(() => (globalThis.__previewBlocked || []).slice());
        entry.blockedRequests = blocked;
        index.push(entry);
        console.log(`Saved ${file}${entry.fullFile ? ` and ${entry.fullFile}` : ''}`);
        await page.close();
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(join(args.out, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${index.length} states to ${args.out}`);
  if (outsideRequests.size > 0) {
    console.error(`Refused ${outsideRequests.size} request(s) outside localhost:\n  ${[...outsideRequests].join('\n  ')}`);
  } else {
    console.log('No request left localhost.');
  }
}

main().catch((err) => {
  console.error(`Screenshot run failed: ${err.message}`);
  process.exit(1);
});
