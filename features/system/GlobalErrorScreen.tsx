import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../design/components/Foundations/Screen';
import { Text } from '../../design/components/Foundations/Text';
import { ErrorState } from '../../design/components/Feedback/ErrorState';
import { space } from '../../design/tokens';
import { t } from '../../design/strings';
import { getGlobalErrorCopy, GlobalErrorVariant } from './globalErrorCopy';

export { getGlobalErrorCopy };
export type { GlobalErrorVariant };

export interface GlobalErrorScreenProps {
  variant: GlobalErrorVariant;
  onRetry: () => void;
  retrying?: boolean;
  message?: string;
  // Opaque ID from createSupportCode(). Never put health data or error text here.
  supportCode?: string;
}

export const GlobalErrorScreen: React.FC<GlobalErrorScreenProps> = ({
  variant,
  onRetry,
  retrying = false,
  message,
  supportCode,
}) => {
  const { title, body } = getGlobalErrorCopy(variant, message);

  return (
    <Screen testID="global-error">
      <View style={styles.center}>
        <ErrorState
          title={title}
          body={body}
          onRetry={onRetry}
          retrying={retrying}
          testID="global-error-state"
        />
        {supportCode ? (
          <View style={styles.code}>
            <Text variant="caption" tone="secondary" align="center" testID="global-error-code">
              {t('globalError.supportCode', { code: supportCode })}
            </Text>
            <Text variant="caption" tone="secondary" align="center">
              {t('globalError.supportHint')}
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  code: {
    gap: space.xxs,
    alignItems: 'center',
  },
});
