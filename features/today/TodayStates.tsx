import React from 'react';
import { Card } from '../../design/components/Containers/Card';
import { EmptyState } from '../../design/components/Feedback/EmptyState';
import { t } from '../../design/strings';

// First use: the existing first-run Today stays until S05 (Phase 6), on the new tokens.
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
