import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../design/components/Containers/Card';
import { Icon } from '../../../design/components/Foundations/Icon';
import { Text } from '../../../design/components/Foundations/Text';
import { Switch } from '../../../design/components/Inputs/Switch';
import { TextField } from '../../../design/components/Inputs/TextField';
import { StatusPill } from '../../../design/components/Trust/StatusPill';
import { UncertainMarker } from '../../../design/components/Trust/UncertainMarker';
import { t } from '../../../design/strings';
import { color, radius, space } from '../../../design/tokens';
import { TextAction } from './TextAction';
import { MedicineSchedule } from './MedicineSchedule';
import { isAsNeededFrequency } from './reviewLogic';
import {
  ACTIVE_AS_NEEDED_PILL,
  ACTIVE_REGIMEN_PILL,
  HISTORICAL_PILL,
  INCOMPLETE_PILL,
} from './reviewDisplay';
import type { EditableMedicine } from './reviewTypes';

export interface MedicineCardProps {
  med: EditableMedicine;
  index: number;
  onUpdate: (updates: Partial<EditableMedicine>) => void;
  onRemove: () => void;
}

// One medicine draft. Every field writes through onUpdate; nothing is saved here.
export function MedicineCard({ med, index, onUpdate, onRemove }: MedicineCardProps) {
  const isAsNeeded = isAsNeededFrequency(med.frequency_text);

  const isMissingRequired =
    med.is_active_medication &&
    (!med.name_as_written.trim() ||
      !med.duration_text?.trim() ||
      (!isAsNeeded && (!med.reminder_times || med.reminder_times.length === 0)));

  const statusPill = med.is_active_medication
    ? isMissingRequired
      ? INCOMPLETE_PILL
      : isAsNeeded
      ? ACTIVE_AS_NEEDED_PILL
      : ACTIVE_REGIMEN_PILL
    : HISTORICAL_PILL;

  const toggleActive = () => {
    const nextActive = !med.is_active_medication;
    const defaultTimes =
      nextActive && (!med.reminder_times || med.reminder_times.length === 0)
        ? ['08:00']
        : med.reminder_times;
    onUpdate({
      is_active_medication: nextActive,
      reminder_times: defaultTimes,
      duration_text: nextActive && !med.duration_text ? '7 Days' : med.duration_text,
    });
  };

  return (
    <Card style={[styles.card, isMissingRequired && styles.warningBorder]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="caption" tone="secondary">
            {`#${index + 1}`}
          </Text>
          <Text variant="bodyStrong" numberOfLines={2} style={styles.flex}>
            {med.name_as_written || t('prescriptions.review.newMedicine')}
          </Text>
        </View>
        <StatusPill display={statusPill} />
      </View>

      {med.confidence === 'UNCERTAIN' ? <UncertainMarker /> : null}

      {isMissingRequired && (
        <View style={styles.warningBox}>
          <Icon name="warning-outline" tone="caution" />
          <View style={styles.flex}>
            <Text variant="bodyStrong" style={styles.warningTitle}>
              {t('prescriptions.review.actionRequired')}
            </Text>
            <Text variant="caption" style={styles.warningText}>
              {isAsNeeded
                ? t('prescriptions.review.actionAsNeeded')
                : t('prescriptions.review.actionScheduled')}
            </Text>
          </View>
        </View>
      )}

      <TextField
        label={t('prescriptions.review.nameLabel')}
        value={med.name_as_written}
        onChangeText={(val) => onUpdate({ name_as_written: val })}
        placeholder={t('prescriptions.review.namePlaceholder')}
      />

      <TextField
        label={t('prescriptions.review.genericLabel')}
        value={med.normalized_medicine_name || ''}
        onChangeText={(val) => onUpdate({ normalized_medicine_name: val })}
        placeholder={t('prescriptions.review.genericPlaceholder')}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField
            label={t('prescriptions.review.strengthLabel')}
            value={med.strength || ''}
            onChangeText={(val) => onUpdate({ strength: val })}
            placeholder={t('prescriptions.review.strengthPlaceholder')}
          />
        </View>
        <View style={styles.flex}>
          <TextField
            label={t('prescriptions.review.formLabel')}
            value={med.dosage_form}
            onChangeText={(val) => onUpdate({ dosage_form: val.toUpperCase() as EditableMedicine['dosage_form'] })}
            placeholder={t('prescriptions.review.formPlaceholder')}
          />
        </View>
      </View>

      <Switch
        label={
          med.is_active_medication
            ? t('prescriptions.review.activeOnTitle')
            : t('prescriptions.review.activeOffTitle')
        }
        helper={
          med.is_active_medication
            ? t('prescriptions.review.activeOnHelp')
            : t('prescriptions.review.activeOffHelp')
        }
        value={med.is_active_medication}
        onValueChange={toggleActive}
      />

      {med.is_active_medication && <MedicineSchedule med={med} onUpdate={onUpdate} />}

      <TextField
        label={t('prescriptions.review.instructionsLabel')}
        value={med.instructions || ''}
        onChangeText={(val) => onUpdate({ instructions: val })}
        placeholder={t('prescriptions.review.instructionsPlaceholder')}
      />

      <View style={styles.removeRow}>
        <TextAction
          label={t('prescriptions.review.removeMedicine')}
          icon="close"
          tone="danger"
          onPress={onRemove}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.md,
  },
  // A missing required value is flagged with a caution outline, not color alone.
  warningBorder: {
    borderWidth: 1.5,
    borderColor: color.tone.caution.fg,
  },
  header: {
    gap: space.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: space.sm,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    backgroundColor: color.tone.caution.bg,
    borderRadius: radius.md,
    padding: space.md,
  },
  warningTitle: {
    color: color.tone.caution.fg,
  },
  warningText: {
    color: color.tone.caution.fg,
  },
  removeRow: {
    alignItems: 'flex-end',
  },
});
