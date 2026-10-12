import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { colors, spacing, borderRadius, typography } from '../../theme/index';

export default function MedicationsScreen() {
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <Text style={typography.h2}>Medication Centre</Text>
        <Text style={[typography.bodyMuted, styles.subHeader]}>
          Manage ongoing courses, reminder times, and dose history.
        </Text>
      </View>

      {/* Segmented Tab Control: Explicit Separation of Current vs Past */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'current' && styles.tabButtonActive]}
          onPress={() => setActiveTab('current')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'current' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            Currently Taking
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'past' && styles.tabButtonActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            Past Regimens
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'current' ? (
        <Card variant="muted" style={styles.emptyCard}>
          <Badge label="Active Regimens" variant="neutral" style={styles.badge} />
          <Text style={[typography.h3, styles.emptyTitle]}>No Active Medications</Text>
          <Text style={[typography.bodyMuted, styles.emptyDescription]}>
            You have no active medications configured. You can create a schedule or confirm medicines from uploaded prescriptions.
          </Text>
        </Card>
      ) : (
        <Card variant="muted" style={styles.emptyCard}>
          <Badge label="Historical Regimens" variant="neutral" style={styles.badge} />
          <Text style={[typography.h3, styles.emptyTitle]}>No Past Medications</Text>
          <Text style={[typography.bodyMuted, styles.emptyDescription]}>
            Completed and discontinued medication courses will be archived here with their recorded adherence logs.
          </Text>
        </Card>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  subHeader: {
    marginTop: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabTextInactive: {
    color: colors.textSecondary,
  },
  emptyCard: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  badge: {
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
