import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { colors, spacing, typography } from '../../theme/index';

export default function HomeScreen() {
  return (
    <ScreenLayout>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.subGreeting}>Here is your health overview for today</Text>
      </View>

      {/* Today's Schedule Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={typography.h3}>Today's Regimen</Text>
          <Badge label="0 Scheduled" variant="neutral" />
        </View>
        <Text style={[typography.bodyMuted, styles.cardDescription]}>
          No medications currently scheduled for today. You can upload a prescription to have your medicines organized.
        </Text>
        <Button
          title="Upload Prescription"
          variant="primary"
          onPress={() => {
            // Prepared for Phase 2 integration
          }}
        />
      </Card>

      {/* Medical Timeline Shortcut Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={typography.h3}>Recent Timeline</Text>
          <Badge label="Up to date" variant="info" />
        </View>
        <Text style={[typography.bodyMuted, styles.cardDescription]}>
          Your verified clinical records and prescriptions will appear chronologically in your medical timeline.
        </Text>
      </Card>

      {/* Privacy Notice Card */}
      <Card variant="muted" style={styles.privacyCard}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          Your health records are stored privately and encrypted. The app never makes assumptions or alters your medical history without your review.
        </Text>
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h1,
  },
  subGreeting: {
    ...typography.bodyMuted,
    marginTop: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardDescription: {
    marginBottom: spacing.md,
  },
  privacyCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
