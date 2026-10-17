import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/index';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { medicationService } from '../../services/medications/medication-service';
import { formatTime12Hour, getTimePeriodIcon } from './reminder-time-utils';

export interface ManualAddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onMedicationCreated: () => void;
}

const DOSAGE_FORMS = [
  'TABLET',
  'CAPSULE',
  'SYRUP',
  'DROPS',
  'INJECTION',
  'CREAM',
  'INHALER',
  'OTHER',
];

const PRESET_TIMES = [
  { label: '🌅 Morning (8:00 AM)', time: '08:00' },
  { label: '☀️ Noon (1:00 PM)', time: '13:00' },
  { label: '🌇 Evening (6:00 PM)', time: '18:00' },
  { label: '🌙 Bedtime (9:00 PM)', time: '21:00' },
];

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
  const [customTime, setCustomTime] = useState<string>('');
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
    setCustomTime('');
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

  const handleAddCustomTime = () => {
    const trimmed = customTime.trim();
    if (!trimmed) return;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(trimmed)) {
      Alert.alert('Invalid Format', 'Please enter time in 24-hour HH:mm format (e.g. 09:30).');
      return;
    }
    if (!selectedTimes.includes(trimmed)) {
      setSelectedTimes((prev) => [...prev, trimmed].sort());
    }
    setCustomTime('');
  };

  const handleRemoveTime = (time: string) => {
    setSelectedTimes((prev) => prev.filter((t) => t !== time));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Medication name is required.');
      return;
    }

    if (enableReminders && selectedTimes.length === 0) {
      setError('Please select at least one reminder time, or disable reminders.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await medicationService.createMedication({
        nameAsWritten: name.trim(),
        dosageForm,
        strength: strength.trim() || undefined,
        prescribedInstructions: instructions.trim() || undefined,
        reminderTimes: enableReminders ? selectedTimes : undefined,
        startDate: startDate.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        'Medication Added',
        enableReminders
          ? `"${name.trim()}" is now active with ${selectedTimes.length} daily reminder(s).`
          : `"${name.trim()}" has been saved to your medications list.`
      );

      resetForm();
      onMedicationCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create medication. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Medication Manually</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Basic Info Card */}
          <Card style={styles.card}>
            <Text style={styles.sectionHeader}>Medicine Information</Text>

            <Input
              label="Medicine Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Paracetamol, Metformin, Amoxicillin"
            />

            <Input
              label="Strength / Dose (Optional)"
              value={strength}
              onChangeText={setStrength}
              placeholder="e.g. 500mg, 10ml, 2.5mg"
            />

            <Text style={styles.fieldLabel}>Dosage Form</Text>
            <View style={styles.chipRow}>
              {DOSAGE_FORMS.map((form) => (
                <TouchableOpacity
                  key={form}
                  style={[styles.chip, dosageForm === form && styles.chipActive]}
                  onPress={() => setDosageForm(form)}
                >
                  <Text
                    style={[styles.chipText, dosageForm === form && styles.chipTextActive]}
                  >
                    {form}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Instructions (Optional)"
              value={instructions}
              onChangeText={setInstructions}
              placeholder="e.g. Take 1 tablet after meals"
            />

            <Input
              label="Start Date (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
            />
          </Card>

          {/* Reminders & Regimen Card */}
          <Card style={styles.card}>
            <View style={styles.reminderHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionHeader}>Daily Dose Reminders</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Schedule recurring alarms and dose tracking for today and upcoming days.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, enableReminders && styles.toggleBtnActive]}
                onPress={() => setEnableReminders(!enableReminders)}
              >
                <Text
                  style={[styles.toggleBtnText, enableReminders && styles.toggleBtnTextActive]}
                >
                  {enableReminders ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            {enableReminders && (
              <View style={{ marginTop: spacing.md }}>
                <Text style={styles.fieldLabel}>Quick Times of Day</Text>
                <View style={styles.presetRow}>
                  {PRESET_TIMES.map((item) => {
                    const isSelected = selectedTimes.includes(item.time);
                    return (
                      <TouchableOpacity
                        key={item.time}
                        style={[styles.presetChip, isSelected && styles.presetChipActive]}
                        onPress={() => handleTogglePresetTime(item.time)}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            isSelected && styles.presetChipTextActive,
                          ]}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selected Times List */}
                <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
                  Active Reminder Times ({selectedTimes.length})
                </Text>
                <View style={styles.activeTimesRow}>
                  {selectedTimes.length === 0 ? (
                    <Text style={[typography.caption, { color: colors.danger }]}>
                      No times selected. Select a preset above or add a custom time below.
                    </Text>
                  ) : (
                    selectedTimes.map((t) => (
                      <View key={t} style={styles.timeTag}>
                        <Text style={styles.timeTagText}>
                          {getTimePeriodIcon(t)} {formatTime12Hour(t)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveTime(t)}
                          style={styles.timeTagRemove}
                        >
                          <Text style={styles.timeTagRemoveText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>

                {/* Add Custom Time */}
                <View style={styles.customTimeRow}>
                  <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <Input
                      label="Add Custom Time (HH:mm 24h)"
                      value={customTime}
                      onChangeText={setCustomTime}
                      placeholder="e.g. 07:30, 21:00"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.addTimeBtn}
                    onPress={handleAddCustomTime}
                  >
                    <Text style={styles.addTimeBtnText}>+ Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>

          {/* Notes Card */}
          <Card style={styles.card}>
            <Input
              label="Doctor / Personal Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Prescribed by Dr. Sharma for BP"
            />
          </Card>

          {/* Submit Button */}
          <View style={styles.actionButtons}>
            <Button
              title={submitting ? 'Saving Medication...' : 'Save Medication & Schedule'}
              onPress={handleSubmit}
              disabled={submitting}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  closeBtnText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.h3,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  reminderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtnActive: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  toggleBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: colors.success,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  presetChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  presetChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  presetChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  presetChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  activeTimesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  timeTagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  timeTagRemove: {
    marginLeft: 6,
    padding: 2,
  },
  timeTagRemoveText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  addTimeBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  addTimeBtnText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
  actionButtons: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
