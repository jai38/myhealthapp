import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { ListGroup } from '../../design/components/Containers/ListGroup';
import { ListRow } from '../../design/components/Containers/ListRow';
import { SectionHeader } from '../../design/components/Containers/SectionHeader';
import { MedicineIcon } from '../../design/components/Foundations/MedicineIcon';
import { space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { MedicationRecord } from '../../services/medications/medication-service';
import { medicineFormFor } from './todaySections';

export interface TodayAsNeededProps {
  medications: MedicationRecord[];
  onTookDose: (med: MedicationRecord) => void;
}

// Medicines taken on demand. Taking one is a user action; nothing is marked automatically.
export function TodayAsNeeded({ medications, onTookDose }: TodayAsNeededProps) {
  return (
    <View style={styles.section} testID="today-as-needed">
      <SectionHeader title={t('today.asNeededTitle')} />
      <ListGroup>
        {medications.map((med) => (
          <ListRow
            key={med.id}
            title={med.nameAsWritten}
            subtitle={med.strength ?? undefined}
            leading={<MedicineIcon form={medicineFormFor(med.dosageForm)} />}
            trailing={
              <Button
                label={t('today.tookDose')}
                variant="secondary"
                onPress={() => onTookDose(med)}
                testID={`today-as-needed-${med.id}`}
              />
            }
          />
        ))}
      </ListGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: space.sm,
  },
});
