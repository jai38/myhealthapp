/**
 * Design Tokens — My Health App
 *
 * Theme philosophy: Calm, premium, accessible health-tech palette.
 * Complies with WCAG 2.2 Level AA contrast standards (minimum 4.5:1 for body text).
 */

export const colors = {
  // Advanced Fitness Tracker Canvas (Whoop / Apple Fitness / Oura Obsidian)
  background: '#0A0F1D', // Deep Obsidian Carbon screen canvas
  surface: '#121A2D', // Polished dark card surface
  surfaceMuted: '#19243C', // Container / chip / input background
  surfaceElevated: '#1F2C47', // Raised elements
  surfaceHighlight: '#2A3B5E', // Glow border highlight

  // High-Tech Subtle Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',

  // Vitality Primary: Electric Mint / Neon Emerald
  primary: '#00F5A0', // Neon Mint (high-vitality streak, target, primary action)
  primaryHover: '#00DC8F',
  primaryLight: 'rgba(0, 245, 160, 0.15)', // Glowing badge background
  primaryDark: '#00B875',

  // Performance Secondary: Cyber Cyan
  secondary: '#00E5FF', // Cyber Cyan (vitals, timelines, metrics)
  secondaryLight: 'rgba(0, 229, 255, 0.15)',

  // Energy & Alerts
  amberGold: '#FFB703', // Electric Gold / Flame (upcoming countdowns, alarms)
  amberGoldLight: 'rgba(255, 183, 3, 0.18)',

  // Theme Compatibility & Contrast
  teal: '#00F5A0',
  tealDark: '#00B875',
  navy: '#FFFFFF', // High-contrast clean white text on dark cards
  navyLight: '#E2E8F0',
  accentMint: '#00F5A0',
  accentMintLight: 'rgba(0, 245, 160, 0.12)',

  // High-Contrast Typography
  textPrimary: '#FFFFFF', // Pure White for titles and metrics
  textSecondary: '#94A3B8', // Silver Slate for descriptions
  textMuted: '#64748B', // Carbon Muted for secondary labels
  textInverse: '#0A0F1D', // Obsidian text on electric neon buttons

  // Status & Telemetry Feedback
  success: '#00F5A0', // Target achieved / Dose taken
  successLight: 'rgba(0, 245, 160, 0.15)',
  warning: '#FFB703', // Attention / Snooze active
  warningLight: 'rgba(255, 183, 3, 0.18)',
  danger: '#FF4757', // Skipped / Error / Critical
  dangerLight: 'rgba(255, 71, 87, 0.18)',
  info: '#00E5FF', // Telemetry & clinical notes
  infoLight: 'rgba(0, 229, 255, 0.15)',
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
