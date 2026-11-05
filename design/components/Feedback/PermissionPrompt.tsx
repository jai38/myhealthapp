import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../Actions/Button';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import type { IconName } from '../Foundations/iconNames';
import { color, elevation, radius, size, space } from '../../tokens';
import { t } from '../../strings';

export interface PermissionPromptProps {
  icon: IconName;
  title: string;
  body: string;
  // Says what still works without the permission.
  stillWorks?: string;
  state: 'ask' | 'denied';
  onAllow: () => void;
  onOpenSettings: () => void;
  onNotNow: () => void;
  testID?: string;
}

export function PermissionPrompt({
  icon,
  title,
  body,
  stillWorks,
  state,
  onAllow,
  onOpenSettings,
  onNotNow,
  testID,
}: PermissionPromptProps) {
  const denied = state === 'denied';

  return (
    <View testID={testID} style={styles.card}>
      <View style={styles.iconTile}>
        <Icon name={icon} size="lg" tone="source" testID={testID && `${testID}-icon`} />
      </View>
      <Text variant="title3" accessibilityRole="header" testID={testID && `${testID}-title`}>
        {title}
      </Text>
      <Text variant="body" tone="secondary" testID={testID && `${testID}-body`}>
        {body}
      </Text>
      {stillWorks !== undefined && (
        <View style={styles.stillWorks}>
          <Icon
            name="information-circle-outline"
            size="sm"
            tone="secondary"
            testID={testID && `${testID}-still-icon`}
          />
          <Text variant="caption" tone="secondary" style={styles.stillWorksText} testID={testID && `${testID}-still-works`}>
            {stillWorks}
          </Text>
        </View>
      )}
      <Button
        label={denied ? t('permission.openSettings') : t('permission.allow')}
        onPress={denied ? onOpenSettings : onAllow}
        fullWidth
        testID={testID && `${testID}-primary`}
      />
      <Button
        label={t('permission.notNow')}
        onPress={onNotNow}
        variant="text"
        testID={testID && `${testID}-not-now`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.bg.card,
    borderRadius: radius.lg,
    padding: space.xl,
    gap: space.md,
    ...elevation.card,
  },
  iconTile: {
    width: size.tileLg,
    height: size.tileLg,
    borderRadius: radius.full,
    backgroundColor: color.bg.tintTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stillWorks: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.xs,
  },
  stillWorksText: {
    flex: 1,
  },
});
