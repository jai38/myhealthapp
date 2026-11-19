import { color, specFailing, themes } from './tokens';
import type { ThemeName } from './tokens';

// WCAG 2.x contrast helpers. Pairs are built from semantic tokens only.

export const MIN_TEXT = 4.5;
export const MIN_UI = 3;
export const MIN_TOUCH = 48;

function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace(/^#/, '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  );
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseColor(value: string): { rgb: [number, number, number]; alpha: number } {
  const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(value);
  if (m) return { rgb: [Number(m[1]), Number(m[2]), Number(m[3])], alpha: m[4] === undefined ? 1 : Number(m[4]) };
  const h = value.replace(/^#/, '');
  return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number], alpha: 1 };
}

/** Composites a colour (hex or rgba) over opaque layers, last first: flatten(glass, screen). */
export function flatten(value: string, ...under: string[]): string {
  const base = under.length > 0 ? parseColor(flatten(under[0]!, ...under.slice(1))).rgb : [255, 255, 255];
  const { rgb, alpha } = parseColor(value);
  const out = rgb.map((c, i) => Math.round(c * alpha + base[i]! * (1 - alpha)));
  return `#${out.map((c) => c.toString(16).padStart(2, '0').toUpperCase()).join('')}`;
}

export interface ContrastPair {
  name: string;
  fg: string;
  bg: string;
  min: number;
}

function pair(fgName: string, fg: string, bgName: string, bg: string, min: number): ContrastPair {
  return { name: `${fgName} on ${bgName}`, fg, bg, min };
}

const tonePairs: ContrastPair[] = (Object.keys(color.tone) as (keyof typeof color.tone)[]).map(
  (tone) =>
    pair(
      `tone.${tone}.fg`,
      color.tone[tone].fg,
      `tone.${tone}.bg`,
      color.tone[tone].bg,
      MIN_TEXT,
    ),
);

export const contrastPairs: ContrastPair[] = [
  pair('text.primary', color.text.primary, 'bg.screen', color.bg.screen, MIN_TEXT),
  pair('text.primary', color.text.primary, 'bg.subtle', color.bg.subtle, MIN_TEXT),
  pair('text.secondary', color.text.secondary, 'bg.screen', color.bg.screen, MIN_TEXT),
  pair('text.secondary', color.text.secondary, 'bg.subtle', color.bg.subtle, MIN_TEXT),
  pair('text.tertiary', color.text.tertiary, 'bg.screen', color.bg.screen, MIN_TEXT),
  pair('text.link', color.text.link, 'bg.screen', color.bg.screen, MIN_TEXT),
  // Most text now sits on white cards on the grey screen.
  pair('text.primary', color.text.primary, 'bg.card', color.bg.card, MIN_TEXT),
  pair('text.secondary', color.text.secondary, 'bg.card', color.bg.card, MIN_TEXT),
  pair('text.tertiary', color.text.tertiary, 'bg.card', color.bg.card, MIN_TEXT),
  pair('text.link', color.text.link, 'bg.card', color.bg.card, MIN_TEXT),
  pair('text.link', color.text.link, 'bg.subtle', color.bg.subtle, MIN_TEXT),
  pair('text.link', color.text.link, 'bg.tintBlue', color.bg.tintBlue, MIN_TEXT),
  pair('text.inverse', color.text.inverse, 'action.primary', color.action.primary, MIN_TEXT),
  pair(
    'text.inverse',
    color.text.inverse,
    'action.primaryPressed',
    color.action.primaryPressed,
    MIN_TEXT,
  ),
  pair('text.inverse', color.text.inverse, 'action.danger', color.action.danger, MIN_TEXT),
  ...tonePairs,
  pair('border.input', color.border.input, 'bg.screen', color.bg.screen, MIN_UI),
  pair('border.focus', color.border.focus, 'bg.screen', color.bg.screen, MIN_UI),
  pair('border.input', color.border.input, 'bg.card', color.bg.card, MIN_UI),
  // White glyphs on category tiles are UI parts: 3:1.
  ...(Object.keys(color.tile) as (keyof typeof color.tile)[]).map((t) =>
    pair('text.inverse', color.text.inverse, `tile.${t}`, color.tile[t], MIN_UI),
  ),
];

