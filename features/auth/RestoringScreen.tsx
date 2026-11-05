import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Logo } from '../../design/components/Foundations/Logo';
import { color, space } from '../../design/tokens';
import { t } from '../../design/strings';

// Shown while the saved session loads. White with the gradient mark, like the native splash.
export function RestoringScreen() {
  return (
    <View style={styles.root} testID="restoring-screen">
      <Logo variant="mark" size={space.xxxl * 2} testID="restoring-logo" />
      <ActivityIndicator
        size="small"
        color={color.text.tertiary}
        accessibilityLabel={t('auth.restoring')}
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.bg.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginTop: space.xl,
  },
});
