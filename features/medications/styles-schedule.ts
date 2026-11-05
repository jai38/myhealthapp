import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/index';

export const styles = StyleSheet.create({
  adherenceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        } as any)
      : shadows.sm),
  },
  adherenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  adherenceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  adherenceSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  adherenceRateBadge: {
    backgroundColor: colors.accentMintLight,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  adherenceRateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentMint,
  },
  adherenceBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 70,
    paddingTop: spacing.xs,
  },
  adherenceCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  adherenceColSelected: {
    backgroundColor: colors.surfaceSecondary,
  },
  adherenceTrack: {
    width: 14,
    height: 48,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  adherenceFill: {
    width: '100%',
    borderRadius: borderRadius.full,
  },
  adherenceDayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 6,
  },
  adherenceDayLabelToday: {
    color: colors.primary,
    fontWeight: '800',
  },
  adherenceDayLabelSelected: {
    color: colors.accentCoral,
    fontWeight: '800',
  },

  /* 3. TODAY'S SCHEDULE LIST */
  sectionHeaderRow: {
    marginBottom: spacing.xs + 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  resetTodayBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accentCoralLight,
  },
  resetTodayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentCoral,
  },
  emptyDoseCard: {
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  scheduleItemCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.sm + 4,
    marginBottom: spacing.xs + 4,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
        } as any)
      : shadows.sm),
  },
  scheduleLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleIconBox: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleIconBoxActive: {
    backgroundColor: colors.accentCoralLight,
  },
  scheduleIconBoxTaken: {
    backgroundColor: colors.surfaceSecondary,
  },
  scheduleIconBoxSnoozed: {
    backgroundColor: colors.accentCustardLight,
  },
  scheduleIconEmoji: {
    fontSize: 18,
  },
  scheduleMedName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scheduleMedNameTaken: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  scheduleMedMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scheduleRightCol: {
    marginLeft: spacing.sm,
  },
  takenCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentMintLight,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  takenCheckIcon: {
    color: colors.accentMint,
    fontWeight: '900',
    fontSize: 12,
    marginRight: 4,
  },
  takenCheckText: {
    color: colors.accentMint,
    fontWeight: '800',
    fontSize: 11,
  },
  skippedBadge: {
    backgroundColor: colors.dangerLight,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  skippedText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 11,
  },
  quickActionGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  quickTakeBtn: {
    backgroundColor: colors.accentCoral,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
        } as any)
      : {}),
  },
  quickTakeBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  quickSkipBtn: {
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  quickSkipBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },

  /* 4. MEDICATION VAULT TABS & CARDS */
});
