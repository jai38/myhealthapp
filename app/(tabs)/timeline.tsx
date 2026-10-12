import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { spacing, typography } from '../../theme/index';

export default function TimelineScreen() {
  return (
    <ScreenLayout>
      <View style={styles.header}>
        <Text style={typography.h2}>Medical Timeline</Text>
        <Text style={[typography.bodyMuted, styles.subHeader]}>
          A chronological record of your documented medical history.
        </Text>
      </View>

      <Card variant="muted" style={styles.emptyCard}>
        <Badge label="Timeline Empty" variant="neutral" style={styles.badge} />
        <Text style={[typography.h3, styles.emptyTitle]}>No Records Added Yet</Text>
        <Text style={[typography.bodyMuted, styles.emptyDescription]}>
          When you upload prescriptions and clinical summaries, they will be organized here by the date of your medical consultation.
        </Text>
      </Card>
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
  emptyCard: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
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
