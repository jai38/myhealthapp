import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/index';

export interface AdherenceDonutProps {
  percentage: number; // 0 to 100
  takenCount: number;
  totalCount: number;
  label?: string;
  subLabel?: string;
}

export const AdherenceDonut: React.FC<AdherenceDonutProps> = ({
  percentage = 100,
  takenCount = 0,
  totalCount = 0,
  label = 'Daily Momentum',
  subLabel = 'Routine Consistency',
}) => {
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const remainingCount = Math.max(0, totalCount - takenCount);

  // SVG parameters
  const size = 140;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 270 degree arc for Baseline AI feel (sweep = 0.75 of circumference)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clampedPct / 100) * arcLength;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleBadge}>
          <Text style={styles.streakFlame}>🔥</Text>
          <Text style={styles.titleBadgeText}>DAILY MOMENTUM</Text>
        </View>
        <Text style={styles.adjustedTime}>
          {totalCount === 0 ? 'No routine today' : `${takenCount} of ${totalCount} completed`}
        </Text>
      </View>

      <View style={styles.contentRow}>
        {/* Donut progress ring */}
        <View style={styles.donutContainer}>
          {Platform.OS === 'web' ? (
            <svg
              width={size}
              height={size}
              style={{
                transform: 'rotate(135deg)',
                overflow: 'visible',
                filter: clampedPct > 0 ? 'drop-shadow(0px 4px 12px rgba(255, 91, 34, 0.25))' : 'none',
              }}
            >
              <defs>
                <linearGradient id="donutCoralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF5B22" />
                  <stop offset="100%" stopColor="#FF8C42" />
                </linearGradient>
                <linearGradient id="donutMintGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>
              {/* Background track arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(17, 24, 39, 0.07)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Progress active arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={clampedPct >= 100 ? 'url(#donutMintGradient)' : 'url(#donutCoralGradient)'}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </svg>
          ) : (
            <View style={styles.nativeRingPlaceholder}>
              <View style={[styles.nativeRingBorder, { borderColor: clampedPct >= 100 ? colors.accentMint : colors.accentCoral }]} />
            </View>
          )}

          {/* Center typography inside Donut */}
          <View style={styles.donutCenter}>
            <Text style={styles.centerValue}>
              {totalCount > 0 ? `${clampedPct}%` : '100%'}
            </Text>
            <Text style={styles.centerLabel}>
              {remainingCount === 0 && totalCount > 0
                ? 'All Done! 🔥'
                : remainingCount === 1
                ? '1 left today'
                : `${remainingCount} doses left`}
            </Text>
          </View>
        </View>

        {/* Right side breakdown decomposition (Baseline AI style) */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>{label}</Text>
          <Text style={styles.breakdownBigNumber}>
            {totalCount > 0 ? `${takenCount}/${totalCount}` : 'All Clear'}
          </Text>

          <View style={styles.statsList}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={[styles.statValue, { color: colors.accentMint }]}>
                {takenCount} done
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, { color: colors.accentCoral }]}>
                {remainingCount} left
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={[styles.statValue, { color: clampedPct >= 80 ? colors.accentMint : colors.accentCoral }]}>
                {clampedPct >= 100 ? 'Flawless ⚡' : clampedPct >= 80 ? 'Crushing It 🔥' : 'Keep Going 💪'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Mini timeline capsules row */}
      <View style={styles.footerCapsules}>
        <View style={styles.capsuleSlot}>
          <Text style={styles.capsuleTime}>Morning ☀️</Text>
          <View style={[styles.capsuleBar, takenCount > 0 ? styles.capsuleTaken : styles.capsulePending]}>
            <Text style={styles.capsuleCheck}>{takenCount > 0 ? '✓' : '•'}</Text>
          </View>
        </View>
        <View style={styles.capsuleSlot}>
          <Text style={styles.capsuleTime}>Midday ⚡</Text>
          <View style={[styles.capsuleBar, takenCount > 1 ? styles.capsuleTaken : styles.capsulePending]}>
            <Text style={styles.capsuleCheck}>{takenCount > 1 ? '✓' : '•'}</Text>
          </View>
        </View>
        <View style={styles.capsuleSlot}>
          <Text style={styles.capsuleTime}>Night 🌙</Text>
          <View style={[styles.capsuleBar, takenCount >= totalCount && totalCount > 0 ? styles.capsuleTaken : styles.capsulePending]}>
            <Text style={styles.capsuleCheck}>{takenCount >= totalCount && totalCount > 0 ? '✓' : '•'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.xxl,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 12px 36px rgba(14, 17, 22, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        } as any)
      : {}),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentCoralLight,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 91, 34, 0.15)',
  },
  streakFlame: {
    fontSize: 12,
    marginRight: 4,
  },
  dotCoral: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentCoral,
    marginRight: 6,
  },
  titleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentCoral,
    letterSpacing: 0.5,
  },
  adjustedTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donutContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  nativeRingPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    borderColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeRingBorder: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  breakdownContainer: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  breakdownBigNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 4,
  },
  statsList: {
    marginTop: 6,
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerCapsules: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  capsuleSlot: {
    flex: 1,
    alignItems: 'center',
  },
  capsuleTime: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  capsuleBar: {
    width: '100%',
    height: 24,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsuleTaken: {
    backgroundColor: colors.accentMintLight,
  },
  capsulePending: {
    backgroundColor: colors.surfaceSecondary,
  },
  capsuleCheck: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
