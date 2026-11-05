import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { color, radius, size, space } from '../../tokens';
import { t } from '../../strings';
import { initials } from './navStyle';

export interface PatientPillProps {
  name: string;
  onPress?: () => void;
  testID?: string;
}

export function PatientPill({ name, onPress, testID }: PatientPillProps) {
  const body = (
    <>
      <View style={styles.avatar}>
        <Text variant="caption" style={styles.avatarText}>
          {initials(name)}
        </Text>
      </View>
      <Text variant="callout" numberOfLines={1} style={styles.name}>
        {name}
      </Text>
      {onPress ? <Icon name="chevron-down" size="sm" tone="secondary" /> : null}
    </>
  );

  if (!onPress) {
    return (
      <View
        testID={testID}
        accessible
        accessibilityRole="text"
        accessibilityLabel={t('patient.current', { name })}
        style={styles.pill}
      >
        {body}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={t('patient.current', { name })}
      accessibilityHint={t('patient.switch')}
      onPress={onPress}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: size.touchMin,
    maxWidth: '100%',
    paddingLeft: space.xs,
    paddingRight: space.md,
    borderRadius: radius.full,
    backgroundColor: color.bg.subtle,
    gap: space.sm,
  },
  pressed: {
    backgroundColor: color.bg.tintBlue,
  },
  avatar: {
    width: size.avatar,
    height: size.avatar,
    borderRadius: radius.full,
    backgroundColor: color.bg.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: color.tone.info.fg,
  },
  name: {
    color: color.text.primary,
    flexShrink: 1,
  },
});
