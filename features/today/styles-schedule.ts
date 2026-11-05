import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/index';

export const styles = StyleSheet.create({
  dailyScheduleContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        } as any)
      : shadows.sm),
  },
  dailyScheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  dailyScheduleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dailyScheduleSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  manageScheduleLink: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  manageScheduleLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentCoral,
  },
  doseScheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  doseScheduleTimeBox: {
    width: 64,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: spacing.xs,
  },
  doseScheduleTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  doseScheduleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
    marginTop: 4,
  },
  doseScheduleDotTaken: {
    backgroundColor: colors.accentMint,
  },
  doseScheduleDotSnoozed: {
    backgroundColor: colors.accentCustard,
  },
  doseScheduleDotSkipped: {
    backgroundColor: colors.textMuted,
  },
  doseScheduleInfo: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  doseScheduleMedName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  doseScheduleInstructions: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  doseScheduleActionBox: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  scheduleBadgeTaken: {
    backgroundColor: colors.accentMintLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  scheduleBadgeTakenText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentMint,
  },
  scheduleBadgeSnoozed: {
    backgroundColor: colors.accentCustardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  scheduleBadgeSnoozedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentCustard,
  },
  scheduleBadgeSkipped: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  scheduleBadgeSkippedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  scheduleTakeBtn: {
    backgroundColor: colors.accentCoral,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
        } as any)
      : {}),
  },
  scheduleTakeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
  },

  // Action Hub
  asNeededSectionContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 4px 16px rgba(15, 76, 129, 0.06)' } as any)
      : shadows.sm),
  },
  asNeededHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  asNeededSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  asNeededSectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  asNeededHeaderBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  asNeededHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  asNeededCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  asNeededInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  asNeededMedName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  asNeededMedSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  asNeededTakenNotice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
  asNeededLogBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  asNeededLogBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
