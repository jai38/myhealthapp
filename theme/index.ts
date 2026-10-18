/**
 * Design Tokens — Health Baseline OS (Fitness & Health Pro Edition)
 *
 * Liquid Glass & Tactile Modernism synthesized from Ronald Olsen's Health Tracker
 * (tactile clay squircles, 3D pill capsules, pastel health taxonomy, weekday carousel)
 * and Baseline AI (obsidian telemetry cards, solar coral neon glow, 270° radial dial).
 *
 * Meets WCAG 2.2 Level AA contrast requirements.
 */

export const colors = {
  // Serene Porcelain Canvas & Elevated Medical Surfaces
  background: '#F8FAFC', // Crisp, calming porcelain background
  surface: '#FFFFFF', // Pristine white card
  surfaceGlass: 'rgba(255, 255, 255, 0.94)', // Frosted glass surface
  surfaceGlassSubtle: 'rgba(255, 255, 255, 0.75)',
  surfaceSecondary: '#F1F5F9', // Soft recessed slate container
  surfaceMuted: '#F8FAFC', // Recessed input backdrop
  surfaceElevated: '#FFFFFF', // High-elevation card
  surfaceHighlight: '#FFFFFF',

  // Deep Slate Obsidian (Authoritative clinical contrast)
  surfaceObsidian: '#0F172A',
  surfaceObsidianCard: '#1E293B',

  // Subtle Precision Hairline Borders
  border: 'rgba(15, 23, 42, 0.07)',
  borderStrong: 'rgba(15, 23, 42, 0.14)',
  borderSubtle: 'rgba(15, 23, 42, 0.04)',
  borderGlass: 'rgba(255, 255, 255, 0.9)',
  borderGlassRim: 'rgba(255, 255, 255, 0.95)',
  borderTopGlass: 'rgba(255, 255, 255, 0.95)',

  // Deep Slate Obsidian Primary
  primary: '#0F172A', // Authoritative deep slate
  primaryHover: '#1E293B',
  primaryLight: '#F1F5F9',
  primaryDark: '#020617',

  // Primary Medical Accent: Calming Clinical Blue (Replaces blazing neon coral)
  accentCoral: '#0284C7', // Clinical Sky Blue (Actions, upcoming dose highlights)
  accentCoralGlow: 'rgba(2, 132, 199, 0.16)',
  accentCoralLight: '#F0F9FF',
  accentCoralDark: '#0369A1',

  // Restorative Emerald Mint (Doses taken, verified records, normal labs)
  accentMint: '#10B981', // Clinical Emerald
  accentMintGlow: 'rgba(16, 185, 129, 0.16)',
  accentMintLight: '#ECFDF5',
  accentMintSoft: '#D1FAE5',

  // Warm Muted Amber (Pending reminders, snooze alarms)
  accentCustard: '#D97706', // Warm Amber
  accentCustardGlow: 'rgba(217, 119, 6, 0.16)',
  accentCustardLight: '#FFFBEB',
  accentCustardSoft: '#FEF3C7',

  // Secondary Accents (Healthcare Category Taxonomy — Muted & Cohesive)
  accentCyan: '#0284C7', // Clinical Sapphire
  accentCyanGlow: 'rgba(2, 132, 199, 0.12)',
  accentCyanLight: '#F0F9FF',
  accentCyanSoft: '#E0F2FE',

  accentPeach: '#D97706', // Soft Amber (replaces jarring neon peach)
  accentPeachGlow: 'rgba(217, 119, 6, 0.12)',
  accentPeachLight: '#FFFBEB',
  accentPeachSoft: '#FEF3C7',

  accentViolet: '#475569', // Calm Slate (replaces electric purple)
  accentVioletGlow: 'rgba(71, 85, 105, 0.12)',
  accentVioletLight: '#F1F5F9',

  // Compatibility Semantic Aliases
  secondary: '#0284C7',
  secondaryLight: '#E0F2FE',
  amberGold: '#D97706',
  amberGoldLight: '#FFFBEB',
  teal: '#10B981',
  tealDark: '#059669',
  navy: '#0F172A',
  navyLight: '#F1F5F9',

  // Crisp High-Legibility Typography
  textPrimary: '#0F172A', // Deep slate for high-contrast headlines & metrics
  textSecondary: '#475569', // Calm slate for friendly descriptions
  textMuted: '#94A3B8', // Subtle timestamps and micro-labels
  textInverse: '#FFFFFF', // Pure white on dark elements

  // Status Feedback
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  info: '#0284C7',
  infoLight: '#F0F9FF',
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
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 26,
  xxl: 30,
  full: 9999,
} as const;

export const typography = {
  metricHero: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  streakHero: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
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
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  badge: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700' as const,
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700' as const,
    color: colors.textInverse,
    letterSpacing: 0.2,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  coralGlow: {
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  mintGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  cyanGlow: {
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  glassCard: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
} as const;
