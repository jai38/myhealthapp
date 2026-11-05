import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Icon, StatusPill, Text } from '../../design/components';
import type { StatusDisplay } from '../../design/status';
import { color, radius, size, space } from '../../design/tokens';
import { t } from '../../design/strings';

const VERIFIED_PILL: StatusDisplay = {
  labelKey: 'profile.verifiedAccount',
  tone: 'success',
  variant: 'soft',
  icon: 'shield-checkmark-outline',
};

const UNLINKED_PILL: StatusDisplay = {
  labelKey: 'profile.unlinked',
  tone: 'neutral',
  variant: 'soft',
  icon: 'ellipse-outline',
};

export interface SignedInProfileCardProps {
  initials: string;
  displayName: string;
  email: string;
}

export function SignedInProfileCard({ initials, displayName, email }: SignedInProfileCardProps) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: color.bg.tintBlue }]}>
          <Text variant="title2" tone="link">
            {initials}
          </Text>
        </View>
        <View style={styles.info}>
          <Text variant="title3">{displayName}</Text>
          <Text variant="callout" tone="secondary">
            {email}
          </Text>
          <View style={styles.pill}>
            <StatusPill display={VERIFIED_PILL} />
          </View>
        </View>
      </View>
    </Card>
  );
}

export interface GuestProfileCardProps {
  onSignIn: () => void;
}

export function GuestProfileCard({ onSignIn }: GuestProfileCardProps) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: color.bg.subtle }]}>
          <Icon name="person-outline" size="lg" tone="secondary" />
        </View>
        <View style={styles.info}>
          <Text variant="title3">{t('profile.guestName')}</Text>
          <Text variant="callout" tone="secondary">
            {t('profile.guestDevice')}
          </Text>
          <View style={styles.pill}>
            <StatusPill display={UNLINKED_PILL} />
          </View>
        </View>
      </View>
      <Text variant="callout" tone="secondary" style={styles.intro}>
        {t('profile.signInIntro')}
      </Text>
      <Button label={t('profile.signInOrRegister')} onPress={onSignIn} fullWidth />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  avatar: {
    width: size.tileLg,
    height: size.tileLg,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: space.xxs,
  },
  pill: {
    marginTop: space.xs,
  },
  intro: {
    marginTop: space.md,
    marginBottom: space.lg,
  },
});
