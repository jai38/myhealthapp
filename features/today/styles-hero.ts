import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/index';

export const styles = StyleSheet.create({
  heroDoseCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
        } as any)
      : shadows.sm),
  },
  heroDoseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDoseBadge: {
    backgroundColor: colors.accentCoralLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.15)',
  },
  heroDoseBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentCoral,
    letterSpacing: 0.5,
  },
  badgeDueNow: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  badgeDueNowText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  badgeSnoozed: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  badgeSnoozedText: {
    color: '#D97706',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  upcomingNoticeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  upcomingNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 16,
  },
  heroSnoozedBadge: {
    backgroundColor: colors.accentCustardLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  heroSnoozedText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentCustard,
  },
  heroTimeChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  heroTimeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroMedName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  heroMedMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  instructionsBox: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  instructionsText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    fontWeight: '500',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionSkip: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  heroActionSkipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  heroActionSnooze: {
    backgroundColor: colors.accentCustardLight,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
  },
  heroActionSnoozeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentCustard,
  },
  heroActionTaken: {
    backgroundColor: colors.accentCoral,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
        } as any)
      : {}),
  },
  heroActionTakenText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: 0.3,
  },

  // Streak celebration
  streakCelebrationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.08)',
        } as any)
      : shadows.sm),
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 28,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accentMint,
  },
  streakSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyDayCard: {
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyDayText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  addMedQuickBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  addMedQuickBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },

  // Complete Daily Schedule List
});
