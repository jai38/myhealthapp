import React, { useState } from 'react';
import { View } from 'react-native';
import { GalleryItem, GallerySection } from '../GallerySection';
import {
  Accordion,
  BottomSheet,
  Card,
  Dialog,
  IconTile,
  ListGroup,
  ListRow,
  SectionHeader,
  SegmentedControl,
  Stepper,
} from '../../components/Containers';
import { Button } from '../../components/Actions';
import { Text } from '../../components/Foundations';
import { StatusPill } from '../../components/Trust';
import { doseStatusDisplay } from '../../status';
import { space } from '../../tokens';

// Synthetic sample data only. Times are read in UTC so the gallery looks the same on every device.
const DOSE_TIME = new Date(Date.UTC(2026, 10, 5, 8, 0));
const LATER_DOSE_TIME = new Date(Date.UTC(2026, 10, 5, 13, 0));

function formatClock(d: Date): string {
  const hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const suffix = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

type Period = 'day' | 'week' | 'month';

const PERIOD_OPTIONS = [
  { value: 'day' as const, label: 'Day' },
  { value: 'week' as const, label: 'Week' },
  { value: 'month' as const, label: 'Month' },
];

// One filled glyph per tile tone, for the seven-tone example.
const TILE_SAMPLES = [
  { tone: 'blue', icon: 'medkit' },
  { tone: 'teal', icon: 'water' },
  { tone: 'red', icon: 'heart' },
  { tone: 'orange', icon: 'flask' },
  { tone: 'purple', icon: 'pulse' },
  { tone: 'green', icon: 'shield-checkmark' },
  { tone: 'neutral', icon: 'person' },
] as const;

export function ContainersSection() {
  const [period, setPeriod] = useState<Period>('day');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [normalDialogOpen, setNormalDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <GallerySection title="Containers" testID="gallery-containers">
      <GalleryItem label="Card: plain">
        <Card>
          <Text variant="body">Plain card. Used for grouped content.</Text>
        </Card>
      </GalleryItem>

      <GalleryItem label="Card: hero">
        <Card variant="hero">
          <View style={{ gap: space.sm }}>
            <Text variant="overline" tone="secondary">
              Next dose for Asha Rao
            </Text>
            <Text variant="title3">Paracetamol 500 mg</Text>
            <Text variant="callout" tone="secondary">
              {formatClock(DOSE_TIME)}
            </Text>
            <StatusPill display={doseStatusDisplay({ kind: 'dueNow' }, formatClock)} />
          </View>
        </Card>
      </GalleryItem>

      <GalleryItem label="Card: pressable">
        <Card
          onPress={() => undefined}
          accessibilityLabel="Open Metformin 500 mg details"
        >
          <Text variant="body">Tap anywhere on this card.</Text>
        </Card>
      </GalleryItem>

      <GalleryItem label="SectionHeader: with View All">
        <SectionHeader title="Today" onViewAll={() => undefined} />
      </GalleryItem>

      <GalleryItem label="SectionHeader: without View All">
        <SectionHeader title="Recent records" />
      </GalleryItem>

      <GalleryItem label="ListRow: plain">
        <ListRow title="Paracetamol 500 mg" />
      </GalleryItem>

      <GalleryItem label="ListRow: with subtitle">
        <ListRow title="Metformin 500 mg" subtitle="Twice a day, after meals" />
      </GalleryItem>

      <GalleryItem label="ListRow: leading IconTile and trailing StatusPill">
        <ListRow
          title="Paracetamol 500 mg"
          subtitle={formatClock(DOSE_TIME)}
          leading={<IconTile icon="medkit" tone="blue" />}
          trailing={
            <StatusPill
              display={doseStatusDisplay({ kind: 'upcoming', scheduledAt: LATER_DOSE_TIME }, formatClock)}
            />
          }
        />
      </GalleryItem>

      <GalleryItem label="ListRow: pressable">
        <ListRow
          title="Asha Rao's records"
          subtitle="3 documents"
          leading={<IconTile icon="document-text" tone="teal" />}
          onPress={() => undefined}
        />
      </GalleryItem>

      <GalleryItem label="ListGroup: Today's medicines">
        <ListGroup header="Today's medicines" footer="Synthetic sample data.">
          <ListRow
            title="Paracetamol 500 mg"
            subtitle={formatClock(DOSE_TIME)}
            leading={<IconTile icon="medkit" tone="blue" />}
            trailing={
              <StatusPill display={doseStatusDisplay({ kind: 'dueNow' }, formatClock)} />
            }
          />
          <ListRow
            title="Metformin 500 mg"
            subtitle={formatClock(LATER_DOSE_TIME)}
            leading={<IconTile icon="water" tone="teal" />}
            trailing={
              <StatusPill
                display={doseStatusDisplay({ kind: 'upcoming', scheduledAt: LATER_DOSE_TIME }, formatClock)}
              />
            }
          />
          <ListRow
            title="Atorvastatin 10 mg"
            subtitle={formatClock(DOSE_TIME)}
            leading={<IconTile icon="heart" tone="red" />}
            trailing={
              <StatusPill display={doseStatusDisplay({ kind: 'taken', takenAt: DOSE_TIME }, formatClock)} />
            }
          />
        </ListGroup>
      </GalleryItem>

      <GalleryItem label="ListGroup: Settings-style">
        <ListGroup header="Settings">
          <ListRow
            title="Reminders"
            leading={<IconTile icon="notifications" tone="red" />}
            onPress={() => undefined}
          />
          <ListRow
            title="Profile"
            subtitle="Asha Rao"
            leading={<IconTile icon="person" tone="blue" />}
            onPress={() => undefined}
          />
          <ListRow
            title="Privacy and security"
            leading={<IconTile icon="shield-checkmark" tone="green" />}
            onPress={() => undefined}
          />
        </ListGroup>
      </GalleryItem>

      <GalleryItem label="IconTile: all seven tones, md">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {TILE_SAMPLES.map(({ tone, icon }) => (
            <IconTile key={tone} icon={icon} tone={tone} size="md" />
          ))}
        </View>
      </GalleryItem>

      <GalleryItem label="IconTile: all seven tones, lg">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {TILE_SAMPLES.map(({ tone, icon }) => (
            <IconTile key={tone} icon={icon} tone={tone} size="lg" />
          ))}
        </View>
      </GalleryItem>

      <GalleryItem label="Accordion: closed">
        <Accordion title="Dosage notes">
          <Text variant="body">Take with a glass of water.</Text>
        </Accordion>
      </GalleryItem>

      <GalleryItem label="Accordion: initially open">
        <Accordion title="Prescriber details" initiallyOpen>
          <Text variant="body">Dr. Sample (synthetic example only).</Text>
        </Accordion>
      </GalleryItem>

      <GalleryItem label="SegmentedControl: interactive">
        <View style={{ gap: space.sm }}>
          <SegmentedControl<Period>
            options={PERIOD_OPTIONS}
            value={period}
            onChange={setPeriod}
          />
          <Text variant="caption" tone="secondary">
            Showing: {period}
          </Text>
        </View>
      </GalleryItem>

      <GalleryItem label="BottomSheet">
        <View style={{ gap: space.sm }}>
          <Button label="Open medicines sheet" onPress={() => setSheetOpen(true)} />
          <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Medicines today">
            <ListRow title="Paracetamol 500 mg" subtitle="8:00 AM" onPress={() => undefined} />
            <ListRow title="Metformin 500 mg" subtitle="1:00 PM" onPress={() => undefined} />
            <ListRow title="Vitamin D3 1000 IU" subtitle="Not yet scheduled" />
          </BottomSheet>
        </View>
      </GalleryItem>

      <GalleryItem label="Dialog: normal">
        <View style={{ gap: space.sm }}>
          <Button label="Open normal dialog" onPress={() => setNormalDialogOpen(true)} variant="secondary" />
          <Dialog
            visible={normalDialogOpen}
            title="Leave without saving?"
            body="Your changes to Metformin 500 mg will be lost."
            primaryLabel="Leave"
            onPrimary={() => setNormalDialogOpen(false)}
            secondaryLabel="Stay"
            onClose={() => setNormalDialogOpen(false)}
          />
        </View>
      </GalleryItem>

      <GalleryItem label="Dialog: destructive">
        <View style={{ gap: space.sm }}>
          <Button label="Open delete dialog" onPress={() => setDeleteDialogOpen(true)} variant="danger" />
          <Dialog
            visible={deleteDialogOpen}
            title="Delete document?"
            body="This removes the document from Asha Rao's records."
            primaryLabel="Delete"
            onPrimary={() => setDeleteDialogOpen(false)}
            secondaryLabel="Cancel"
            destructive
            onClose={() => setDeleteDialogOpen(false)}
          />
        </View>
      </GalleryItem>

      <GalleryItem label="Stepper: current 0">
        <Stepper steps={['Scan', 'Check', 'Confirm', 'Save']} current={0} />
      </GalleryItem>

      <GalleryItem label="Stepper: current 2">
        <Stepper steps={['Scan', 'Check', 'Confirm', 'Save']} current={2} />
      </GalleryItem>

      <GalleryItem label="Stepper: current 3">
        <Stepper steps={['Scan', 'Check', 'Confirm', 'Save']} current={3} />
      </GalleryItem>
    </GallerySection>
  );
}
