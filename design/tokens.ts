// Design tokens for the Ayoreni component system. Components use the semantic
// names exported below, never a raw hex value.

// Calm Glass UI v4, frozen 16 November 2026: `designes/design/colour-shape-spec.md` on the
// design branch `designes/initial-upload`, with its contrast fix of 19 November 2026.

// Light values from the designer's contrast fix (colour-shape-spec.md, "Contrast fix
// (2026-11-19)", 04b task 6). Every text pair meets 4.5:1, disabled labels included.
const fixedLight = {
  textTertiary: '#647387',
  actionBlue: '#0062DB',
  primaryFrom: '#006AE6',
  primaryTo: '#0058E8',
  tealText: '#007358',
  takenText: '#097539',
  disabledText: '#5B6B7F',
  disabledBg: '#EBEFF4',
} as const;

// The hero gradient is the same in both themes. White text stays in its left 60%.
const hero = {
  from: '#0058E6',
  mid: '#0068EE',
  to: '#00B894',
  border: 'rgba(255,255,255,0.28)',
  sheen: 'rgba(255,255,255,0.14)',
  glow: '#6CE7D8',
  pill: 'rgba(0,20,70,0.18)',
} as const;

export type ThemeName = 'light' | 'dark';

export interface StatusColors {
  fg: string;
  bg: string;
}

