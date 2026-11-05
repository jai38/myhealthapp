import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../design/components/Containers/Card';
import { Divider } from '../../design/components/Foundations/Divider';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { SourceLabel } from '../../design/components/Trust/SourceLabel';
import { UncertainMarker } from '../../design/components/Trust/UncertainMarker';
import { VerificationLabel } from '../../design/components/Trust/VerificationLabel';
import { color, radius, space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { TimelineEvent } from '../../services/timeline/timeline-service';

export interface TimelineEventRowProps {
  item: TimelineEvent;
  dateFormatted: string;
  // Set on the first entry of each period (for example "March 2026").
  periodLabel: string | null;
  onOpen: (id: string) => void;
}

export function TimelineEventRow({ item, dateFormatted, periodLabel, onOpen }: TimelineEventRowProps) {
  const hasSource = Boolean(item.sourceDocumentId || item.sourcePrescriptionId);

  return (
    <View style={styles.wrapper}>
      {periodLabel !== null ? (
        <View style={styles.periodHeader}>
          <View style={styles.periodDot} />
          <Text variant="title3" tone="primary" style={styles.periodText}>
            {periodLabel}
          </Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.track}>
          <View style={styles.node} />
          <View style={styles.line} />
        </View>

        <View style={styles.cardSlot}>
          <Card
            onPress={() => onOpen(item.id)}
            accessibilityLabel={t('records.timeline.cardLabel', { title: item.title, date: dateFormatted })}
          >
            <View style={styles.topRow}>
              <View style={styles.typePill}>
                <Text variant="caption" tone="link">
                  {item.eventType}
                </Text>
              </View>
              <Text variant="caption" tone="secondary" style={styles.dateText}>
                {dateFormatted}
              </Text>
            </View>
            {item.dateIsUncertain ? (
              <View style={styles.uncertain}>
                <UncertainMarker inline />
              </View>
            ) : null}

            <Text variant="title3" tone="primary" numberOfLines={2} style={styles.title}>
              {item.title}
            </Text>
            <Text variant="callout" tone="secondary" numberOfLines={2} style={styles.summary}>
              {item.summary}
            </Text>

            <Divider />
            <View style={styles.footer}>
              <View style={styles.labels}>
                <VerificationLabel verified={item.isVerified} />
                {hasSource ? <SourceLabel kind="fromDocument" /> : null}
              </View>
              <View style={styles.viewDetails}>
                <Text variant="caption" tone="link">
                  {t('records.timeline.viewDetails')}
                </Text>
                <Icon name="chevron-forward" size="sm" tone="link" />
              </View>
            </View>
          </Card>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: space.xs,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.md,
    marginBottom: space.sm,
    gap: space.sm,
  },
  periodDot: {
    width: space.sm,
    height: space.sm,
    borderRadius: space.xs,
    backgroundColor: color.action.primary,
  },
  periodText: {
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
  },
  track: {
    width: space.xl - space.xxs,
    alignItems: 'center',
    marginRight: space.xs,
  },
  node: {
    width: space.md,
    height: space.md,
    borderRadius: space.sm,
    backgroundColor: color.action.primary,
    borderWidth: 2,
    borderColor: color.bg.screen,
    marginTop: space.lg + space.xxs,
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    top: space.xl,
    bottom: -space.md,
    width: 2,
    backgroundColor: color.border.subtle,
  },
  cardSlot: {
    flex: 1,
    marginBottom: space.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  typePill: {
    backgroundColor: color.tone.info.bg,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
    borderRadius: radius.full,
  },
  dateText: {
    flexShrink: 1,
    textAlign: 'right',
  },
  uncertain: {
    marginTop: space.sm,
  },
  title: {
    marginTop: space.sm,
  },
  summary: {
    marginTop: space.xxs,
    marginBottom: space.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingTop: space.sm,
  },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    flexShrink: 1,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
  },
});
