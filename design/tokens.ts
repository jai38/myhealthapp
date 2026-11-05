// Design tokens for the Ayoreni component system. Components use the semantic
// names exported below, never a raw hex value.

const palette = {
  white: '#FFFFFF',
  clearBlue: '#2878C7',
  clearBluePressed: '#1F69B0',
  teal: '#087E83',
  deepNavy: '#16324F',
  slate: '#526372',
  slateTertiary: '#6A7884',
  coolGrey: '#F2F5F7',
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
  bg: {
    screen: palette.white,
    subtle: palette.coolGrey,
    card: palette.white,
    tintBlue: palette.tintBlue,
    tintTeal: palette.tintTeal,
  },
  text: {
    primary: palette.deepNavy,
    secondary: palette.slate,
    // White background only (4.53:1). Not allowed on bg.subtle.
    tertiary: palette.slateTertiary,
    inverse: palette.white,
    // Blue text sits on white only. On Cool Grey it measures 4.17:1, below 4.5:1.
    link: palette.clearBlue,
  },
  action: {
    primary: palette.clearBlue,
    primaryPressed: palette.clearBluePressed,
    // Teal text sits on white only, for the same contrast reason as link.
    secondary: palette.teal,
    danger: palette.danger,
  },
  border: {
    subtle: palette.borderSubtle,
    input: palette.borderInput,
    focus: palette.clearBlue,
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
  card: {
    shadowColor: palette.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
