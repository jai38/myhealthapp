import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { formatMedicalEventDate, TimelineEvent } from '../../services/timeline/timeline-service';
import { styles } from './styles-feed';

export function RecentActivity({ recentEvents }: { recentEvents: TimelineEvent[] }) {
  const router = useRouter();
  return (
    <>
      {/* 8. LIVE RECENT ACTIVITY STREAM */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Recent Health Activity</Text>
          <Text style={styles.sectionSub}>Verified prescriptions, doctor visits & lab tests</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/timeline')}>
          <Text style={styles.viewAllLink}>View All ›</Text>
        </TouchableOpacity>
      </View>

      {recentEvents.length === 0 ? (
        <Card variant="muted" style={styles.emptyFeedCard}>
          <Text style={styles.emptyFeedEmoji}>📋</Text>
          <Text style={styles.emptyFeedTitle}>No Activity Recorded Yet</Text>
          <Text style={styles.emptyFeedText}>
            When you scan a prescription or complete a doctor consultation, verified chronological events will appear here.
          </Text>
        </Card>
      ) : (
        recentEvents.slice(0, 3).map((event) => {
          const dateInfo = formatMedicalEventDate(
            event.eventDate,
            event.datePrecision,
            event.dateIsUncertain
          );
          return (
            <TouchableOpacity
              key={event.id}
              style={styles.activityCard}
              onPress={() => router.push('/(tabs)/timeline')}
              activeOpacity={0.85}
            >
              <View style={styles.activityTopRow}>
                <View style={styles.activityBadgeRow}>
                  <Badge label={event.eventType} variant="info" />
                  <Text style={styles.activityDate}>{dateInfo.formatted}</Text>
                </View>
                <View style={styles.verifiedPill}>
                  <Text style={styles.verifiedPillText}>✓ Verified</Text>
                </View>
              </View>
              <Text style={styles.activityTitle} numberOfLines={1}>
                {event.title}
              </Text>
              <Text style={styles.activitySummary} numberOfLines={2}>
                {event.summary}
              </Text>
            </TouchableOpacity>
          );
        })
      )}
    </>
  );
}
