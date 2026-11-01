#!/usr/bin/env node
// Saves PNG screenshots of the Expo web build for each URL path given.
//
// Usage: node scripts/screenshot.mjs / /medications /reports
// Needs the web build served at http://localhost:8081 (npm run web).
// Output goes to screenshots/ (gitignored).
//
// Uses Playwright only if it is already installed. This script adds no dependencies.

import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:8081';
const VIEWPORT = { width: 390, height: 844 }; // phone-width, matches the app's target layout
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(projectRoot, 'screenshots');

async function loadPlaywright() {
  for (const name of ['playwright', 'playwright-core']) {
    try {
      return await import(name);
    } catch {
      // not installed under this name; try the next one
    }
  }
  return null;
}

function fileNameFor(urlPath) {
  const slug = urlPath.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slug || 'root'}.png`;
}

async function main() {
  const paths = process.argv.slice(2);
  if (paths.length === 0) {
    console.error('Usage: node scripts/screenshot.mjs <path> [path ...]   e.g. / /medications /reports');
    process.exit(1);
  }

  const playwright = await loadPlaywright();
  if (!playwright) {
    console.error(
      'Playwright is not installed in this project, so no screenshots were taken.\n' +
        'This script adds no dependencies. Install Playwright yourself (npm i -D playwright, then npx playwright install chromium) and run it again.'
    );
    process.exit(2);
  }

  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (err) {
    console.error(`Expo web build is not reachable at ${BASE_URL} (${err.message}). Start it with: npm run web`);
    process.exit(3);
  }

  await mkdir(outDir, { recursive: true });

  let browser;
  try {
    browser = await playwright.chromium.launch();
  } catch (err) {
    console.error(`Could not start Chromium (${err.message}). Run: npx playwright install chromium`);
    process.exit(4);
  }

  try {
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    for (const arg of paths) {
      const urlPath = arg.startsWith('/') ? arg : `/${arg}`;
      const target = `${BASE_URL}${urlPath}`;
      await page.goto(target, { waitUntil: 'networkidle' });
      const file = join(outDir, fileNameFor(urlPath));
      await page.screenshot({ path: file, fullPage: true });
      console.log(`Saved ${file} (${target})`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`Screenshot run failed: ${err.message}`);
  process.exit(1);
});
