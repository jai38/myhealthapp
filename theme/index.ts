/**
 * Design Tokens — Health Baseline OS
 *
 * Synthesized from Ronald Olsen's Health Tracker (organic squircle geometry, pastel category coding,
 * weekday adherence carousel) and Baseline AI (high-contrast obsidian typography, solar coral accents,
 * smart suggestion cards, telemetry progress donut).
 *
 * Complies with WCAG 2.2 Level AA contrast standards (minimum 4.5:1 for body text).
 */

export const colors = {
  // Porcelain Canvas & Elevated Squircles
  background: '#F6F8FA', // Warm, calm porcelain background
  surface: '#FFFFFF', // Elevated white squircle card
  surfaceSecondary: '#F1F3F6', // Subtle soft pill container
  surfaceMuted: '#F8F9FB', // Recessed input & backdrop container
  surfaceElevated: '#FFFFFF', // High-elevation card
  surfaceHighlight: '#FFFFFF',

  // Hairline Precision Borders
  border: 'rgba(0, 0, 0, 0.06)',
  borderStrong: 'rgba(0, 0, 0, 0.12)',
  borderSubtle: 'rgba(0, 0, 0, 0.04)',
  borderTopGlass: 'rgba(255, 255, 255, 0.8)',

  // High-Contrast Obsidian Primary
  primary: '#111418', // Obsidian black (hero buttons, active indicators)
  primaryHover: '#22262B',
  primaryLight: '#F1F3F6',
  primaryDark: '#0A0C0E',

  // Baseline AI Signature: Solar Coral
  accentCoral: '#FF5B22', // Solar Coral (AI triggers, vital action pills, streaks)
  accentCoralLight: '#FFF1EC',
  accentCoralDark: '#E04710',

  // Ronald Olsen Pastels: Purposeful Health-Category Taxonomy
  accentCyan: '#0284C7', // Glacier Cyan (Consultations, activity timeline, telemetry)
  accentCyanLight: '#E0F2FE',
  accentCyanSoft: '#BFE7EE',

  accentMint: '#16A34A', // Pistachio Matcha (Doses taken, verified records, normal labs)
  accentMintLight: '#DCFCE7',
  accentMintSoft: '#D4ECC5',

  accentCustard: '#CA8A04', // Lemon Custard (Pending doses, alarms, refill notices)
  accentCustardLight: '#FEF9C3',
  accentCustardSoft: '#FFF099',

  accentPeach: '#EA580C', // Melon Peach (Snooze reminders, warnings, delta metrics)
  accentPeachLight: '#FFEDD5',
  accentPeachSoft: '#F8B684',

  // Compatibility & Semantic Color Tokens
  secondary: '#0284C7',
  secondaryLight: '#E0F2FE',
  amberGold: '#CA8A04',
  amberGoldLight: '#FEF9C3',
  teal: '#16A34A',
  tealDark: '#15803D',
  navy: '#111418',
  navyLight: '#F1F3F6',

  // Razor-Sharp Obsidian Typography
  textPrimary: '#111418', // Obsidian black for headings and prominent metrics
  textSecondary: '#5A6270', // Balanced warm slate for descriptions and labels
  textMuted: '#8E95A3', // Muted micro-labels and placeholders
  textInverse: '#FFFFFF', // Pure white on dark buttons

  // Status & Telemetry Feedback
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#CA8A04',
  warningLight: '#FEF9C3',
  danger: '#E11D48',
  dangerLight: '#FFE4E6',
  info: '#0284C7',
  infoLight: '#E0F2FE',
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
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24, // Ronald Olsen signature squircle
  xxl: 28, // Baseline dock squircle
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
    shadowColor: '#111418',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  md: {
    shadowColor: '#111418',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  lg: {
    shadowColor: '#111418',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.09,
    shadowRadius: 28,
    elevation: 6,
  },
} as const;
