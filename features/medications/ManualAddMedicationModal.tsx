import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { IconButton } from '../../design/components/Actions/IconButton';
import { Card } from '../../design/components/Containers/Card';
import { Icon } from '../../design/components/Foundations/Icon';
import { Screen } from '../../design/components/Foundations/Screen';
import { Text } from '../../design/components/Foundations/Text';
import { ChipGroup } from '../../design/components/Inputs/ChipGroup';
import { Switch } from '../../design/components/Inputs/Switch';
import { TextField } from '../../design/components/Inputs/TextField';
import { TopBar } from '../../design/components/Navigation/TopBar';
import { t } from '../../design/strings';
import type { StringKey } from '../../design/strings';
import { color, radius, space } from '../../design/tokens';
import { medicationService } from '../../services/medications/medication-service';
import { formatTime12Hour } from './reminder-time-utils';
import { scheduleMedicationReminder } from '../../services/notifications/notification-service';
import { ManualAddCustomTime } from './ManualAddCustomTime';

export interface ManualAddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onMedicationCreated: () => void;
}

const DOSAGE_FORMS: { value: string; labelKey: StringKey }[] = [
  { value: 'TABLET', labelKey: 'medicines.manual.form.tablet' },
  { value: 'CAPSULE', labelKey: 'medicines.manual.form.capsule' },
  { value: 'SYRUP', labelKey: 'medicines.manual.form.syrup' },
  { value: 'DROPS', labelKey: 'medicines.manual.form.drops' },
  { value: 'INJECTION', labelKey: 'medicines.manual.form.injection' },
  { value: 'CREAM', labelKey: 'medicines.manual.form.cream' },
  { value: 'INHALER', labelKey: 'medicines.manual.form.inhaler' },
  { value: 'OTHER', labelKey: 'medicines.manual.form.other' },
];

const DOSAGE_FORM_OPTIONS = DOSAGE_FORMS.map((form) => ({
  value: form.value,
  label: t(form.labelKey),
}));

const PRESET_TIMES: { time: string; labelKey: StringKey }[] = [
  { time: '08:00', labelKey: 'medicines.manual.preset.morning' },
  { time: '13:00', labelKey: 'medicines.manual.preset.noon' },
  { time: '18:00', labelKey: 'medicines.manual.preset.evening' },
  { time: '21:00', labelKey: 'medicines.manual.preset.bedtime' },
];

const PRESET_OPTIONS = PRESET_TIMES.map((item) => ({
  value: item.time,
  label: t(item.labelKey),
}));

