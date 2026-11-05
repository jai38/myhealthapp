import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../Actions/Button';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { space } from '../../tokens';
import { t } from '../../strings';

export interface ErrorStateProps {
  title?: string;
  body?: string;
  onRetry: () => void;
  retrying?: boolean;
  testID?: string;
}

// Calm by design: caution tone, no red, and the copy says nothing was lost.
export function ErrorState({
  title = t('feedback.errorTitle'),
  body = t('feedback.errorBody'),
  onRetry,
  retrying = false,
  testID,
}: ErrorStateProps) {
  return (
    <View testID={testID} style={styles.root}>
      <Icon
        name="alert-circle-outline"
        size="lg"
        tone="caution"
        testID={testID && `${testID}-icon`}
      />
      <Text
        variant="title3"
        align="center"
        accessibilityRole="header"
        testID={testID && `${testID}-title`}
      >
        {title}
      </Text>
      <Text variant="body" tone="secondary" align="center" testID={testID && `${testID}-body`}>
        {body}
      </Text>
      <Button
        label={t('common.retry')}
        onPress={onRetry}
        loading={retrying}
        testID={testID && `${testID}-retry`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingVertical: space.xxl,
    paddingHorizontal: space.lg,
    gap: space.md,
  },
});
