import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../design/components/Containers/Card';
import { SectionHeader } from '../../design/components/Containers/SectionHeader';
import { SegmentedControl } from '../../design/components/Containers/SegmentedControl';
import { EmptyState } from '../../design/components/Feedback/EmptyState';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { t } from '../../design/strings';
import type { StringKey } from '../../design/strings';
import { color, radius, space } from '../../design/tokens';
import { MedicationRecord } from '../../services/medications/medication-service';
import { formatTime12Hour } from './reminder-time-utils';

export type TabType = 'active' | 'inactive' | 'past';

const STATUS_KEYS: Record<string, StringKey> = {
  ACTIVE: 'medicines.statusActive',
  INACTIVE: 'medicines.statusPrescribed',
  PAUSED: 'medicines.statusPaused',
  COMPLETED: 'medicines.statusCompleted',
  DISCONTINUED: 'medicines.statusDiscontinued',
};

export function MedicationList({
  activeTab,
  setActiveTab,
  activeMedicationsCount,
  inactiveMedicationsCount,
  pastMedicationsCount,
  filteredMedications,
  onAddMedicine,
  openMedicationModal,
}: {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeMedicationsCount: number;
  inactiveMedicationsCount: number;
  pastMedicationsCount: number;
  filteredMedications: MedicationRecord[];
  onAddMedicine: () => void;
  openMedicationModal: (id: string) => void;
}) {
  return (
    <View style={styles.root} testID="medicines-list">
      <SectionHeader title={t('medicines.listTitle')} />
      <Text variant="caption" tone="secondary">
        {t('medicines.listSubtitle')}
      </Text>

      <SegmentedControl<TabType>
        testID="medicines-tabs"
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { value: 'active', label: t('medicines.tabActive', { count: activeMedicationsCount }) },
          {
            value: 'inactive',
            label: t('medicines.tabPrescribed', { count: inactiveMedicationsCount }),
          },
          { value: 'past', label: t('medicines.tabPast', { count: pastMedicationsCount }) },
        ]}
      />

      {filteredMedications.length === 0 ? (
        <EmptyState
          icon="medkit-outline"
          title={
            activeTab === 'active'
              ? t('medicines.emptyActiveTitle')
              : activeTab === 'inactive'
              ? t('medicines.emptyPrescribedTitle')
              : t('medicines.emptyPastTitle')
          }
          body={
            activeTab === 'active'
              ? t('medicines.emptyActiveBody')
              : activeTab === 'inactive'
              ? t('medicines.emptyPrescribedBody')
              : t('medicines.emptyPastBody')
          }
          action={{ label: t('medicines.addManually'), onPress: onAddMedicine }}
          testID="medicines-list-empty"
        />
      ) : (
        filteredMedications.map((item) => (
          <MedicationCard
            key={item.id}
            med={item}
            onPress={() => openMedicationModal(item.id)}
          />
        ))
      )}
    </View>
  );
}

function MedicationCard({ med, onPress }: { med: MedicationRecord; onPress: () => void }) {
  const statusKey = STATUS_KEYS[med.status];
  const reminderTimes = med.reminderTimes ?? [];

  return (
    <Card onPress={onPress} accessibilityLabel={med.nameAsWritten} testID={`medicines-card-${med.id}`}>
      <View style={styles.cardHeader}>
        <View style={styles.cardText}>
          <Text variant="title3">{med.nameAsWritten}</Text>
          {med.normalizedMedicineName ? (
            <Text variant="caption" tone="secondary">
              {t('medicines.generic', { name: med.normalizedMedicineName })}
            </Text>
          ) : null}
        </View>
        <Text variant="caption" tone="link">
          {statusKey ? t(statusKey) : med.status}
        </Text>
      </View>

      {med.strength ? (
        <Text variant="callout" tone="secondary">
          {t('medicines.strength', { strength: med.strength, form: med.dosageForm })}
        </Text>
      ) : null}

      {med.prescribedInstructions ? (
        <Text variant="callout" tone="secondary" numberOfLines={2}>
          {med.prescribedInstructions}
        </Text>
      ) : null}

      {reminderTimes.length > 0 ? (
        <View style={styles.reminderRow}>
          <Text variant="caption" tone="secondary">
            {t('medicines.reminders')}
          </Text>
          <View style={styles.chips}>
            {reminderTimes.map((time, idx) => (
              <View key={idx} style={styles.chip}>
                <Icon name="notifications-outline" size="sm" tone="link" />
                <Text variant="caption" tone="link">
                  {formatTime12Hour(time)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : med.status === 'INACTIVE' ? (
        <Text variant="caption" tone="link">
          {t('medicines.tapToActivate')}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  cardText: {
    flex: 1,
    gap: space.xxs,
  },
  reminderRow: {
    gap: space.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: color.bg.tintBlue,
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
  },
});
