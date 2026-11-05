import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../Actions/Button';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { color, space } from '../../tokens';
import { t } from '../../strings';

export interface OfflineBannerProps {
  // Already formatted by the caller, for example "09:40".
  lastUpdated?: string;
  // When given, shows a Retry button that re-checks the connection.
  onRetry?: () => void;
  retrying?: boolean;
  testID?: string;
}

// Text on bg.subtle uses text.primary or text.secondary only.
export function OfflineBanner({ lastUpdated, onRetry, retrying = false, testID }: OfflineBannerProps) {
  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.strip}
    >
      <Icon
        name="cloud-offline-outline"
        size="md"
        tone="secondary"
        testID={testID && `${testID}-icon`}
      />
      <View style={styles.copy}>
        <Text variant="bodyStrong" tone="primary" testID={testID && `${testID}-title`}>
          {t('feedback.offlineTitle')}
        </Text>
        <Text variant="caption" tone="secondary" testID={testID && `${testID}-body`}>
          {t('feedback.offlineBody')}
        </Text>
        {lastUpdated !== undefined && (
          <Text variant="caption" tone="secondary" testID={testID && `${testID}-updated`}>
            {t('feedback.lastUpdated', { time: lastUpdated })}
          </Text>
        )}
      </View>
      {onRetry !== undefined && (
        <Button
          label={t('common.retry')}
          variant="secondary"
          onPress={onRetry}
          loading={retrying}
          accessibilityHint={t('feedback.offlineRetryHint')}
          testID={testID && `${testID}-retry`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: color.bg.subtle,
  },
  copy: {
    flex: 1,
    gap: space.xxs,
  },
});
