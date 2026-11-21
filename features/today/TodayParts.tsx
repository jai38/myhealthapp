// S06 Today parts (04b task 13), built from the v4 Glass components. Display only: every
// action is the caller's, and only an explicit tap reaches it.
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  GlassCard,
  GroupHeader,
  HeroCard,
  MarkTakenButton,
  MedicineRow,
  QuickActionTile,
} from '../../design/components/Glass';
import { Skeleton, SkeletonGroup } from '../../design/components/Feedback/Skeleton';
import { Text } from '../../design/components/Foundations/Text';
import { layout, space } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { STACK_AT_FONT_SCALE, useFontScale } from '../../design/useFontScale';
import { t } from '../../design/strings';
import type { MedicationRecord } from '../../services/medications/medication-service';
import type { TodayDose } from './todayModel';
import { formatTodayTime, medicineFormFor } from './todaySections';
import { DAY_PART_TITLE, ROWS_BEFORE_SHOW_ALL, doseDetail } from './todayView';
import type { HeroModel, TodayGroup } from './todayView';

export function TodayGreetingV4({ text }: { text: string }) {
  const { color: c } = useTheme();
  return (
    <View style={styles.greeting} testID="today-greeting">
      <Text variant="title1" style={{ color: c.text.primary }}>
        {text}
      </Text>
      <Text variant="callout" style={{ color: c.text.secondary }}>
        {t('today.subtitle')}
      </Text>
    </View>
  );
}

export function TodayHero({ model }: { model: HeroModel }) {
  return (
    <HeroCard
      testID="today-hero"
      label={t('today.heroLabel')}
      headline={t(model.headlineKey, model.headlineParams)}
      lines={model.lines.map((l) => t(l.key, l.params))}
      taken={model.taken}
      total={model.total}
    />
  );
}

// Loading: a skeleton hero and rows, announced once as "Loading".
export function TodaySkeleton() {
  return (
    <View testID="today-loading" style={styles.stack}>
      <SkeletonGroup>
        <Skeleton shape="block" height={150} />
        <Skeleton shape="block" />
        <Skeleton shape="block" />
      </SkeletonGroup>
    </View>
  );
}

export interface TodayGroupCardProps {
  group: TodayGroup;
  expanded: boolean;
  onToggle: () => void;
  medicationFor: (id: string) => MedicationRecord | null | undefined;
  /** The one dose that gets Mark as Taken under its row, or null. */
  markTakenId: string | null;
  markTakenDisabledReason: string | null;
  onMarkTaken: (doseId: string) => void;
  onOpen: (item: TodayDose) => void;
  onMore: (item: TodayDose) => void;
}

/** Morning, Afternoon or Evening: up to ROWS_BEFORE_SHOW_ALL rows, then "Show all". */
export function TodayGroupCard({
  group,
  expanded,
  onToggle,
  medicationFor,
  markTakenId,
  markTakenDisabledReason,
  onMarkTaken,
  onOpen,
  onMore,
}: TodayGroupCardProps) {
  const { color: c } = useTheme();
  const shown = expanded ? group.items : group.items.slice(0, ROWS_BEFORE_SHOW_ALL);
  const hidden = group.items.length - shown.length;
  return (
    <View style={styles.group} testID={`today-group-${group.part}`}>
      <GroupHeader
        title={t(DAY_PART_TITLE[group.part])}
        count={group.total === 1 ? t('today.groupCountOne') : t('today.groupCount', { count: String(group.total) })}
      />
      <GlassCard padding={space.md}>
        {shown.map((item) => {
          const med = medicationFor(item.dose.medicationId);
          const name = med?.nameAsWritten || t('today.unknownMedicine');
          const id = `today-row-${item.dose.id}`;
          return (
            <View key={item.dose.id}>
              <MedicineRow
                testID={id}
                name={name}
                detail={doseDetail({
                  strength: med?.strength,
                  form: med?.dosageForm,
                  time: formatTodayTime(new Date(item.scheduledMs)),
                })}
                form={medicineFormFor(med?.dosageForm)}
                state={item.state}
                formatTime={formatTodayTime}
                onPress={() => onOpen(item)}
                onMore={() => onMore(item)}
              />
              {item.dose.id === markTakenId ? (
                <View style={styles.markTaken}>
                  <MarkTakenButton
                    testID="today-mark-taken"
                    onPress={() => onMarkTaken(item.dose.id)}
                    disabled={markTakenDisabledReason !== null}
                    disabledReason={markTakenDisabledReason ?? undefined}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
        {hidden > 0 || expanded ? (
          group.items.length > ROWS_BEFORE_SHOW_ALL ? (
            <Pressable
              testID={`today-group-${group.part}-toggle`}
              accessibilityRole="button"
              accessibilityLabel={expanded ? t('today.showFewer') : t('today.showAll')}
              onPress={onToggle}
              style={styles.toggle}
            >
              <Text variant="bodyStrong" style={{ color: c.text.link }}>
                {expanded ? t('today.showFewer') : t('today.showAll')}
              </Text>
            </Pressable>
          ) : null
        ) : null}
      </GlassCard>
    </View>
  );
}

export function TodayQuickActionsV4({
  onUpload,
  onAdd,
  disabled,
}: {
  onUpload: () => void;
  onAdd: () => void;
  disabled: boolean;
}) {
  // At large text, one tile per row so each label keeps one line.
  const stacked = useFontScale() > STACK_AT_FONT_SCALE;
  return (
    <View style={styles.group} testID="today-quick-actions">
      <GroupHeader title={t('today.quickActions')} />
      <View style={[styles.tiles, stacked && styles.tilesStacked]}>
        <QuickActionTile
          testID="today-quick-upload"
          label={t('today.uploadRecord')}
          icon="cloud-upload-outline"
          onPress={onUpload}
          disabled={disabled}
        />
        <QuickActionTile
          testID="today-quick-add"
          label={t('today.addMedication')}
          icon="add-circle-outline"
          onPress={onAdd}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: { gap: space.xs, paddingTop: space.sm },
  stack: { gap: space.md },
  group: { gap: space.md },
  markTaken: { paddingVertical: space.sm },
  toggle: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  tiles: { flexDirection: 'row', gap: layout.tileGap },
  tilesStacked: { flexDirection: 'column' },
});
