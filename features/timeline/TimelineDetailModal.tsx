import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { IconButton } from '../../design/components/Actions/IconButton';
import { Card } from '../../design/components/Containers/Card';
import { Screen } from '../../design/components/Foundations/Screen';
import { Spacer } from '../../design/components/Foundations/Spacer';
import { Text } from '../../design/components/Foundations/Text';
import { Disclaimer } from '../../design/components/Trust/Disclaimer';
import { UncertainMarker } from '../../design/components/Trust/UncertainMarker';
import { VerificationLabel } from '../../design/components/Trust/VerificationLabel';
import { ErrorState } from '../../design/components/Feedback/ErrorState';
import { TopBar } from '../../design/components/Navigation/TopBar';
import { color, radius, space } from '../../design/tokens';
import { t } from '../../design/strings';
import {
  TimelineDetail,
  TimelineDocumentUrl,
  timelineService,
  formatMedicalEventDate,
} from '../../services/timeline/timeline-service';
import {
  TimelineDetailClinic,
  TimelineDetailDates,
  TimelineDetailMedications,
  TimelineDetailSource,
} from './TimelineDetailSections';

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
      setError(err?.message || t('records.detail.loadFallback'));
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
      setDocError(err?.message || t('records.detail.docUnavailable'));
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

  const renderDetail = () => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={color.action.primary} />
          <Text variant="callout" tone="secondary" align="center" style={styles.stateText}>
            {t('records.detail.loading')}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <ErrorState
          title={t('records.detail.errorTitle')}
          body={error}
          onRetry={() => eventId && loadDetail(eventId)}
        />
      );
    }

    if (!eventDetail) return null;

    return (
      <>
        <View style={styles.badges}>
          <View style={styles.typePill}>
            <Text variant="caption" tone="link">
              {eventDetail.eventType}
            </Text>
          </View>
          <VerificationLabel verified={eventDetail.isVerified} />
          {eventDetail.dateIsUncertain ? <UncertainMarker inline /> : null}
        </View>

        <Text variant="title1" tone="primary" style={styles.title}>
          {eventDetail.title}
        </Text>

        <TimelineDetailDates
          formatted={dateInfo?.formatted}
          precision={eventDetail.datePrecision}
          uploadedAt={eventDetail.sourceDocument?.uploadedAt}
        />

        <Card style={styles.summaryCard}>
          <Text variant="title3" tone="primary" style={styles.summaryTitle}>
            {t('records.detail.summaryTitle')}
          </Text>
          <Text variant="body" tone="secondary">
            {eventDetail.summary}
          </Text>
        </Card>

        {eventDetail.prescription ? (
          <TimelineDetailClinic prescription={eventDetail.prescription} />
        ) : null}

        {eventDetail.prescription?.items && eventDetail.prescription.items.length > 0 ? (
          <TimelineDetailMedications items={eventDetail.prescription.items} />
        ) : null}

        {eventDetail.sourceDocument ? (
          <TimelineDetailSource
            sourceDocument={eventDetail.sourceDocument}
            showPreview={showDocumentPreview}
            loadingDoc={loadingDoc}
            docError={docError}
            documentUrlInfo={documentUrlInfo}
            onOpenDocument={handleOpenDocument}
          />
        ) : null}

        <Disclaimer text={t('records.detail.guarantee')} />
        <Spacer size="xxl" />
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <Screen
        header={
          <TopBar
            title={t('records.detail.title')}
            right={
              <IconButton
                icon="close"
                accessibilityLabel={t('common.close')}
                onPress={onClose}
              />
            }
          />
        }
      >
        <View style={styles.body}>{renderDetail()}</View>
      </Screen>
    </Modal>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingTop: space.sm,
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxl,
  },
  stateText: {
    marginTop: space.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.xs,
    marginBottom: space.sm,
  },
  typePill: {
    backgroundColor: color.tone.info.bg,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
    borderRadius: radius.full,
  },
  title: {
    marginBottom: space.md,
  },
  summaryCard: {
    marginBottom: space.md,
    gap: space.sm,
  },
  summaryTitle: {
    marginBottom: 0,
  },
});
