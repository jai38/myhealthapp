import { color } from './tokens';

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

// These must fail. They keep two rules enforced: fill blue is never used as text
// on the grey screen (use text.link), and tertiary text never sits on bg.subtle.
export const forbiddenPairs: ContrastPair[] = [
  pair('action.primary', color.action.primary, 'bg.screen', color.bg.screen, MIN_TEXT),
  pair('text.tertiary', color.text.tertiary, 'bg.subtle', color.bg.subtle, MIN_TEXT),
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
