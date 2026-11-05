import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../design/components/Containers/Card';
import { EmptyState } from '../../design/components/Feedback/EmptyState';
import { ErrorState } from '../../design/components/Feedback/ErrorState';
import { Skeleton, SkeletonGroup } from '../../design/components/Feedback/Skeleton';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { space } from '../../design/tokens';
import { t } from '../../design/strings';

// Loading: three calm blocks, announced once as "Loading".
export function TodayLoading() {
  return (
    <View style={styles.stack} testID="today-loading">
      <SkeletonGroup>
        <Skeleton shape="block" />
        <Skeleton shape="block" />
        <Skeleton shape="block" />
      </SkeletonGroup>
    </View>
  );
}

// Error: a card-level message with retry, so the rest of the screen stays usable.
export function TodayError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card testID="today-error">
      <ErrorState onRetry={onRetry} testID="today-error-state" />
    </Card>
  );
}

export interface TodayNewUserProps {
  onScan: () => void;
  onAddManual: () => void;
}

export function TodayNewUser({ onScan, onAddManual }: TodayNewUserProps) {
  return (
    <Card testID="today-new-user">
      <EmptyState
        icon="medkit"
        title={t('today.newUserTitle')}
        body={t('today.newUserBody')}
        action={{ label: t('today.scanPrescription'), onPress: onScan }}
        secondaryAction={{ label: t('today.addManually'), onPress: onAddManual }}
        testID="today-new-user-state"
      />
    </Card>
  );
}

export function TodayNothingDue() {
  return (
    <EmptyState
      icon="checkmark-circle"
      title={t('today.nothingDueTitle')}
      body={t('today.nothingDueBody')}
      testID="today-nothing-due"
    />
  );
}

export function TodayAllDone() {
  return (
    <Card testID="today-all-done">
      <View style={styles.allDone}>
        <Icon name="checkmark-circle" size="lg" tone="success" />
        <View style={styles.allDoneText}>
          <Text variant="title3">{t('today.allDoneTitle')}</Text>
          <Text variant="callout" tone="secondary">
            {t('today.allDoneBody')}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space.md,
    marginTop: space.sm,
  },
  allDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  allDoneText: {
    flex: 1,
    gap: space.xxs,
  },
});
