import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/index';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DocumentPreview } from '../../components/DocumentPreview';
import {
  TimelineDetail,
  TimelineDocumentUrl,
  timelineService,
  formatMedicalEventDate,
} from '../../services/timeline/timeline-service';

export interface TimelineDetailModalProps {
  visible: boolean;
  eventId: string | null;
  onClose: () => void;
}

export const TimelineDetailModal: React.FC<TimelineDetailModalProps> = ({
  visible,
  eventId,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [eventDetail, setEventDetail] = useState<TimelineDetail | null>(null);

  // Document preview state
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [documentUrlInfo, setDocumentUrlInfo] = useState<TimelineDocumentUrl | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState<boolean>(false);

  useEffect(() => {
    if (visible && eventId) {
      loadDetail(eventId);
    } else {
      setEventDetail(null);
      setError(null);
      setDocumentUrlInfo(null);
      setShowDocumentPreview(false);
      setDocError(null);
    }
  }, [visible, eventId]);

  const loadDetail = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await timelineService.fetchTimelineDetail(id);
      setEventDetail(detail);
    } catch (err: any) {
      setError(err?.message || 'Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = async () => {
    if (!eventId) return;
    setLoadingDoc(true);
    setDocError(null);
    setShowDocumentPreview(true);
    try {
      const urlInfo = await timelineService.fetchTimelineDocumentUrl(eventId);
      setDocumentUrlInfo(urlInfo);
    } catch (err: any) {
      setDocError(err?.message || 'Source document is currently unavailable or expired.');
    } finally {
      setLoadingDoc(false);
    }
  };

  if (!visible) return null;

  const dateInfo = eventDetail
    ? formatMedicalEventDate(
        eventDetail.eventDate,
        eventDetail.datePrecision,
        eventDetail.dateIsUncertain
      )
    : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close event details"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Medical Record Detail
          </Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.bodyMuted, styles.loadingText]}>
              Loading verified clinical record...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Card variant="muted" style={styles.errorCard}>
              <Text style={[typography.h3, styles.errorTitle]}>Unable to Load Event</Text>
              <Text style={[typography.bodyMuted, styles.errorMessage]}>{error}</Text>
              <Button
                title="Retry"
                variant="primary"
                onPress={() => eventId && loadDetail(eventId)}
                style={styles.retryButton}
              />
            </Card>
          </View>
        ) : eventDetail ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Clinical Provenance Badge */}
            <View style={styles.provenanceRow}>
              <Badge
                label={eventDetail.eventType}
                variant="info"
                style={styles.eventTypeBadge}
              />
              <Badge
                label="Patient Confirmed"
                variant="success"
                style={styles.statusBadge}
              />
              {eventDetail.dateIsUncertain && (
                <Badge
                  label="Approximate Date"
                  variant="warning"
                  style={styles.statusBadge}
                />
              )}
            </View>

            {/* Event Title */}
            <Text style={[typography.h1, styles.eventTitle]}>{eventDetail.title}</Text>

            {/* Medical Date vs Upload Date */}
            <Card variant="elevated" style={styles.dateCard}>
              <View style={styles.dateRow}>
                <View style={styles.dateCol}>
                  <Text style={styles.dateMetaLabel}>Medical Event Date</Text>
                  <Text style={[typography.h3, styles.dateValue]}>
                    {dateInfo?.formatted}
                  </Text>
                  {eventDetail.datePrecision && eventDetail.datePrecision !== 'EXACT' && (
                    <Text style={styles.datePrecisionNote}>
                      Precision: {eventDetail.datePrecision.replace('_', ' ').toLowerCase()}
                    </Text>
                  )}
                </View>
                {eventDetail.sourceDocument?.uploadedAt && (
                  <View style={styles.dateCol}>
                    <Text style={styles.dateMetaLabel}>Document Uploaded</Text>
                    <Text style={[typography.caption, styles.uploadedDateValue]}>
                      {new Date(eventDetail.sourceDocument.uploadedAt).toLocaleDateString(
                        undefined,
                        { year: 'numeric', month: 'short', day: 'numeric' }
                      )}
                    </Text>
                    <Text style={styles.datePrecisionNote}>System Timestamp</Text>
                  </View>
                )}
              </View>
            </Card>

            {/* Clinical Summary */}
            <Card variant="muted" style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>Clinical Summary</Text>
              <Text style={[typography.body, styles.summaryText]}>
                {eventDetail.summary}
              </Text>
            </Card>

            {/* Provider and Consultation Details if available */}
            {eventDetail.prescription && (
              <Card variant="outlined" style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>Consultation & Clinic Info</Text>

                {eventDetail.prescription.doctorName ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Physician:</Text>
                    <Text style={styles.infoValue}>
                      {eventDetail.prescription.doctorName}
                    </Text>
                  </View>
                ) : null}

                {eventDetail.prescription.clinicHospitalName ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Facility / Hospital:</Text>
                    <Text style={styles.infoValue}>
                      {eventDetail.prescription.clinicHospitalName}
                    </Text>
                  </View>
                ) : null}

                {eventDetail.prescription.diagnosis ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Documented Diagnosis:</Text>
                    <Text style={styles.infoValue}>
                      {eventDetail.prescription.diagnosis}
                    </Text>
                  </View>
                ) : null}

                {eventDetail.prescription.confirmedAt ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Confirmation Date:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(eventDetail.prescription.confirmedAt).toLocaleDateString()}
                    </Text>
                  </View>
                ) : null}
              </Card>
            )}

            {/* Prescribed Medications */}
            {eventDetail.prescription?.items && eventDetail.prescription.items.length > 0 && (
              <View style={styles.medicationsSection}>
                <Text style={[typography.h3, styles.sectionTitle]}>
                  Documented Medications ({eventDetail.prescription.items.length})
                </Text>
                <Text style={[typography.caption, styles.medicationNotice]}>
                  Historical record from prescription. Does not indicate active intake unless confirmed by patient.
                </Text>

                {eventDetail.prescription.items.map((item, index) => (
                  <Card key={item.id || index} variant="elevated" style={styles.medItemCard}>
                    <View style={styles.medItemHeader}>
                      <View style={styles.medItemTitleCol}>
                        <Text style={[typography.body, styles.medNameAsWritten]}>
                          {item.nameAsWritten}
                        </Text>
                        {item.normalizedMedicineName &&
                          item.normalizedMedicineName !== item.nameAsWritten && (
                            <Text style={styles.medNormalizedName}>
                              Generic: {item.normalizedMedicineName}
                            </Text>
                          )}
                      </View>
                      <Badge
                        label={item.isActiveMedication ? 'Active Regimen' : 'Historical'}
                        variant={item.isActiveMedication ? 'success' : 'neutral'}
                      />
                    </View>

                    <View style={styles.medMetaRow}>
                      {item.dosageForm ? (
                        <Text style={styles.medMetaText}>Form: {item.dosageForm}</Text>
                      ) : null}
                      {item.strength ? (
                        <Text style={styles.medMetaText}>• Strength: {item.strength}</Text>
                      ) : null}
                      {item.frequencyText ? (
                        <Text style={styles.medMetaText}>• {item.frequencyText}</Text>
                      ) : null}
                      {item.durationText ? (
                        <Text style={styles.medMetaText}>• {item.durationText}</Text>
                      ) : null}
                    </View>

                    {item.instructions ? (
                      <Text style={styles.medInstructions}>
                        Note: {item.instructions}
                      </Text>
                    ) : null}
                  </Card>
                ))}
              </View>
            )}

            {/* Source Document Section */}
            {eventDetail.sourceDocument && (
              <Card variant="muted" style={styles.sourceDocCard}>
                <Text style={styles.sectionHeading}>Original Evidence Document</Text>
                <Text style={[typography.caption, styles.docMetaCaption]}>
                  {eventDetail.sourceDocument.originalFilename} •{' '}
                  {(eventDetail.sourceDocument.fileSizeBytes / 1024).toFixed(1)} KB •{' '}
                  {eventDetail.sourceDocument.mimeType}
                </Text>

                {!showDocumentPreview ? (
                  <Button
                    title="View Original Document"
                    variant="outline"
                    onPress={handleOpenDocument}
                    style={styles.openDocButton}
                  />
                ) : (
                  <View style={styles.previewContainer}>
                    {loadingDoc ? (
                      <View style={styles.docLoadingBox}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={[typography.caption, styles.loadingDocText]}>
                          Requesting secure short-lived preview token...
                        </Text>
                      </View>
                    ) : docError ? (
                      <View style={styles.docErrorBox}>
                        <Text style={[typography.caption, styles.docErrorText]}>
                          {docError}
                        </Text>
                        <Button
                          title="Retry Viewing"
                          variant="outline"
                          size="sm"
                          onPress={handleOpenDocument}
                          style={styles.retryDocBtn}
                        />
                      </View>
                    ) : documentUrlInfo ? (
                      <DocumentPreview
                        filename={documentUrlInfo.originalFilename}
                        mimeType={documentUrlInfo.mimeType}
                        signedUrl={documentUrlInfo.signedUrl}
                        pageCount={eventDetail.sourceDocument.pageCount || 1}
                      />
                    ) : null}
                  </View>
                )}
              </Card>
            )}

            <View style={styles.safetyFooter}>
              <Text style={styles.safetyFooterText}>
                Clinical Data Guarantee: All records shown are verified and confirmed by the patient. Unreviewed drafts are strictly excluded.
              </Text>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  closeButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
  headerTitle: {
    ...typography.h3,
    maxWidth: 220,
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 50,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorCard: {
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  errorTitle: {
    marginBottom: spacing.xs,
    color: colors.danger,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    minWidth: 120,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  provenanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  eventTypeBadge: {
    marginRight: spacing.xs,
  },
  statusBadge: {
    marginRight: spacing.xs,
  },
  eventTitle: {
    marginBottom: spacing.md,
  },
  dateCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateCol: {
    flex: 1,
  },
  dateMetaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValue: {
    color: colors.primary,
  },
  uploadedDateValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  datePrecisionNote: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionHeading: {
    ...typography.h3,
    fontSize: 16,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  summaryText: {
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 130,
  },
  infoValue: {
    ...typography.caption,
    flex: 1,
    color: colors.textPrimary,
  },
  medicationsSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: 2,
  },
  medicationNotice: {
    marginBottom: spacing.sm,
    color: colors.textMuted,
  },
  medItemCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  medItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  medItemTitleCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  medNameAsWritten: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  medNormalizedName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  medMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  medMetaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  medInstructions: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  sourceDocCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  docMetaCaption: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  openDocButton: {
    marginTop: spacing.xs,
  },
  previewContainer: {
    marginTop: spacing.sm,
  },
  docLoadingBox: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  loadingDocText: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  docErrorBox: {
    padding: spacing.md,
    backgroundColor: colors.dangerLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  docErrorText: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryDocBtn: {
    marginTop: spacing.xs,
  },
  safetyFooter: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
  },
  safetyFooterText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
