import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme/index';
import { ReportExportModal } from '../../features/reports/ReportExportModal';

export default function ProfileScreen() {
  const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <Text style={typography.h2}>Patient Profile</Text>
        <Text style={[typography.bodyMuted, styles.subHeader]}>
          Account details, regional preferences, and privacy controls.
        </Text>
      </View>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={typography.h3}>Account & Identity</Text>
          <Badge label="Active" variant="success" />
        </View>
        <Text style={typography.body}>Demo Patient Account</Text>
        <Text style={typography.bodyMuted}>patient@myhealthapp.local</Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={typography.h3}>Medical Reports & Export</Text>
          <Badge label="Doctor Ready" variant="info" />
        </View>
        <Text style={[typography.bodyMuted, { marginBottom: spacing.md }]}>
          Generate professional, doctor-ready PDF reports with verified timeline history, exact medication regimens, and patient notes.
        </Text>
        <Button
          title="Generate Medical PDF Report"
          variant="outline"
          onPress={() => setExportModalVisible(true)}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={[typography.h3, styles.sectionTitle]}>Preferences</Text>
        <View style={styles.row}>
          <Text style={typography.body}>Timezone</Text>
          <Text style={typography.bodyMuted}>Asia/Kolkata (IST)</Text>
        </View>
        <View style={styles.row}>
          <Text style={typography.body}>Notifications</Text>
          <Text style={typography.bodyMuted}>Local device alerts</Text>
        </View>
      </Card>

      <Card variant="muted" style={styles.privacyCard}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          Data Privacy & Ownership Notice: All medical documents and clinical event records belong to you. We do not sell personal data, train public AI models on your prescriptions, or share health information without your explicit direction.
        </Text>
      </Card>

      <ReportExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />
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
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  privacyCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});

