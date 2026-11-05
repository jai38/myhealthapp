import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../../design/components/Foundations/Logo';
import { Text } from '../../design/components/Foundations/Text';
import { Button } from '../../design/components/Actions/Button';
import { Card } from '../../design/components/Containers/Card';
import { EmptyState } from '../../design/components/Feedback/EmptyState';
import { color, space } from '../../design/tokens';
import { t } from '../../design/strings';

// Blocking full screens. The caller renders nothing else, so there is no way past them.

export function RequiredUpdateScreen({ onUpdate }: { onUpdate: () => void }) {
  return (
    <SafeAreaView style={styles.root} testID="required-update-screen">
      <Logo variant="mark" size={space.xxxl * 2} />
      <EmptyState
        icon="information-circle-outline"
        title={t('appStatus.requiredTitle')}
        body={t('appStatus.requiredBody')}
        action={{ label: t('appStatus.update'), onPress: onUpdate }}
        testID="required-update"
      />
    </SafeAreaView>
  );
}

export function MaintenanceScreen({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <SafeAreaView style={styles.root} testID="maintenance-screen">
      <Logo variant="mark" size={space.xxxl * 2} />
      <EmptyState
        icon="cloud-offline-outline"
        title={t('appStatus.maintenanceTitle')}
        body={message ?? t('appStatus.maintenanceBody')}
        action={{ label: t('appStatus.tryAgain'), onPress: onRetry }}
        testID="maintenance"
      />
    </SafeAreaView>
  );
}

// Dismissible card shown above the app. "Not now" is remembered for that version only.
export function OptionalUpdateCard({
  onUpdate,
  onDismiss,
}: {
  onUpdate: () => void;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.cardWrap, { paddingTop: insets.top + space.sm }]} testID="optional-update-card">
      <Card>
        <Text variant="title3">{t('appStatus.optionalTitle')}</Text>
        <Text variant="callout" tone="secondary">
          {t('appStatus.optionalBody')}
        </Text>
        <View style={styles.actions}>
          <Button label={t('appStatus.update')} onPress={onUpdate} testID="optional-update-action" />
          <Button
            label={t('appStatus.notNow')}
            onPress={onDismiss}
            variant="text"
            testID="optional-update-dismiss"
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  cardWrap: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    backgroundColor: color.bg.screen,
  },
  actions: {
    marginTop: space.md,
    gap: space.xs,
  },
});