export const ManualAddMedicationModal: React.FC<ManualAddMedicationModalProps> = ({
  visible,
  onClose,
  onMedicationCreated,
}) => {
  const [name, setName] = useState<string>('');
  const [dosageForm, setDosageForm] = useState<string>('TABLET');
  const [strength, setStrength] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [enableReminders, setEnableReminders] = useState<boolean>(true);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00', '20:00']);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0] as string
  );
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setDosageForm('TABLET');
    setStrength('');
    setInstructions('');
    setEnableReminders(true);
    setSelectedTimes(['08:00', '20:00']);
    setStartDate(new Date().toISOString().split('T')[0] as string);
    setNotes('');
    setError(null);
  };

  const handleTogglePresetTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes((prev) => prev.filter((t) => t !== time));
    } else {
      setSelectedTimes((prev) => [...prev, time].sort());
    }
  };

  // ChipGroup reports the whole next selection, so find the preset that was tapped.
  const handlePresetChange = (next: string[]) => {
    const changed = PRESET_TIMES.find(
      (item) => next.includes(item.time) !== selectedTimes.includes(item.time)
    );
    if (changed) handleTogglePresetTime(changed.time);
  };

  const handleAddCustomTime = (time24: string) => {
    if (!selectedTimes.includes(time24)) {
      setSelectedTimes((prev) => [...prev, time24].sort());
    }
  };

  const handleRemoveTime = (time: string) => {
    setSelectedTimes((prev) => prev.filter((t) => t !== time));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t('medicines.manual.errorNameRequired'));
      return;
    }

    if (enableReminders && selectedTimes.length === 0) {
      setError(t('medicines.manual.errorNoTimes'));
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const created = await medicationService.createMedication({
        nameAsWritten: name.trim(),
        dosageForm,
        strength: strength.trim() || undefined,
        prescribedInstructions: instructions.trim() || undefined,
        reminderTimes: enableReminders ? selectedTimes : undefined,
        startDate: startDate.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      // Schedule device notifications / alarms if enabled
      if (enableReminders && created?.id) {
        for (const t of selectedTimes) {
          scheduleMedicationReminder(created.id, name.trim(), t, instructions.trim()).catch(() => {});
        }
      }

      Alert.alert(
        t('medicines.manual.addedTitle'),
        enableReminders
          ? t('medicines.manual.addedWithReminders', {
              name: name.trim(),
              count: selectedTimes.length,
            })
          : t('medicines.manual.addedWithoutReminders', { name: name.trim() })
      );

      resetForm();
      onMedicationCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || t('medicines.manual.errorSaveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <Screen
        header={
          <TopBar
            title={t('medicines.manual.title')}
            right={
              <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={onClose} />
            }
          />
        }
      >
        <View style={styles.body}>
          {error ? (
            <View style={styles.errorBox} accessibilityLiveRegion="polite">
              <Icon name="warning-outline" tone="danger" />
              <Text variant="body" tone="danger" style={styles.flex}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Basic Info Card */}
          <Card style={styles.stack}>
            <Text variant="title3">{t('medicines.manual.sectionInfo')}</Text>

            <TextField
              label={t('medicines.manual.nameLabel')}
              value={name}
              onChangeText={setName}
              placeholder={t('medicines.manual.namePlaceholder')}
            />

            <TextField
              label={t('medicines.manual.strengthLabel')}
              value={strength}
              onChangeText={setStrength}
              placeholder={t('medicines.manual.strengthPlaceholder')}
            />

            <ChipGroup
              label={t('medicines.manual.formLabel')}
              options={DOSAGE_FORM_OPTIONS}
              selected={[dosageForm]}
              onChange={(next) => {
                const picked = next[0];
                if (picked) setDosageForm(picked);
              }}
            />

            <TextField
              label={t('medicines.manual.instructionsLabel')}
              value={instructions}
              onChangeText={setInstructions}
              placeholder={t('medicines.manual.instructionsPlaceholder')}
            />

            <TextField
              label={t('medicines.manual.startDateLabel')}
              value={startDate}
              onChangeText={setStartDate}
              placeholder={t('medicines.manual.startDatePlaceholder')}
            />
          </Card>

          {/* Reminders & Regimen Card */}
          <Card style={styles.stack}>
            <Switch
              label={t('medicines.manual.remindersTitle')}
              helper={t('medicines.manual.remindersBody')}
              value={enableReminders}
              onValueChange={setEnableReminders}
            />

            {enableReminders && (
              <>
                <ChipGroup
                  label={t('medicines.manual.presetsLabel')}
                  multi
                  options={PRESET_OPTIONS}
                  selected={selectedTimes}
                  onChange={handlePresetChange}
                />

                {/* Selected Times List */}
                <View style={styles.stackTight}>
                  <Text variant="caption" tone="secondary">
                    {t('medicines.manual.activeTimesLabel', { count: selectedTimes.length })}
                  </Text>
                  {selectedTimes.length === 0 ? (
                    <Text variant="caption" tone="danger">
                      {t('medicines.manual.noTimes')}
                    </Text>
                  ) : (
                    <View style={styles.tagRow}>
                      {selectedTimes.map((time) => (
                        <View key={time} style={styles.timeTag}>
                          <Icon name="alarm" size="sm" tone="link" />
                          <Text variant="callout" tone="link">
                            {formatTime12Hour(time)}
                          </Text>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t('medicines.manual.removeTime', {
                              time: formatTime12Hour(time),
                            })}
                            hitSlop={8}
                            onPress={() => handleRemoveTime(time)}
                          >
                            <Icon name="close" size="sm" tone="link" />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <ManualAddCustomTime onAddTime={handleAddCustomTime} existingTimes={selectedTimes} />
              </>
            )}
          </Card>

          {/* Notes Card */}
          <Card>
            <TextField
              label={t('medicines.manual.notesLabel')}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('medicines.manual.notesPlaceholder')}
            />
          </Card>

          {/* Submit Button */}
          <View style={styles.actions}>
            <Button
              label={submitting ? t('medicines.manual.saving') : t('medicines.manual.save')}
              onPress={handleSubmit}
              disabled={submitting}
              fullWidth
            />
          </View>
        </View>
      </Screen>
    </Modal>
  );
};

const styles = StyleSheet.create({
  body: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    gap: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
  },
  stack: {
    gap: space.lg,
  },
  stackTight: {
    gap: space.sm,
  },
  flex: {
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.action.danger,
    backgroundColor: color.tone.danger.bg,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.xs,
    paddingHorizontal: space.md,
    borderRadius: radius.control,
    backgroundColor: color.bg.tintBlue,
  },
  actions: {
    marginTop: space.sm,
  },
});
