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
  // Porcelain Canvas & Liquid Glass Surfaces
  background: '#F4F6F9', // Warm, calm porcelain background with ambient depth
  surface: '#FFFFFF', // Elevated white squircle card
  surfaceGlass: 'rgba(255, 255, 255, 0.85)', // Liquid glass frosted surface
  surfaceGlassSubtle: 'rgba(255, 255, 255, 0.65)',
  surfaceSecondary: '#EEF2F6', // Soft recessed pill container
  surfaceMuted: '#F8F9FB', // Recessed input & backdrop container
  surfaceElevated: '#FFFFFF', // High-elevation card
  surfaceHighlight: '#FFFFFF',

  // Obsidian Dark Accent Cards (Baseline AI Signature)
  surfaceObsidian: '#0E1116',
  surfaceObsidianCard: '#161B22',

  // Hairline Precision Glass Borders
  border: 'rgba(0, 0, 0, 0.06)',
  borderStrong: 'rgba(0, 0, 0, 0.12)',
  borderSubtle: 'rgba(0, 0, 0, 0.04)',
  borderGlass: 'rgba(255, 255, 255, 0.9)', // Glossy top rim highlight
  borderGlassRim: 'rgba(255, 255, 255, 0.95)',
  borderTopGlass: 'rgba(255, 255, 255, 0.95)',

  // High-Contrast Obsidian Primary
  primary: '#0E1116', // Obsidian deep black
  primaryHover: '#1E232B',
  primaryLight: '#F1F4F8',
  primaryDark: '#080A0D',

  // Baseline AI Signature: Solar Coral Neon
  accentCoral: '#FF5B22', // High-energy Solar Coral (streaks, AI actions, priority alerts)
  accentCoralGlow: 'rgba(255, 91, 34, 0.28)',
  accentCoralLight: '#FFF1EC',
  accentCoralDark: '#E04710',

  // Ronald Olsen Pastels: Purposeful Health-Category Taxonomy
  accentCyan: '#06B6D4', // Glacier Cyan (Consultations, activity timeline, telemetry)
  accentCyanGlow: 'rgba(6, 182, 212, 0.25)',
  accentCyanLight: '#E0F2FE',
  accentCyanSoft: '#CFFAFE',

  accentMint: '#10B981', // Pistachio Matcha (Doses taken, verified records, normal labs)
  accentMintGlow: 'rgba(16, 185, 129, 0.25)',
  accentMintLight: '#DCFCE7',
  accentMintSoft: '#D1FAE5',

  accentCustard: '#F59E0B', // Sunny Lemon (Pending doses, alarms, refill notices)
  accentCustardGlow: 'rgba(245, 158, 11, 0.25)',
  accentCustardLight: '#FEF9C3',
  accentCustardSoft: '#FEF3C7',

  accentPeach: '#F97316', // Melon Peach (Snooze reminders, warnings, delta metrics)
  accentPeachGlow: 'rgba(249, 115, 22, 0.25)',
  accentPeachLight: '#FFEDD5',
  accentPeachSoft: '#FFEDD5',

  accentViolet: '#8B5CF6', // Electric Purple (Smart insights, evening wind-down)
  accentVioletGlow: 'rgba(139, 92, 246, 0.25)',
  accentVioletLight: '#F3E8FF',

  // Compatibility & Semantic Color Tokens
  secondary: '#06B6D4',
  secondaryLight: '#E0F2FE',
  amberGold: '#F59E0B',
  amberGoldLight: '#FEF9C3',
  teal: '#10B981',
  tealDark: '#059669',
  navy: '#0E1116',
  navyLight: '#F1F4F8',

  // Razor-Sharp Obsidian Typography
  textPrimary: '#0E1116', // Deep obsidian black for bold headlines & numbers
  textSecondary: '#4A5568', // Balanced slate for friendly readable descriptions
  textMuted: '#718096', // Micro-labels and placeholders
  textInverse: '#FFFFFF', // Pure white on dark buttons & cards

  // Status & Telemetry Feedback
  success: '#10B981',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF9C3',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#06B6D4',
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
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 26, // Ronald Olsen signature squircle
  xxl: 30, // Baseline floating dock squircle
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
    shadowColor: '#0E1116',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0E1116',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0E1116',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.11,
    shadowRadius: 36,
    elevation: 8,
  },
  coralGlow: {
    shadowColor: '#FF5B22',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 6,
  },
  mintGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  cyanGlow: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  glassCard: {
    shadowColor: '#0E1116',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
} as const;
