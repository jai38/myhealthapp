import React from 'react';
import { View } from 'react-native';
import { GalleryItem, GallerySection } from '../GallerySection';
import {
  Disclaimer,
  FreshnessStamp,
  RevisionLink,
  SourceLabel,
  StatusPill,
  UncertainMarker,
  VerificationLabel,
} from '../../components/Trust';
import { Text } from '../../components/Foundations';
import { doseStatusDisplay } from '../../status';
import type { DoseDisplayState } from '../../status';
import { space } from '../../tokens';

// Synthetic sample data only. Fixed UTC dates keep the gallery deterministic.
const SCHEDULED_AT = new Date(Date.UTC(2026, 10, 5, 8, 0));
const TAKEN_AT = new Date(Date.UTC(2026, 10, 5, 8, 5));
const REMIND_AT = new Date(Date.UTC(2026, 10, 5, 8, 30));

const NOW = new Date(Date.UTC(2026, 10, 5));
const FRESH_AS_OF = new Date(Date.UTC(2026, 9, 26)); // 10 days before NOW
const STALE_AS_OF = new Date(Date.UTC(2026, 3, 19)); // 200 days before NOW

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatClock(d: Date): string {
  const hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const suffix = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

function formatDay(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const DOSE_STATES: { kind: DoseDisplayState['kind']; state: DoseDisplayState }[] = [
  { kind: 'upcoming', state: { kind: 'upcoming', scheduledAt: SCHEDULED_AT } },
  { kind: 'dueNow', state: { kind: 'dueNow' } },
  { kind: 'snoozed', state: { kind: 'snoozed', remindAt: REMIND_AT } },
  { kind: 'taken', state: { kind: 'taken', takenAt: TAKEN_AT } },
  { kind: 'skipped', state: { kind: 'skipped' } },
  { kind: 'missedByUser', state: { kind: 'missedByUser' } },
  { kind: 'notConfirmed', state: { kind: 'notConfirmed', scheduledAt: SCHEDULED_AT } },
  { kind: 'pausedOrStopped', state: { kind: 'pausedOrStopped' } },
];

export function TrustSection() {
  return (
    <GallerySection title="Trust" testID="gallery-trust">
      {DOSE_STATES.map(({ kind, state }) => (
        <GalleryItem key={kind} label={`StatusPill: ${kind}`}>
          {kind === 'pausedOrStopped' ? (
            <View style={{ gap: space.xs }}>
              <StatusPill display={doseStatusDisplay(state, formatClock)} />
              <Text variant="caption" tone="secondary">
                (no pill: paused or stopped)
              </Text>
            </View>
          ) : (
            <StatusPill display={doseStatusDisplay(state, formatClock)} />
          )}
        </GalleryItem>
      ))}

      <GalleryItem label="SourceLabel: fromDocument">
        <SourceLabel kind="fromDocument" />
      </GalleryItem>

      <GalleryItem label="SourceLabel: addedByYou">
        <SourceLabel kind="addedByYou" />
      </GalleryItem>

      <GalleryItem label="SourceLabel: fromDoctor">
        <SourceLabel kind="fromDoctor" />
      </GalleryItem>

      <GalleryItem label="VerificationLabel: verified">
        <VerificationLabel verified />
      </GalleryItem>

      <GalleryItem label="VerificationLabel: draft">
        <VerificationLabel verified={false} />
      </GalleryItem>

      <GalleryItem label="UncertainMarker: inline">
        <UncertainMarker inline />
      </GalleryItem>

      <GalleryItem label="UncertainMarker: with hint">
        <UncertainMarker />
      </GalleryItem>

      <GalleryItem label="RevisionLink: no count">
        <RevisionLink onPress={() => undefined} />
      </GalleryItem>

      <GalleryItem label="RevisionLink: count 3">
        <RevisionLink onPress={() => undefined} count={3} />
      </GalleryItem>

      <GalleryItem label="Disclaimer: default">
        <Disclaimer />
      </GalleryItem>

      <GalleryItem label="FreshnessStamp: fresh (10 days old)">
        <FreshnessStamp asOf={FRESH_AS_OF} now={NOW} formatDate={formatDay} />
      </GalleryItem>

      <GalleryItem label="FreshnessStamp: stale (200 days old)">
        <FreshnessStamp asOf={STALE_AS_OF} now={NOW} formatDate={formatDay} />
      </GalleryItem>
    </GallerySection>
  );
}