export interface ShadowToken {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ThemeColors {
  bg: {
    /** Screen background, under the mesh. */
    screen: string;
    /** Sheets and other solid surfaces. */
    surface: string;
    /** Cards, tiles and icon buttons (translucent; blur behind it where the platform can). */
    glass: string;
    glassEdge: string;
    /** Hairline under the glass edge (light only; dark uses glassEdge alone). */
    glassHairline: string;
    divider: string;
    tintBlue: string;
    tintTeal: string;
    tabBar: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    /** Links and the active tab label: action blue, kept readable as text. */
    link: string;
    /** Teal icons and the Supplement tag. */
    teal: string;
    error: string;
    /** Disabled button labels: still 4.5:1 (the designer's decision). Disabled links use tertiary. */
    disabled: string;
  };
  action: {
    /** Fills, icons and the focus ring. Not for text: use text.link. */
    blue: string;
    /** Primary gradient, top to bottom: buttons and the Due now chip. */
    primaryFrom: string;
    primaryTo: string;
    disabledBg: string;
  };
  brand: {
    teal: string;
    tealGlow: string;
    /** Notification dot only. */
    alertDot: string;
  };
  hero: {
    /** 135 degrees: from 0%, mid 55%, to 135%. White text stays on the blue side. */
    from: string;
    mid: string;
    to: string;
    border: string;
    sheen: string;
    glow: string;
    /** Fill behind a pill or chip on the hero. */
    pill: string;
  };
  /** Blurred blobs (blur 48) behind content so the glass reads. */
  mesh: { teal: string; blue: string };
  /** Dose status chips. Always an icon and a word, never colour alone. */
  dose: {
    taken: StatusColors;
    /** White on the primary gradient. */
    dueNow: { fg: string; from: string; to: string };
    upcoming: StatusColors;
    notConfirmed: StatusColors;
    missed: StatusColors;
  };
  supplement: StatusColors;
}

export interface Theme {
  name: ThemeName;
  color: ThemeColors;
  shadow: { card: ShadowToken; hero: ShadowToken; button: ShadowToken | null };
}

const lightColors: ThemeColors = {
  bg: {
    screen: '#F7FAFC',
    surface: '#FFFFFF',
    glass: 'rgba(255,255,255,0.72)',
    glassEdge: 'rgba(255,255,255,0.95)',
    glassHairline: '#E7EEF5',
    divider: '#E7EEF5',
    tintBlue: '#E4F0FC',
    tintTeal: '#E6F8F3',
    tabBar: 'rgba(255,255,255,0.80)',
  },
  text: {
    primary: '#0F172A',
    secondary: '#5B6B7F',
    tertiary: fixedLight.textTertiary,
    inverse: '#FFFFFF',
    link: fixedLight.actionBlue,
    teal: fixedLight.tealText,
    error: '#D0101F',
    disabled: fixedLight.disabledText,
  },
  action: {
    blue: fixedLight.actionBlue,
    primaryFrom: fixedLight.primaryFrom,
    primaryTo: fixedLight.primaryTo,
    disabledBg: fixedLight.disabledBg,
  },
  brand: { teal: '#00C69C', tealGlow: '#6CE7D8', alertDot: '#FF091B' },
  hero,
  mesh: { teal: 'rgba(0,198,156,0.20)', blue: 'rgba(0,128,252,0.16)' },
  dose: {
    taken: { fg: fixedLight.takenText, bg: '#E3F5EA' },
    dueNow: { fg: '#FFFFFF', from: fixedLight.primaryFrom, to: fixedLight.primaryTo },
    upcoming: { fg: '#5B6B7F', bg: '#EEF2F7' },
    notConfirmed: { fg: '#9A5B00', bg: '#FFF1DB' },
    missed: { fg: '#D0101F', bg: '#FDE8EA' },
  },
  supplement: { fg: fixedLight.tealText, bg: '#E6F8F3' },
};

const darkColors: ThemeColors = {
  bg: {
    screen: '#07111F',
    surface: '#0C1B2D',
    glass: 'rgba(16,37,58,0.72)',
    glassEdge: 'rgba(46,144,255,0.16)',
    glassHairline: 'rgba(46,144,255,0.16)',
    divider: 'rgba(255,255,255,0.06)',
    tintBlue: 'rgba(46,144,255,0.14)',
    tintTeal: 'rgba(32,215,197,0.12)',
    tabBar: 'rgba(12,27,45,0.84)',
  },
  text: {
    primary: '#F7FAFF',
    secondary: '#B7C4D6',
    tertiary: '#8EA0B5',
    inverse: '#FFFFFF',
    link: '#2E90FF',
    teal: '#20D7C5',
    error: '#FF6B76',
    disabled: '#8EA0B5',
  },
  action: {
    blue: '#2E90FF',
    // The spec gives one gradient for both themes.
    primaryFrom: fixedLight.primaryFrom,
    primaryTo: fixedLight.primaryTo,
    disabledBg: 'rgba(255,255,255,0.07)',
  },
  brand: { teal: '#00C69C', tealGlow: '#6CE7D8', alertDot: '#FF091B' },
  hero,
  mesh: { teal: 'rgba(0,198,156,0.13)', blue: 'rgba(0,128,252,0.20)' },
  dose: {
    taken: { fg: '#5FD38D', bg: 'rgba(95,211,141,0.14)' },
    dueNow: { fg: '#FFFFFF', from: fixedLight.primaryFrom, to: fixedLight.primaryTo },
    upcoming: { fg: '#B7C4D6', bg: 'rgba(255,255,255,0.07)' },
    notConfirmed: { fg: '#F5B84A', bg: 'rgba(245,184,74,0.14)' },
    missed: { fg: '#FF6B76', bg: 'rgba(255,107,118,0.14)' },
  },
  supplement: { fg: '#20D7C5', bg: 'rgba(32,215,197,0.12)' },
};

// React Native shadows: the spec's CSS blur becomes shadowRadius at about half the blur.
export const themes: Record<ThemeName, Theme> = {
  light: {
    name: 'light',
    color: lightColors,
    shadow: {
      // 0 8px 24px rgba(20,60,120,0.08)
      card: { shadowColor: '#143C78', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
      // 0 14px 30px rgba(0,96,252,0.26)
      hero: { shadowColor: '#0058E8', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.26, shadowRadius: 15, elevation: 6 },
      // 0 6–8px 14–18px rgba(0,96,252,0.28–0.32)
      button: { shadowColor: '#0058E8', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    },
  },
  dark: {
    name: 'dark',
    color: darkColors,
    shadow: {
      // 0 8px 24px rgba(0,0,0,0.35), plus an inset top highlight drawn by the card itself.
      card: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 3 },
      // The hero edge glow, 0 0 0 1px rgba(108,231,216,0.18), is a border on the card.
      hero: { shadowColor: '#000000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.35, shadowRadius: 15, elevation: 6 },
      // No button glow in dark.
      button: null,
    },
  },
};

/** Inset top highlight on dark cards. */
export const darkCardHighlight = 'rgba(255,255,255,0.05)';
/** Hero edge in dark mode. */
export const darkHeroEdge = 'rgba(108,231,216,0.18)';

// Colours that v4 doesn't define, kept for the Phase 3 parts that still use them (category tiles,
// the wave header). They go when those parts are redrawn.
const legacy = {
  tileRed: '#D14343',
  tileOrange: '#B85E0A',
  tilePurple: '#6A4FD0',
  tileGreen: '#2E8B57',
  tileGrey: '#6B7884',
  waveFrom: '#BFE3F7',
  waveTo: '#7FD3E6',
  // Not in the spec: a pressed primary, a little deeper than the gradient's end.
  primaryPressed: '#004CCB',
} as const;

const L = lightColors;

// The light theme in the Phase 3 shape. Existing screens import this and so pick up v4's light
// colours (04b decision D4). New and rebuilt parts read `useTheme()` instead, which follows the
// system's light or dark setting.
export const color = {
  bg: {
    screen: L.bg.screen,
    // Fills inside cards: chips, segmented tracks, pressed rows.
    subtle: L.dose.upcoming.bg,
    card: L.bg.surface,
    tintBlue: L.bg.tintBlue,
    tintTeal: L.bg.tintTeal,
  },
  text: {
    primary: L.text.primary,
    secondary: L.text.secondary,
    // Not on bg.subtle (see forbiddenPairs).
    tertiary: L.text.tertiary,
    inverse: L.text.inverse,
    link: L.text.link,
  },
  action: {
    // Solid fills take the gradient's deeper end until buttons draw the gradient (task 11).
    primary: L.action.primaryTo,
    primaryPressed: legacy.primaryPressed,
    secondary: L.text.teal,
    danger: L.text.error,
  },
  border: {
    subtle: L.bg.divider,
    input: L.text.tertiary,
    focus: L.action.blue,
  },
  // Category tiles: a white filled glyph on a colored rounded square.
  tile: {
    blue: L.action.primaryTo,
    teal: L.text.teal,
    red: legacy.tileRed,
    orange: legacy.tileOrange,
    purple: legacy.tilePurple,
    green: legacy.tileGreen,
    neutral: legacy.tileGrey,
  },
  wave: {
    from: legacy.waveFrom,
    to: legacy.waveTo,
  },
  tone: {
    info: { fg: L.text.link, bg: L.bg.tintBlue },
    success: { fg: L.dose.taken.fg, bg: L.dose.taken.bg },
    caution: { fg: L.dose.notConfirmed.fg, bg: L.dose.notConfirmed.bg },
    danger: { fg: L.dose.missed.fg, bg: L.dose.missed.bg },
    neutral: { fg: L.dose.upcoming.fg, bg: L.dose.upcoming.bg },
    source: { fg: L.supplement.fg, bg: L.supplement.bg },
  },
} as const;

export type ToneName = keyof typeof color.tone;

export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  // Buttons and other primary controls.
  control: 14,
  lg: 16,
  xl: 24,
  full: 9999,
  // v4 shape. Buttons, chips and the tab bar are pills (full).
  hero: 28,
  card: 22,
  tile: 18,
  input: 16,
  iconChip: 12,
  iconChipLg: 14,
} as const;

// v4 layout on the 4 pt grid.
export const layout = {
  screenMargin: 16,
  sectionGap: 24,
  cardPadding: 16,
  tileGap: 12,
  rowMinHeight: 68,
  tabBar: { inset: 16, bottom: 30, height: 68, radius: 34 },
  heroPadding: 22,
} as const;

export const elevation = {
  none: {
    shadowColor: '#143C78',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // v4 light card: 0 8px 24px rgba(20,60,120,0.08).
  card: themes.light.shadow.card,
  raised: {
    shadowColor: '#143C78',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  // Negative y offset: the shadow falls upward, from a sheet rising off the bottom edge.
  sheet: {
    shadowColor: '#143C78',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export const motion = {
  // Chips and taps; cards and tabs; sheets.
  duration: { fast: 150, base: 250, slow: 350 },
  // cubic-bezier(0.2, 0, 0, 1), no bounce.
  easing: { standard: 'ease-out', bezier: [0.2, 0, 0, 1] as const },
} as const;

// With reduced motion on, every duration is 0. Looping animation must check
// the same flag and not run at all.
export function motionDuration(name: keyof typeof motion.duration, reduceMotion: boolean): number {
  return reduceMotion ? 0 : motion.duration[name];
}

export const size = {
  touchMin: 48,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  tile: 48,
  tileLg: 56,
  avatar: 32,
  buttonHeight: 52,
  inputHeight: 52,
  tabBarHeight: 68,
} as const;

export const font = {
  regular: 'PlusJakartaSans_400Regular',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'link' | 'danger';

export const textToneColor: Record<TextTone, string> = {
  primary: color.text.primary,
  secondary: color.text.secondary,
  tertiary: color.text.tertiary,
  inverse: color.text.inverse,
  link: color.text.link,
  danger: color.action.danger,
};
