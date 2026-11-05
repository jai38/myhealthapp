import React from 'react';
import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../design/components/Feedback/EmptyState';
import { color } from '../../design/tokens';
import { t } from '../../design/strings';

export default function HealthPlanScreen() {
  return (
    <View style={styles.root}>
      <EmptyState
        testID="health-plan-empty"
        icon="clipboard-outline"
        title={t('healthPlan.soonTitle')}
        body={t('healthPlan.soonBody')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', backgroundColor: color.bg.screen },
});
