// Design tokens for the Ayoreni component system. Components use the semantic
// names exported below, never a raw hex value.

const palette = {
  white: '#FFFFFF',
  clearBlue: '#2878C7',
  clearBluePressed: '#1F69B0',
  teal: '#06706F',
  deepNavy: '#16324F',
  slate: '#526372',
  slateTertiary: '#627080',
  coolGrey: '#F2F5F7',
  greyFill: '#E8ECF0',
  tileRed: '#D14343',
  tileOrange: '#B85E0A',
  tilePurple: '#6A4FD0',
  tileGreen: '#2E8B57',
  tileGrey: '#6B7884',
  tintBlue: '#E8F1FB',
  tintTeal: '#E3F4F4',
  borderSubtle: '#E3E8ED',
  borderInput: '#7D8B97',
  waveFrom: '#BFE3F7',
  waveTo: '#7FD3E6',
  danger: '#B42318',
  successText: '#1E7A45',
  successFill: '#E7F5EC',
  cautionText: '#8A5300',
  cautionFill: '#FFF3DD',
  dangerFill: '#FDECEA',
  neutralText: '#46525C',
  neutralFill: '#EDF0F3',
  sourceText: '#066A6E',
} as const;

export const color = {
  // Grouped layout, Apple Health style: grey screen, white cards and lists.
  bg: {
    screen: palette.coolGrey,
    // Fills inside white cards: chips, segmented tracks, pressed rows.
    subtle: palette.greyFill,
    card: palette.white,
    tintBlue: palette.tintBlue,
    tintTeal: palette.tintTeal,
  },
  text: {
    primary: palette.deepNavy,
    secondary: palette.slate,
    // On white or the grey screen (4.62:1). Not on bg.subtle (4.26:1).
    tertiary: palette.slateTertiary,
    inverse: palette.white,
    // Deeper than the fill blue so it reads on white (5.67:1) and grey (5.18:1).
    link: palette.clearBluePressed,
  },
  action: {
    primary: palette.clearBlue,
    primaryPressed: palette.clearBluePressed,
    secondary: palette.teal,
    danger: palette.danger,
  },
  border: {
    subtle: palette.borderSubtle,
    input: palette.borderInput,
    focus: palette.clearBlue,
  },
  // Category tiles: a white filled glyph on a colored rounded square.
  tile: {
    blue: palette.clearBlue,
    teal: palette.teal,
    red: palette.tileRed,
    orange: palette.tileOrange,
    purple: palette.tilePurple,
    green: palette.tileGreen,
    neutral: palette.tileGrey,
  },
  wave: {
    from: palette.waveFrom,
    to: palette.waveTo,
  },
  tone: {
    info: { fg: palette.clearBluePressed, bg: palette.tintBlue },
    success: { fg: palette.successText, bg: palette.successFill },
    caution: { fg: palette.cautionText, bg: palette.cautionFill },
    danger: { fg: palette.danger, bg: palette.dangerFill },
    neutral: { fg: palette.neutralText, bg: palette.neutralFill },
    source: { fg: palette.sourceText, bg: palette.tintTeal },
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
} as const;

export const elevation = {
  none: {
    shadowColor: palette.deepNavy,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Cards are flat white on the grey screen; only a hairline of depth.
  card: {
    shadowColor: palette.deepNavy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  raised: {
    shadowColor: palette.deepNavy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  // Negative y offset: the shadow falls upward, from a sheet rising off the bottom edge.
  sheet: {
    shadowColor: palette.deepNavy,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export const motion = {
  duration: { fast: 120, base: 200, slow: 320 },
  easing: { standard: 'ease-out' },
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
  tabBarHeight: 64,
} as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
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
