import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Disclaimer } from '../../../design/components/Trust/Disclaimer';
import { SourceLabel } from '../../../design/components/Trust/SourceLabel';
import { StatusPill } from '../../../design/components/Trust/StatusPill';
import { VerificationLabel } from '../../../design/components/Trust/VerificationLabel';
import { Text } from '../../../design/components/Foundations/Text';
import { t } from '../../../design/strings';
import { space } from '../../../design/tokens';
import { TextAction } from './TextAction';
import { CLINICAL_REVIEW_PILL } from './reviewDisplay';

export interface ReviewHeaderProps {
  onDiscard: () => void;
}

// Title, provenance labels and the AI-draft notice. Nothing here changes data.
export function ReviewHeader({ onDiscard }: ReviewHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <TextAction
          label={t('prescriptions.review.discard')}
          icon="close"
          onPress={onDiscard}
          accessibilityLabel={t('prescriptions.review.discardLabel')}
        />
        <StatusPill display={CLINICAL_REVIEW_PILL} />
      </View>

      <Text variant="title2" tone="primary" accessibilityRole="header">
        {t('prescriptions.review.title')}
      </Text>
      <Text variant="callout" tone="secondary">
        {t('prescriptions.review.subtitle')}
      </Text>

      <View style={styles.labels}>
        <SourceLabel kind="fromDocument" />
        <VerificationLabel verified={false} />
      </View>

      <Disclaimer text={t('prescriptions.review.checkNotice')} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: space.sm,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
});
