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
  const [reminderTimesInput, setReminderTimesInput] = useState<string>('08:00');
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
        setReminderTimesInput(detail.reminderTimes.join(', '));
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

  const handleActivate = async () => {
    if (!medicationId) return;
    const times = reminderTimesInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (times.length === 0) {
      Alert.alert('Reminder Time Required', 'Please provide at least one reminder time (e.g. 08:00).');
      return;
    }

    setSubmittingAction(true);
    try {
      await medicationService.activateMedication(medicationId, {
        reminderTimes: times,
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
    const times = reminderTimesInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (times.length === 0) {
      Alert.alert('Reminder Time Required', 'Please enter at least one reminder time (e.g. 08:00).');
      return;
    }

    setSubmittingAction(true);
    try {
      await medicationService.updateReminderPreferences(medicationId, {
        reminderTimes: times,
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
              <Text style={styles.sectionHeader}>Reminder Preferences</Text>
              <Text style={styles.disclaimerText}>
                Times below are patient-selected reminder preferences, not clinician orders.
              </Text>

              {medication.reminderTimes && medication.reminderTimes.length > 0 ? (
                <View style={styles.timesList}>
                  {medication.reminderTimes.map((t, idx) => (
                    <View key={idx} style={styles.timeChip}>
                      <Text style={styles.timeChipText}>{t}</Text>
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
                  <Text style={styles.formLabel}>
                    Reminder Times (24-hour HH:mm, comma separated):
                  </Text>
                  <TextInput
                    style={styles.timeInput}
                    value={reminderTimesInput}
                    onChangeText={setReminderTimesInput}
                    placeholder="e.g. 08:00, 20:00"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                  />
                  <View style={styles.formButtonsRow}>
                    <Button
                      title="Cancel"
                      variant="outline"
                      onPress={() => setShowScheduleForm(false)}
                      style={{ flex: 1, marginRight: spacing.xs }}
                    />
                    <Button
                      title={medication.status === 'INACTIVE' ? 'Confirm & Activate' : 'Save Times'}
                      onPress={
                        medication.status === 'INACTIVE' ? handleActivate : handleUpdateSchedule
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
  scheduleFormContainer: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  formButtonsRow: {
    flexDirection: 'row',
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
