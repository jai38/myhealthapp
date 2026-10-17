/**
 * Design Tokens — My Health App
 *
 * Theme philosophy: Calm, premium, accessible health-tech palette.
 * Complies with WCAG 2.2 Level AA contrast standards (minimum 4.5:1 for body text).
 */

export const colors = {
  // Brand Primary: Calming Deep Teal & Emerald Accents
  primary: '#0F766E', // Primary interactive brand (teal-700)
  primaryHover: '#115E59',
  primaryLight: '#CCFBF1', // Soft badge background (teal-100)
  primaryDark: '#134E4A',

  // Landing Page Elevated Palette
  teal: '#2CBFAE',
  tealDark: '#24A396',
  navy: '#102A43',
  navyLight: '#1A3A5C',
  accentMint: '#9BE7C7',
  accentMintLight: '#E6F9F3',
  amberGold: '#FFC857',
  amberGoldLight: '#FEF3C7',

  // Secondary Accent
  secondary: '#0284C7', // Medical informational blue (sky-600)
  secondaryLight: '#E0F2FE',

  // Neutrals & Surfaces
  background: '#F8FAFC', // Soft off-white screen background (slate-50)
  surface: '#FFFFFF', // Pure white card surface
  surfaceMuted: '#F1F5F9', // Light grey input/card background (slate-100)
  border: '#E2E8F0', // Border divider (slate-200)
  borderStrong: '#CBD5E1',

  // Typography
  textPrimary: '#0F172A', // High contrast title & body text (slate-900)
  textSecondary: '#475569', // Secondary captions & descriptors (slate-600)
  textMuted: '#94A3B8', // Placeholder & disabled text (slate-400)
  textInverse: '#FFFFFF',

  // Status & Clinical Feedback
  success: '#15803D', // Taken / Confirmed (green-700)
  successLight: '#DCFCE7',
  warning: '#B45309', // Uncertain / Snoozed / Attention (amber-700)
  warningLight: '#FEF3C7',
  danger: '#B91C1C', // Missed / Skipped / Error (red-700)
  dangerLight: '#FEE2E2',
  info: '#1D4ED8', // Clinical notes / info (blue-700)
  infoLight: '#DBEAFE',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  bodyMuted: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  badge: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as const,
    color: colors.textInverse,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
