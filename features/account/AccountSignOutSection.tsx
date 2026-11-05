import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, SectionHeader, Text } from '../../design/components';
import { color, radius, space } from '../../design/tokens';
import { t } from '../../design/strings';

export interface SignOutSectionProps {
  isConfirmingSignOut: boolean;
  isSigningOut: boolean;
  onRequestSignOut: () => void;
  onCancelSignOut: () => void;
  onConfirmSignOut: () => void;
}

export function SignOutSection({
  isConfirmingSignOut,
  isSigningOut,
  onRequestSignOut,
  onCancelSignOut,
  onConfirmSignOut,
}: SignOutSectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader title={t('profile.manageTitle')} />
      <Card>
        <Text variant="callout" tone="secondary" style={styles.body}>
          {t('profile.manageBody')}
        </Text>

        {isConfirmingSignOut ? (
          <View style={styles.confirmBox}>
            <Text variant="title3" tone="danger">
              {t('profile.confirmSignOutTitle')}
            </Text>
            <Text variant="callout" tone="secondary" style={styles.confirmBody}>
              {t('profile.confirmSignOutBody')}
            </Text>
            <View style={styles.buttonRow}>
              <View style={styles.buttonCell}>
                <Button
                  label={t('common.cancel')}
                  variant="secondary"
                  onPress={onCancelSignOut}
                  disabled={isSigningOut}
                  fullWidth
                />
              </View>
              <View style={styles.buttonCell}>
                <Button
                  label={t('profile.signOutConfirm')}
                  variant="danger"
                  onPress={onConfirmSignOut}
                  loading={isSigningOut}
                  fullWidth
                />
              </View>
            </View>
          </View>
        ) : (
          <Button
            label={t('profile.signOut')}
            variant="danger"
            onPress={onRequestSignOut}
            fullWidth
          />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: space.xl,
    gap: space.md,
  },
  body: {
    marginBottom: space.md,
  },
  confirmBox: {
    backgroundColor: color.tone.danger.bg,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
  },
  confirmBody: {
    marginBottom: space.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  buttonCell: {
    flex: 1,
  },
});
