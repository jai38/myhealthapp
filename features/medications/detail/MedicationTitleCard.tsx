import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../design/components/Containers/Card';
import { StatusPill } from '../../../design/components/Trust/StatusPill';
import { Text } from '../../../design/components/Foundations/Text';
import { t } from '../../../design/strings';
import { space } from '../../../design/tokens';
import type { MedicationDetail } from '../../../services/medications/medication-service';
import { MEDICATION_STATUS_DISPLAY } from './detailDisplay';

export interface MedicationTitleCardProps {
  medication: MedicationDetail;
}

export function MedicationTitleCard({ medication }: MedicationTitleCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.statusRow}>
        <StatusPill display={MEDICATION_STATUS_DISPLAY[medication.status]} />
        {medication.dosageForm ? (
          <Text variant="overline" tone="tertiary">
            {medication.dosageForm}
          </Text>
        ) : null}
      </View>

      <Text variant="title2">{medication.nameAsWritten}</Text>

      {medication.normalizedMedicineName ? (
        <Text variant="callout" tone="secondary" style={styles.spaced}>
          {t('medicines.detail.genericName', { name: medication.normalizedMedicineName })}
        </Text>
      ) : null}

      {medication.strength ? (
        <Text variant="callout" tone="secondary" style={styles.spaced}>
          {t('medicines.detail.strength', { strength: medication.strength })}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  spaced: {
    marginTop: space.xxs,
  },
});
