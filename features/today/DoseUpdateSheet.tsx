// S07 Dose update sheet (04b task 14; designes/design/screens.md). The patient says what
// happened to one dose: taken (as scheduled, just now or another time, never the future),
// skipped (with an optional reason) or missed. Nothing is recorded until Save, and Missed only
// ever comes from "No, I missed it". It updates the log only, never the schedule or reminders.
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheet } from '../../design/components/Containers/BottomSheet';
import { ChipGroup } from '../../design/components/Inputs/ChipGroup';
import { GlassCard, RadioOptionRow, TimeWheel } from '../../design/components/Glass';
import { Text } from '../../design/components/Foundations/Text';
import { space } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { t } from '../../design/strings';
import type { DoseLog, MedicationRecord, SkipReason } from '../../services/medications/medication-service';
import { formatTodayTime } from './todaySections';
import {
  EMPTY_DRAFT,
  SKIP_REASONS,
  buildDoseUpdate,
  canSave,
  latestTakenTime,
} from './doseUpdate';
import type { DoseChoice, DoseUpdateDraft, DoseUpdateRequest, TakenWhen } from './doseUpdate';

export interface DoseUpdateSheetProps {
  /** The dose to update, or null when the sheet is closed. Only canOpenDoseUpdate doses. */
  dose: DoseLog | null;
  medication: MedicationRecord | null;
  nowMs: number;
  offline: boolean;
  onClose: () => void;
  /** Saves the update. Throws when it was not saved; the sheet then offers Retry. */
  onSave: (dose: DoseLog, request: DoseUpdateRequest) => Promise<void>;
  /** An answer already chosen when the sheet opens (the dev preview's S07 states). */
  initialDraft?: Partial<DoseUpdateDraft>;
}

const hour12 = (h: number) => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`;

function Overline({ children }: { children: string }) {
  const { color: c } = useTheme();
  return (
    <Text variant="overline" style={{ color: c.text.secondary }}>
      {children}
    </Text>
  );
}

export function DoseUpdateSheet({
  dose,
  medication,
  nowMs,
  offline,
  onClose,
  onSave,
  initialDraft,
}: DoseUpdateSheetProps) {
  const { color: c } = useTheme();
  const [draft, setDraft] = useState<DoseUpdateDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  // A new dose starts from an empty answer.
  useEffect(() => {
    setDraft({ ...EMPTY_DRAFT, ...(initialDraft ?? {}) });
    setSaving(false);
    setFailed(false);
    // Only a new dose resets the answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dose?.id]);

  if (!dose) return <BottomSheet visible={false} onClose={onClose}>{null}</BottomSheet>;

  const scheduledMs = new Date(dose.scheduledTime).getTime();
  const max = latestTakenTime(scheduledMs, nowMs);
  const name = medication?.nameAsWritten || t('today.unknownMedicine');
  const time = formatTodayTime(new Date(scheduledMs));
  const strength = (medication?.strength ?? '').trim();

  const choose = (choice: DoseChoice) => {
    setFailed(false);
    setDraft((d) => ({ ...d, choice }));
  };
  const setWhen = (when: TakenWhen) => {
    setFailed(false);
    setDraft((d) => ({
      ...d,
      when,
      // "Other time" starts at the scheduled time, never later than now.
      otherTime: when === 'other' ? (d.otherTime ?? new Date(Math.min(scheduledMs, max.getTime()))) : d.otherTime,
    }));
  };

  const ready = canSave(draft) && !saving && !offline;
  const save = async () => {
    const request = buildDoseUpdate(draft, dose.scheduledTime, nowMs);
    if (!request || offline) return;
    setSaving(true);
    setFailed(false);
    try {
      await onSave(dose, request);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet
      visible
      onClose={onClose}
      title={t('doseUpdate.title')}
      confirm={{
        label: saving ? t('doseUpdate.saving') : failed ? t('common.retry') : t('doseUpdate.save'),
        onPress: () => void save(),
        disabled: !ready,
      }}
      testID="dose-update"
    >
      <View style={styles.body}>
        <GlassCard testID="dose-update-medicine">
          <Text variant="title3" style={{ color: c.text.primary }}>
            {name}
          </Text>
          <Text variant="callout" tabular style={{ color: c.text.secondary }}>
            {strength
              ? t('doseUpdate.scheduled', { dose: strength, time })
              : t('doseUpdate.scheduledNoDose', { time })}
          </Text>
        </GlassCard>

        <Text variant="title3" style={{ color: c.text.primary }}>
          {t('doseUpdate.question')}
        </Text>
        <View style={styles.options} accessibilityRole="radiogroup">
          <RadioOptionRow
            testID="dose-update-took"
            label={t('doseUpdate.took')}
            selected={draft.choice === 'took'}
            onPress={() => choose('took')}
          />
          <RadioOptionRow
            testID="dose-update-skipped"
            label={t('doseUpdate.skipped')}
            detail={t('doseUpdate.skippedDetail')}
            selected={draft.choice === 'skipped'}
            onPress={() => choose('skipped')}
          />
          <RadioOptionRow
            testID="dose-update-missed"
            label={t('doseUpdate.missed')}
            detail={t('doseUpdate.missedDetail')}
            selected={draft.choice === 'missed'}
            onPress={() => choose('missed')}
          />
        </View>

        {draft.choice === 'took' ? (
          <View style={styles.section}>
            <Overline>{t('doseUpdate.whenTitle')}</Overline>
            {/* Chips, not a three-part segmented control: each label keeps one line at any text size. */}
            <ChipGroup
              testID="dose-update-when"
              options={[
                { value: 'scheduled', label: t('doseUpdate.asScheduled') },
                { value: 'now', label: t('doseUpdate.justNow') },
                { value: 'other', label: t('doseUpdate.otherTime') },
              ]}
              selected={[draft.when]}
              onChange={(next) => {
                if (next[0]) setWhen(next[0] as TakenWhen);
              }}
            />
            {draft.when === 'other' && draft.otherTime ? (
              <View style={styles.section}>
                <Overline>{t('doseUpdate.pickTime')}</Overline>
                <TimeWheel
                  testID="dose-update-wheel"
                  value={draft.otherTime}
                  max={max}
                  formatHour={hour12}
                  onChange={(next) => setDraft((d) => ({ ...d, otherTime: next }))}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {draft.choice === 'skipped' ? (
          <View style={styles.section}>
            <Overline>{t('doseUpdate.reasonTitle')}</Overline>
            <ChipGroup
              testID="dose-update-reason"
              options={SKIP_REASONS.map((r) => ({ value: r.value, label: t(r.labelKey) }))}
              selected={draft.reason ? [draft.reason] : []}
              allowNone
              onChange={(next) => setDraft((d) => ({ ...d, reason: (next[0] as SkipReason | undefined) ?? null }))}
            />
          </View>
        ) : null}

        {failed ? (
          <Text variant="callout" style={{ color: c.text.error }} testID="dose-update-failed" accessibilityRole="alert">
            {t('doseUpdate.failed')}
          </Text>
        ) : null}
        {offline ? (
          <Text variant="callout" style={{ color: c.text.secondary }} testID="dose-update-offline">
            {t('doseUpdate.offline')}
          </Text>
        ) : null}

        <Text variant="caption" style={{ color: c.text.tertiary }} testID="dose-update-footnote">
          {t('doseUpdate.footnote')}
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg, paddingVertical: space.md },
  options: { gap: space.sm },
  section: { gap: space.sm },
});