// v4 pairs for one theme, with glass and tints flattened over what sits under them.
export function themeContrastPairs(name: ThemeName): ContrastPair[] {
  const c = themes[name].color;
  const screen = c.bg.screen;
  const glass = flatten(c.bg.glass, screen);
  const surface = flatten(c.bg.surface, screen);
  const tabBar = flatten(c.bg.tabBar, screen);
  const p = (fgName: string, fg: string, bgName: string, bg: string, min = MIN_TEXT) =>
    pair(`${name}: ${fgName}`, flatten(fg, bg), bgName, bg, min);

  const textOn: [string, string][] = [
    ['bg.screen', screen],
    ['bg.glass', glass],
    ['bg.surface', surface],
  ];
  const texts: [string, string][] = [
    ['text.primary', c.text.primary],
    ['text.secondary', c.text.secondary],
    ['text.tertiary', c.text.tertiary],
    ['text.link', c.text.link],
    ['text.error', c.text.error],
  ];
  const pairs = texts.flatMap(([fn, fg]) => textOn.map(([bn, bg]) => p(fn, fg, bn, bg)));

  const chip = (label: string, s: { fg: string; bg: string }) =>
    p(`${label}.fg`, s.fg, `${label}.bg on glass`, flatten(s.bg, glass));
  pairs.push(
    // Inactive tab label; the active one is link on the blue-tint pill.
    p('text.tertiary', c.text.tertiary, 'bg.tabBar', tabBar),
    p('text.link', c.text.link, 'bg.tintBlue on tabBar', flatten(c.bg.tintBlue, tabBar)),
    p('text.teal', c.text.teal, 'bg.tintTeal on glass', flatten(c.bg.tintTeal, glass)),
    chip('dose.taken', c.dose.taken),
    chip('dose.upcoming', c.dose.upcoming),
    chip('dose.notConfirmed', c.dose.notConfirmed),
    chip('dose.missed', c.dose.missed),
    chip('supplement', c.supplement),
    // White on both ends of the primary gradient: buttons and the Due now chip.
    p('text.inverse', c.text.inverse, 'action.primaryFrom', c.action.primaryFrom),
    p('text.inverse', c.text.inverse, 'action.primaryTo', c.action.primaryTo),
    p('dose.dueNow.fg', c.dose.dueNow.fg, 'dose.dueNow.from', c.dose.dueNow.from),
    // Hero text stays on the blue side (the spec); the teal end is never under text.
    p('text.inverse', c.text.inverse, 'hero.from', c.hero.from),
    // Blue fills and icons are UI parts: 3:1.
    p('action.blue', c.action.blue, 'bg.screen', screen, MIN_UI),
    p('action.blue', c.action.blue, 'bg.glass', glass, MIN_UI),
  );
  return pairs;
}

// These must fail. They keep two rules enforced: fill blue is never used as text
// (use text.link), and tertiary text never sits on bg.subtle.
export const forbiddenPairs: ContrastPair[] = [
  pair('action.blue (light)', themes.light.color.action.blue, 'bg.screen', color.bg.screen, MIN_TEXT),
  pair('text.tertiary', color.text.tertiary, 'bg.subtle', color.bg.subtle, MIN_TEXT),
];

// The spec's own light values for the pairs behind interim tokens (tokens.ts, interimLight). Each
// must still fail; when one passes, the designer's fix has landed and its interim can go.
const lightScreen = themes.light.color.bg.screen;
export const specFailingPairs: ContrastPair[] = [
  pair('spec text-tertiary', specFailing.textTertiary, 'bg', lightScreen, MIN_TEXT),
  pair('spec action-blue as text', specFailing.actionBlue, 'white', '#FFFFFF', MIN_TEXT),
  pair('white', '#FFFFFF', 'spec primary-gradient top', specFailing.primaryFrom, MIN_TEXT),
  pair('spec teal-text', specFailing.tealText, 'teal-tint', themes.light.color.bg.tintTeal, MIN_TEXT),
  pair('spec Taken', specFailing.takenText, 'Taken chip', themes.light.color.dose.taken.bg, MIN_TEXT),
];

export interface TouchStyle {
  minHeight?: number;
  minWidth?: number;
  height?: number;
  width?: number;
}

export function meetsTouchTarget(style: TouchStyle, hitSlop = 0): boolean {
  const height = (style.minHeight ?? style.height ?? 0) + 2 * hitSlop;
  const width = (style.minWidth ?? style.width ?? 0) + 2 * hitSlop;
  return height >= MIN_TOUCH && width >= MIN_TOUCH;
}
