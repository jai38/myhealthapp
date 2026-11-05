import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/index';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  pageSubHeader: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  addMedHeaderBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addMedHeaderBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '800',
  },
  actionNoticeBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionNoticeText: {
    ...typography.caption,
    color: '#15803D',
    fontWeight: '700',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },

  /* 1. HERO REMINDER CARD */
  heroReminderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
        } as any)
      : shadows.sm),
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentCoralLight,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.15)',
  },
  heroBadgeIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentCoral,
    letterSpacing: 0.8,
  },
  heroTimeChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  heroTimeChipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  heroMedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  heroMedSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    marginBottom: spacing.md,
  },
  heroSnoozeBanner: {
    backgroundColor: colors.accentCustardLight,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentCustard,
  },
  heroSnoozeText: {
    color: colors.accentCustard,
    fontSize: 12,
    fontWeight: '600',
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnSkip: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  heroBtnSkipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  heroBtnSnooze: {
    backgroundColor: colors.accentCustardLight,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  heroBtnSnoozeText: {
    color: colors.accentCustard,
    fontSize: 13,
    fontWeight: '700',
  },
  heroBtnTaken: {
    backgroundColor: colors.accentCoral,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
        } as any)
      : {}),
  },
  heroBtnTakenText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* All Caught Up Card */
  allCaughtUpCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.08)',
        } as any)
      : shadows.sm),
  },
  allCaughtUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allCaughtUpIcon: {
    fontSize: 26,
  },
  allCaughtUpTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accentMint,
  },
  allCaughtUpSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  /* 2. WEEKLY ADHERENCE CARD */
});
