import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, ListGroup, ListRow, SectionHeader, StatusPill, Text } from '../../design/components';
import type { StatusDisplay } from '../../design/status';
import { space } from '../../design/tokens';
import { t } from '../../design/strings';

const ACTIVE_PILL: StatusDisplay = {
  labelKey: 'profile.active',
  tone: 'info',
  variant: 'soft',
  icon: 'checkmark-circle',
};

const HIPAA_PILL: StatusDisplay = {
  labelKey: 'profile.hipaaAligned',
  tone: 'success',
  variant: 'soft',
  icon: 'shield-checkmark-outline',
};

export interface SecuritySectionProps {
  timezone: string;
}

export function SecuritySection({ timezone }: SecuritySectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader title={t('profile.securityTitle')} />
      <View style={styles.pill}>
        <StatusPill display={ACTIVE_PILL} />
      </View>
      <ListGroup>
        <ListRow
          leading={<Icon name="lock-closed-outline" size="md" tone="primary" />}
          title={t('profile.encryptedTitle')}
          subtitle={t('profile.encryptedBody')}
        />
        <ListRow
          leading={<Icon name="time-outline" size="md" tone="primary" />}
          title={t('profile.timezoneTitle')}
          subtitle={t('profile.timezoneBody', { timezone })}
        />
      </ListGroup>
    </View>
  );
}

export interface PrivacySectionProps {
  onOpenLegal: (tab: 'terms' | 'privacy') => void;
}

export function PrivacySection({ onOpenLegal }: PrivacySectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader title={t('profile.privacyTitle')} />
      <View style={styles.pill}>
        <StatusPill display={HIPAA_PILL} />
      </View>
      <Text variant="callout" tone="secondary" style={styles.body}>
        {t('profile.privacyBody')}
      </Text>
      <ListGroup>
        <ListRow
          leading={<Icon name="shield-checkmark-outline" size="md" tone="primary" />}
          title={t('profile.privacyPolicy')}
          onPress={() => onOpenLegal('privacy')}
        />
        <ListRow
          leading={<Icon name="document-text-outline" size="md" tone="primary" />}
          title={t('profile.termsOfService')}
          onPress={() => onOpenLegal('terms')}
        />
      </ListGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: space.xl,
    gap: space.md,
  },
  pill: {
    alignSelf: 'flex-start',
  },
  body: {
    marginBottom: space.xs,
  },
});
