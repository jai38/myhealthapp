import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../../components/Foundations/Text';
import {
  AppHeader,
  DoseChip,
  GlassCard,
  GroupHeader,
  HeroCard,
  MarkTakenButton,
  MedicineRow,
  NoticeSlot,
  PrimaryButton,
  QuickActionTile,
  RadioOptionRow,
  TimeWheel,
} from '../../components/Glass';
import { BottomSheet } from '../../components/Containers/BottomSheet';
import { SegmentedControl } from '../../components/Containers/SegmentedControl';
import { UndoToast } from '../../components/Actions/UndoToast';
import { Button } from '../../components/Actions/Button';
import type { DoseDisplayState } from '../../status';
import { layout, radius, space, themes } from '../../tokens';
import type { ThemeName } from '../../tokens';
import { ThemeProvider, useTheme } from '../../theme';
import { GallerySection, GalleryItem } from '../GallerySection';

// Calm Glass UI v4 parts (04b task 11), each in every state, on a light and a dark board.
// Synthetic data only: "Testmed" medicines.

const fmt = (d: Date) =>
  `${((d.getHours() + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
const at = (h: number, m: number) => new Date(2026, 10, 6, h, m);
const NOW = at(10, 30);

export const GALLERY_DOSE_STATES: { name: string; state: DoseDisplayState }[] = [
  { name: 'taken', state: { kind: 'taken', takenAt: at(8, 12) } },
  { name: 'dueNow', state: { kind: 'dueNow' } },
  { name: 'upcoming', state: { kind: 'upcoming', scheduledAt: at(13, 0) } },
  { name: 'notConfirmed', state: { kind: 'notConfirmed', scheduledAt: at(8, 0) } },
  { name: 'missedByUser', state: { kind: 'missedByUser' } },
];

function Label({ children }: { children: string }) {
  const { color: c } = useTheme();
  return (
    <Text variant="overline" style={{ color: c.text.secondary }}>
      {children}
    </Text>
  );
}

function Board() {
  const { name, color: c } = useTheme();
  const [segment, setSegment] = useState<'a' | 'b'>('a');
  const [radio, setRadio] = useState<'yes' | 'no'>('yes');
  const [time, setTime] = useState(at(9, 15));
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState(false);
  const id = (part: string) => `glass-${name}-${part}`;
  return (
    <View
      testID={`glass-${name}`}
      style={{ backgroundColor: c.bg.screen, borderRadius: radius.card, padding: layout.screenMargin, gap: space.lg }}
    >
      <Text variant="title3" style={{ color: c.text.primary }}>
        {name === 'light' ? 'Light' : 'Dark'}
      </Text>

      <Label>Header</Label>
      <AppHeader testID={id('header')} />

      <Label>Glass card</Label>
      <GlassCard testID={id('card')}>
        <Text style={{ color: c.text.primary }}>One heading line, two lines of detail at most.</Text>
      </GlassCard>

      <Label>Hero card with ring</Label>
      <HeroCard
        testID={id('hero')}
        label="Today's medications"
        headline="2 of 5 taken"
        lines={['Next: Testmed C 10 mg · 1:00 PM', '1 needs confirming']}
        taken={2}
        total={5}
      />
      <HeroCard testID={id('hero-done')} label="Today's medications" headline="All done for today ✓" taken={3} total={3} />

      <Label>Section header with count</Label>
      <GroupHeader testID={id('group')} title="Morning" count="1 of 3" />

      <Label>Status chips</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {GALLERY_DOSE_STATES.map((s) => (
          <DoseChip key={s.name} state={s.state} formatTime={fmt} testID={id(`chip-${s.name}`)} />
        ))}
      </View>

      <Label>Medicine rows</Label>
      <GlassCard>
        <MedicineRow testID={id('row-taken')} name="Testmed D 5 mg" detail="5 mg · Tablet · 8:00 AM" state={GALLERY_DOSE_STATES[0]!.state} formatTime={fmt} onPress={() => {}} onMore={() => {}} />
        <MedicineRow testID={id('row-due')} name="Testmed B 20 mg" detail="20 mg · Tablet · 10:00 AM" state={{ kind: 'dueNow' }} formatTime={fmt} onPress={() => {}} onMore={() => {}} />
        <MarkTakenButton testID={id('mark-taken')} onPress={() => setToast(true)} />
        <MedicineRow testID={id('row-nc')} name="Testmed A 500 mg" detail="500 mg · Tablet · 8:00 AM" state={GALLERY_DOSE_STATES[3]!.state} formatTime={fmt} hint="Tap to update" onPress={() => {}} onMore={() => {}} />
        <MedicineRow testID={id('row-supplement')} name="Testmed E 40 mg" detail="40 mg · Capsule · 1:00 PM" form="capsule" supplement state={GALLERY_DOSE_STATES[2]!.state} formatTime={fmt} onPress={() => {}} />
      </GlassCard>

      <Label>Mark as Taken, offline</Label>
      <MarkTakenButton testID={id('mark-taken-off')} onPress={() => {}} disabled disabledReason="You are offline. Marking a dose needs a connection." />
      <PrimaryButton label="Save" onPress={() => {}} testID={id('primary')} />

      <Label>Quick Action tiles</Label>
      <View style={{ flexDirection: 'row', gap: layout.tileGap }}>
        <QuickActionTile testID={id('tile-upload')} label="Upload Record" icon="cloud-upload-outline" onPress={() => {}} />
        <QuickActionTile testID={id('tile-add')} label="Add Medication" icon="add-circle-outline" tone="teal" onPress={() => {}} />
      </View>

      <Label>Radio option rows</Label>
      <RadioOptionRow testID={id('radio-yes')} label="Yes, I took it" selected={radio === 'yes'} onPress={() => setRadio('yes')} />
      <RadioOptionRow testID={id('radio-no')} label="No, I skipped it" detail="Add a reason if you like" selected={radio === 'no'} onPress={() => setRadio('no')} />

      <Label>Segmented control</Label>
      <SegmentedControl
        testID={id('segmented')}
        options={[
          { value: 'a', label: 'As scheduled' },
          { value: 'b', label: 'Other time' },
        ]}
        value={segment}
        onChange={setSegment}
      />

      <Label>Time wheel (nothing after 10:30)</Label>
      <TimeWheel testID={id('wheel')} value={time} onChange={setTime} max={NOW} />

      <Label>Single notice slot</Label>
      <NoticeSlot
        testID={id('notice')}
        notices={[
          { id: 'u', kind: 'uploading', message: 'Reading your prescription…' },
          { id: 's', kind: 'saved', message: 'Medicine added.' },
        ]}
      />
      <NoticeSlot
        testID={id('notice-error')}
        notices={[{ id: 'e', kind: 'error', message: 'Could not load today. Check your connection.' }]}
        action={{ label: 'Retry', onPress: () => {}, forKind: 'error' }}
      />

      <Label>Bottom sheet and toast</Label>
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        <Button label="Open sheet" variant="secondary" onPress={() => setSheet(true)} testID={id('open-sheet')} />
        <Button label="Show toast" variant="secondary" onPress={() => setToast(true)} testID={id('show-toast')} />
      </View>
      <BottomSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title="Update dose"
        confirm={{ label: 'Save', onPress: () => setSheet(false), disabled: radio !== 'yes' }}
        testID={id('sheet')}
      >
        <RadioOptionRow label="Yes, I took it" selected={radio === 'yes'} onPress={() => setRadio('yes')} />
      </BottomSheet>
      <UndoToast
        visible={toast}
        message="Testmed B 20 mg marked as taken at 10:30 AM"
        onUndo={() => setToast(false)}
        onDismiss={() => setToast(false)}
        testID={id('toast')}
      />
    </View>
  );
}

export function GlassSection() {
  return (
    <GallerySection title="Calm Glass parts (v4)" testID="gallery-glass">
      <GalleryItem label="Every part in light and dark">
        <View style={{ gap: space.lg }}>
          {(Object.keys(themes) as ThemeName[]).map((scheme) => (
            <ThemeProvider key={scheme} scheme={scheme}>
              <Board />
            </ThemeProvider>
          ))}
        </View>
      </GalleryItem>
    </GallerySection>
  );
}
