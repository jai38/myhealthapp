import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/index';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DocumentPreview } from '../../components/DocumentPreview';
import {
  MedicationDetail,
  DocumentSignedUrl,
  medicationService,
  MedicationStatus,
} from '../../services/medications/medication-service';
import {
  formatTime12Hour,
  getTimePeriodIcon,
  FREQUENCY_PRESETS,
  QUICK_TIME_PRESETS,
} from './reminder-time-utils';

export interface MedicationDetailModalProps {
  visible: boolean;
  medicationId: string | null;
  onClose: () => void;
  onStatusChanged?: () => void;
}

export const MedicationDetailModal: React.FC<MedicationDetailModalProps> = ({
  visible,
  medicationId,
  onClose,
  onStatusChanged,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [medication, setMedication] = useState<MedicationDetail | null>(null);

  // Document preview state
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [documentUrlInfo, setDocumentUrlInfo] = useState<DocumentSignedUrl | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState<boolean>(false);

  // Schedule / Action Sub-views
  const [showScheduleForm, setShowScheduleForm] = useState<boolean>(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00', '20:00']);
  const [customHour, setCustomHour] = useState<string>('08');
  const [customMinute, setCustomMinute] = useState<string>('00');
  const [customPeriod, setCustomPeriod] = useState<'AM' | 'PM'>('AM');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  // Discontinue reason input
  const [showDiscontinuePrompt, setShowDiscontinuePrompt] = useState<boolean>(false);
  const [discontinueReason, setDiscontinueReason] = useState<string>('');

  useEffect(() => {
    if (visible && medicationId) {
      loadMedication(medicationId);
    } else {
      setMedication(null);
      setError(null);
      setShowScheduleForm(false);
      setShowDiscontinuePrompt(false);
      setDocumentUrlInfo(null);
      setShowDocumentPreview(false);
    }
  }, [visible, medicationId]);

  const loadMedication = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await medicationService.getMedicationDetails(id);
      setMedication(detail);
      if (detail.reminderTimes && detail.reminderTimes.length > 0) {
        setSelectedTimes(detail.reminderTimes);
      } else {
        setSelectedTimes(['08:00', '20:00']);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load medication details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = async () => {
    if (!medicationId) return;
    setLoadingDoc(true);
    setDocError(null);
    setShowDocumentPreview(true);
    try {
      const urlInfo = await medicationService.getDocumentSignedUrl(medicationId);
      setDocumentUrlInfo(urlInfo);
    } catch (err: any) {
      setDocError(err?.message || 'Source prescription document is unavailable.');
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleSelectFrequency = (times: readonly string[]) => {
    setSelectedTimes([...times]);
  };

  const handleTogglePresetTime = (time24: string) => {
    if (selectedTimes.includes(time24)) {
      if (selectedTimes.length === 1) {
        Alert.alert('Reminder Required', 'Please keep at least one reminder time.');
        return;
      }
      setSelectedTimes(selectedTimes.filter((t) => t !== time24));
    } else {
      setSelectedTimes([...selectedTimes, time24].sort());
    }
  };

  const handleRemoveTime = (time24: string) => {
    if (selectedTimes.length <= 1) {
      Alert.alert('Reminder Required', 'Please keep at least one reminder time.');
      return;
    }
    setSelectedTimes(selectedTimes.filter((t) => t !== time24));
  };

  const handleAddCustomTime = () => {
    let h = parseInt(customHour, 10);
    const m = parseInt(customMinute, 10);
    if (isNaN(h) || h < 1 || h > 12 || isNaN(m) || m < 0 || m > 59) {
      Alert.alert('Invalid Time', 'Please choose a valid hour (1-12) and minute (0-59).');
      return;
    }
    if (customPeriod === 'PM' && h !== 12) h += 12;
    if (customPeriod === 'AM' && h === 12) h = 0;
    const hFormatted = h < 10 ? `0${h}` : `${h}`;
    const mFormatted = m < 10 ? `0${m}` : `${m}`;
    const time24 = `${hFormatted}:${mFormatted}`;

    if (selectedTimes.includes(time24)) {
      Alert.alert('Already Added', `Reminder for ${formatTime12Hour(time24)} is already in your schedule.`);
      return;
    }
    setSelectedTimes([...selectedTimes, time24].sort());
  };

  const handleActivate = async () => {
    if (!medicationId) return;
    if (selectedTimes.length === 0) {
      Alert.alert('Reminder Time Required', 'Please choose at least one reminder time.');
      return;
    }

    setSubmittingAction(true);
    try {
      await medicationService.activateMedication(medicationId, {
        reminderTimes: selectedTimes,
      });
      setShowScheduleForm(false);
      await loadMedication(medicationId);
      onStatusChanged?.();
      Alert.alert('Medication Activated', 'Reminder schedule configured and active.');
    } catch (err: any) {
      Alert.alert('Activation Failed', err?.message || 'Could not activate medication.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!medicationId) return;
    if (selectedTimes.length === 0) {
      Alert.alert('Reminder Time Required', 'Please select at least one reminder time.');
      return;
    }

    setSubmittingAction(true);
    try {
      await medicationService.updateReminderPreferences(medicationId, {
        reminderTimes: selectedTimes,
      });
      setShowScheduleForm(false);
      await loadMedication(medicationId);
      onStatusChanged?.();
      Alert.alert('Schedule Updated', 'Your reminder preferences have been updated.');
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update reminder schedule.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handlePause = async () => {
    if (!medicationId) return;
    Alert.alert(
      'Pause Medication',
      'This will pause upcoming reminder notifications. It does not replace clinical advice. Confirm pause?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause',
          style: 'destructive',
          onPress: async () => {
            setSubmittingAction(true);
            try {
              await medicationService.pauseMedication(medicationId);
              await loadMedication(medicationId);
              onStatusChanged?.();
            } catch (err: any) {
              Alert.alert('Pause Failed', err?.message || 'Could not pause medication.');
            } finally {
              setSubmittingAction(false);
            }
          },
        },
      ]
    );
  };

  const handleResume = async () => {
    if (!medicationId) return;
    setSubmittingAction(true);
    try {
      await medicationService.resumeMedication(medicationId);
      await loadMedication(medicationId);
      onStatusChanged?.();
      Alert.alert('Medication Resumed', 'Upcoming reminders have been rescheduled.');
    } catch (err: any) {
      Alert.alert('Resume Failed', err?.message || 'Could not resume medication.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleComplete = async () => {
    if (!medicationId) return;
    Alert.alert(
      'Mark as Completed',
      'Are you sure you have completed this prescribed course?\n\nDisclaimer: This records your action in your personal health record and does not notify your doctor.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Completed',
          onPress: async () => {
            setSubmittingAction(true);
            try {
              await medicationService.completeMedication(medicationId);
              await loadMedication(medicationId);
              onStatusChanged?.();
            } catch (err: any) {
              Alert.alert('Action Failed', err?.message || 'Could not complete medication.');
            } finally {
              setSubmittingAction(false);
            }
          },
        },
      ]
    );
  };

  const handleDiscontinueConfirm = async () => {
    if (!medicationId) return;
    setSubmittingAction(true);
    try {
      await medicationService.discontinueMedication(medicationId, discontinueReason);
      setShowDiscontinuePrompt(false);
      await loadMedication(medicationId);
      onStatusChanged?.();
      Alert.alert('Medication Discontinued', 'Archived under past regimens.');
    } catch (err: any) {
      Alert.alert('Action Failed', err?.message || 'Could not discontinue medication.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status: MedicationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge label="Active Regimen" variant="success" />;
      case 'INACTIVE':
        return <Badge label="Prescribed — Not Activated" variant="warning" />;
      case 'PAUSED':
        return <Badge label="Paused" variant="warning" />;
      case 'COMPLETED':
        return <Badge label="Completed Course" variant="neutral" />;
      case 'DISCONTINUED':
        return <Badge label="Discontinued" variant="neutral" />;
      default:
        return <Badge label={status} variant="neutral" />;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {medication?.nameAsWritten || 'Medication Details'}
          </Text>
          <View style={{ width: 50 }} />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.bodyMuted, { marginTop: spacing.md }]}>
              Loading clinical medication record...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={[typography.h3, { color: colors.danger, marginBottom: spacing.sm }]}>
              Unable to load details
            </Text>
            <Text style={[typography.bodyMuted, { textAlign: 'center', marginBottom: spacing.md }]}>
              {error}
            </Text>
            <Button title="Retry" onPress={() => medicationId && loadMedication(medicationId)} />
          </View>
        ) : medication ? (
          <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollContent}>
            {/* Title & Status Card */}
            <Card style={styles.card}>
              <View style={styles.statusRow}>
                {getStatusBadge(medication.status)}
                {medication.dosageForm && (
                  <Text style={styles.dosageFormText}>{medication.dosageForm}</Text>
                )}
              </View>

              <Text style={typography.h2}>{medication.nameAsWritten}</Text>

              {medication.normalizedMedicineName && (
                <Text style={styles.normalizedName}>
                  Generic / Normalized: {medication.normalizedMedicineName}
                </Text>
              )}

              {medication.strength && (
                <Text style={styles.strengthText}>Strength: {medication.strength}</Text>
              )}
            </Card>

            {/* Prescribed Instructions Card */}
            <Card style={styles.card}>
              <Text style={styles.sectionHeader}>Prescribed Instructions</Text>
              <Text style={styles.instructionsText}>
                {medication.prescribedInstructions || 'No specific instructions written.'}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.metaLabel}>Source Prescription Provenance:</Text>
              {medication.prescription ? (
                <View style={styles.provenanceBox}>
                  {medication.prescription.doctorName && (
                    <Text style={styles.provenanceText}>
                      Doctor: {medication.prescription.doctorName}
                    </Text>
                  )}
                  {medication.prescription.clinicHospitalName && (
                    <Text style={styles.provenanceText}>
                      Clinic: {medication.prescription.clinicHospitalName}
                    </Text>
                  )}
                  {medication.prescription.prescriptionDate && (
                    <Text style={styles.provenanceText}>
                      Date: {medication.prescription.prescriptionDate}
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={typography.bodyMuted}>Self-reported or manual record</Text>
              )}

              {medication.sourceDocumentId && (
                <View style={{ marginTop: spacing.sm }}>
                  <Button
                    title={showDocumentPreview ? 'Hide Original Document' : 'View Original Prescription Document'}
                    variant="outline"
                    onPress={() => {
                      if (!showDocumentPreview) {
                        handleOpenDocument();
                      } else {
                        setShowDocumentPreview(false);
                      }
                    }}
                    isLoading={loadingDoc}
                  />

                  {showDocumentPreview && (
                    <View style={{ marginTop: spacing.sm }}>
                      {loadingDoc ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : docError ? (
                        <Text style={[typography.bodyMuted, { color: colors.danger }]}>{docError}</Text>
                      ) : documentUrlInfo ? (
                        <DocumentPreview
                          filename={documentUrlInfo.filename}
                          mimeType={documentUrlInfo.mimeType}
                          signedUrl={documentUrlInfo.signedUrl}
                        />
                      ) : null}
                    </View>
                  )}
                </View>
              )}
            </Card>

            {/* Reminder Schedule & Preferences Card */}
            <Card style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>Reminder Preferences</Text>
                {medication.reminderTimes && medication.reminderTimes.length > 0 && (
                  <Badge
                    label={`${medication.reminderTimes.length} reminder${medication.reminderTimes.length > 1 ? 's' : ''} daily`}
                    variant="neutral"
                  />
                )}
              </View>
              <Text style={styles.disclaimerText}>
                Times below are patient-selected reminder preferences, not clinician orders.
              </Text>

              {medication.reminderTimes && medication.reminderTimes.length > 0 ? (
                <View style={styles.timesList}>
                  {medication.reminderTimes.map((t, idx) => (
                    <View key={idx} style={styles.friendlyTimeChip}>
                      <Text style={styles.timePeriodIcon}>{getTimePeriodIcon(t)}</Text>
                      <Text style={styles.friendlyTimeText}>{formatTime12Hour(t)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[typography.bodyMuted, { marginVertical: spacing.sm }]}>
                  No reminder schedule configured.
                </Text>
              )}

              {medication.startDate && (
                <Text style={styles.metaItem}>Start Date: {medication.startDate}</Text>
              )}
              {medication.endDate && (
                <Text style={styles.metaItem}>End Date: {medication.endDate}</Text>
              )}

              {showScheduleForm ? (
                <View style={styles.scheduleFormContainer}>
                  <Text style={styles.scheduleFormHeading}>
                    {medication.status === 'INACTIVE'
                      ? 'Configure Daily Medication Timers'
                      : 'Adjust Reminder Schedule'}
                  </Text>
                  <Text style={styles.scheduleFormSubtext}>
                    Tap a frequency preset or pick times that best match your routine.
                  </Text>

                  {/* 1. Daily Frequency Presets */}
                  <Text style={styles.subSectionTitle}>Daily Frequency</Text>
                  <View style={styles.frequencyRow}>
                    {FREQUENCY_PRESETS.map((p) => {
                      const isSelected =
                        selectedTimes.length === p.times.length &&
                        p.times.every((t) => selectedTimes.includes(t));
                      return (
                        <TouchableOpacity
                          key={p.label}
                          style={[
                            styles.frequencyBtn,
                            isSelected && styles.frequencyBtnActive,
                          ]}
                          onPress={() => handleSelectFrequency(p.times)}
                        >
                          <Text
                            style={[
                              styles.frequencyBtnText,
                              isSelected && styles.frequencyBtnTextActive,
                            ]}
                          >
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* 2. Quick Preset Chips */}
                  <Text style={styles.subSectionTitle}>Quick Add / Toggle Time</Text>
                  <View style={styles.quickChipsRow}>
                    {QUICK_TIME_PRESETS.map((q) => {
                      const isActive = selectedTimes.includes(q.time);
                      return (
                        <TouchableOpacity
                          key={q.time}
                          style={[
                            styles.quickChip,
                            isActive && styles.quickChipActive,
                          ]}
                          onPress={() => handleTogglePresetTime(q.time)}
                        >
                          <Text style={styles.quickChipIcon}>{q.icon}</Text>
                          <Text
                            style={[
                              styles.quickChipText,
                              isActive && styles.quickChipTextActive,
                            ]}
                          >
                            {q.label} ({q.display})
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* 3. Selected Timers List */}
                  <Text style={styles.subSectionTitle}>
                    Scheduled Reminders ({selectedTimes.length})
                  </Text>
                  <View style={styles.activePillsContainer}>
                    {selectedTimes.map((t) => (
                      <View key={t} style={styles.activeTimePill}>
                        <Text style={styles.activeTimePillIcon}>
                          {getTimePeriodIcon(t)}
                        </Text>
                        <Text style={styles.activeTimePillText}>
                          {formatTime12Hour(t)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveTime(t)}
                          style={styles.pillRemoveBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.pillRemoveText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  {/* 4. Add Custom Time */}
                  <View style={styles.customTimeSection}>
                    <Text style={styles.subSectionTitle}>Add Custom Time</Text>
                    <View style={styles.customTimePickerRow}>
                      {/* Hour selector */}
                      <View style={styles.timeUnitBox}>
                        <TextInput
                          style={styles.timeDigitInput}
                          value={customHour}
                          onChangeText={(val) => {
                            const cleaned = val.replace(/[^0-9]/g, '').slice(0, 2);
                            setCustomHour(cleaned);
                          }}
                          keyboardType="number-pad"
                          maxLength={2}
                          placeholder="08"
                          placeholderTextColor={colors.textMuted}
                        />
                        <Text style={styles.timeUnitLabel}>Hour (1-12)</Text>
                      </View>

                      <Text style={styles.timeColon}>:</Text>

                      {/* Minute selector */}
                      <View style={styles.timeUnitBox}>
                        <TextInput
                          style={styles.timeDigitInput}
                          value={customMinute}
                          onChangeText={(val) => {
                            const cleaned = val.replace(/[^0-9]/g, '').slice(0, 2);
                            setCustomMinute(cleaned);
                          }}
                          keyboardType="number-pad"
                          maxLength={2}
                          placeholder="00"
                          placeholderTextColor={colors.textMuted}
                        />
                        <Text style={styles.timeUnitLabel}>Minute</Text>
                      </View>

                      {/* AM / PM Toggle */}
                      <View style={styles.amPmToggleRow}>
                        <TouchableOpacity
                          style={[
                            styles.amPmBtn,
                            customPeriod === 'AM' && styles.amPmBtnActive,
                          ]}
                          onPress={() => setCustomPeriod('AM')}
                        >
                          <Text
                            style={[
                              styles.amPmBtnText,
                              customPeriod === 'AM' && styles.amPmBtnTextActive,
                            ]}
                          >
                            AM
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.amPmBtn,
                            customPeriod === 'PM' && styles.amPmBtnActive,
                          ]}
                          onPress={() => setCustomPeriod('PM')}
                        >
                          <Text
                            style={[
                              styles.amPmBtnText,
                              customPeriod === 'PM' && styles.amPmBtnTextActive,
                            ]}
                          >
                            PM
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Add button */}
                      <TouchableOpacity
                        style={styles.addCustomTimeBtn}
                        onPress={handleAddCustomTime}
                      >
                        <Text style={styles.addCustomTimeBtnText}>+ Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Form Actions */}
                  <View style={styles.formButtonsRow}>
                    <Button
                      title="Cancel"
                      variant="outline"
                      onPress={() => setShowScheduleForm(false)}
                      style={{ flex: 1, marginRight: spacing.xs }}
                    />
                    <Button
                      title={
                        medication.status === 'INACTIVE'
                          ? 'Confirm & Activate'
                          : 'Save Times'
                      }
                      onPress={
                        medication.status === 'INACTIVE'
                          ? handleActivate
                          : handleUpdateSchedule
                      }
                      isLoading={submittingAction}
                      style={{ flex: 1, marginLeft: spacing.xs }}
                    />
                  </View>
                </View>
              ) : (
                (medication.status === 'ACTIVE' || medication.status === 'INACTIVE') && (
                  <TouchableOpacity
                    style={styles.editScheduleButton}
                    onPress={() => setShowScheduleForm(true)}
                  >
                    <Text style={styles.editScheduleText}>
                      {medication.status === 'INACTIVE'
                        ? 'Set Reminders & Activate Regimen'
                        : 'Adjust Reminder Times'}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </Card>

            {/* Dose History Card */}
            <Card style={styles.card}>
              <Text style={styles.sectionHeader}>Recent Dose Occurrences</Text>
              {medication.doseLogs && medication.doseLogs.length > 0 ? (
                medication.doseLogs.slice(0, 10).map((dl) => (
                  <View key={dl.id} style={styles.doseRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.doseTime}>
                        {new Date(dl.scheduledTime).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(dl.scheduledTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {dl.notes && <Text style={styles.doseNotes}>Note: {dl.notes}</Text>}
                    </View>
                    <Badge
                      label={dl.status}
                      variant={
                        dl.status === 'TAKEN'
                          ? 'success'
                          : dl.status === 'SKIPPED'
                          ? 'danger'
                          : dl.status === 'SNOOZED'
                          ? 'warning'
                          : 'neutral'
                      }
                    />
                  </View>
                ))
              ) : (
                <Text style={typography.bodyMuted}>No dose actions recorded yet.</Text>
              )}
            </Card>

            {/* Lifecycle Actions */}
            <Card style={[styles.card, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={styles.sectionHeader}>Regimen Actions</Text>
              <Text style={styles.medicalDisclaimer}>
                Disclaimer: Actions recorded here update your patient timeline only. They do not
                notify your clinician or replace medical consultations.
              </Text>

              {medication.status === 'ACTIVE' && (
                <View style={styles.actionButtonsCol}>
                  <Button
                    title="Pause Regimen"
                    variant="outline"
                    onPress={handlePause}
                    isLoading={submittingAction}
                    style={{ marginBottom: spacing.sm }}
                  />
                  <Button
                    title="Mark Course Completed"
                    variant="outline"
                    onPress={handleComplete}
                    isLoading={submittingAction}
                    style={{ marginBottom: spacing.sm }}
                  />
                  <Button
                    title="Discontinue Medication"
                    variant="danger"
                    onPress={() => setShowDiscontinuePrompt(true)}
                    isLoading={submittingAction}
                  />
                </View>
              )}

              {medication.status === 'PAUSED' && (
                <View style={styles.actionButtonsCol}>
                  <Button
                    title="Resume Regimen"
                    variant="primary"
                    onPress={handleResume}
                    isLoading={submittingAction}
                    style={{ marginBottom: spacing.sm }}
                  />
                  <Button
                    title="Mark Completed"
                    variant="outline"
                    onPress={handleComplete}
                    isLoading={submittingAction}
                    style={{ marginBottom: spacing.sm }}
                  />
                  <Button
                    title="Discontinue Medication"
                    variant="danger"
                    onPress={() => setShowDiscontinuePrompt(true)}
                    isLoading={submittingAction}
                  />
                </View>
              )}

              {showDiscontinuePrompt && (
                <View style={styles.discontinueBox}>
                  <Text style={styles.discontinueTitle}>Discontinue Medication</Text>
                  <Text style={styles.discontinueHelp}>
                    Please enter an optional reason for discontinuing (e.g. side effects, doctor changed plan):
                  </Text>
                  <TextInput
                    style={styles.reasonInput}
                    value={discontinueReason}
                    onChangeText={setDiscontinueReason}
                    placeholder="Reason (optional)"
                    placeholderTextColor={colors.textMuted}
                  />
                  <View style={styles.formButtonsRow}>
                    <Button
                      title="Cancel"
                      variant="outline"
                      onPress={() => setShowDiscontinuePrompt(false)}
                      style={{ flex: 1, marginRight: spacing.xs }}
                    />
                    <Button
                      title="Confirm Discontinue"
                      variant="danger"
                      onPress={handleDiscontinueConfirm}
                      isLoading={submittingAction}
                      style={{ flex: 1, marginLeft: spacing.xs }}
                    />
                  </View>
                </View>
              )}
            </Card>
          </ScrollView>
        ) : null}


      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    height: 60,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  closeText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    maxWidth: '65%',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dosageFormText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  normalizedName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  strengthText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  instructionsText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  provenanceBox: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  provenanceText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  docButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  docButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  timesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  timeChip: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaItem: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  editScheduleButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  editScheduleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  friendlyTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  timePeriodIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  friendlyTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scheduleFormContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scheduleFormHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  scheduleFormSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  frequencyBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  frequencyBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  frequencyBtnTextActive: {
    color: '#ffffff',
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipActive: {
    backgroundColor: '#E6FFFA',
    borderColor: colors.primary,
  },
  quickChipIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  quickChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  quickChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  activePillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activeTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    borderRadius: borderRadius.sm,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  activeTimePillIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  activeTimePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },
  pillRemoveBtn: {
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  pillRemoveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  customTimeSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  customTimePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  timeUnitBox: {
    alignItems: 'center',
  },
  timeDigitInput: {
    width: 44,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  timeUnitLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  timeColon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: 2,
  },
  amPmToggleRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginLeft: 4,
  },
  amPmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
  },
  amPmBtnActive: {
    backgroundColor: colors.primary,
  },
  amPmBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  amPmBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  addCustomTimeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.sm,
    marginLeft: 'auto',
  },
  addCustomTimeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  formButtonsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  doseTime: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  doseNotes: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  medicalDisclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  actionButtonsCol: {
    flexDirection: 'column',
  },
  discontinueBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  discontinueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  discontinueHelp: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
});
