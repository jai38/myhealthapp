import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../Actions/Button';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import type { IconName } from '../Foundations/iconNames';
import { color, radius, size, space } from '../../tokens';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  body?: string;
  action?: EmptyStateAction;
  // Used for "Clear all" under a filtered empty list.
  secondaryAction?: EmptyStateAction;
  testID?: string;
}

export function EmptyState({ icon, title, body, action, secondaryAction, testID }: EmptyStateProps) {
  return (
    <View testID={testID} style={styles.root}>
      {icon !== undefined && (
        <View style={styles.iconTile}>
          <Icon name={icon} size="lg" tone="info" testID={testID && `${testID}-icon`} />
        </View>
      )}
      <Text
        variant="title3"
        align="center"
        accessibilityRole="header"
        testID={testID && `${testID}-title`}
      >
        {title}
      </Text>
      {body !== undefined && (
        <Text variant="body" tone="secondary" align="center" testID={testID && `${testID}-body`}>
          {body}
        </Text>
      )}
      {action !== undefined && (
        <Button
          label={action.label}
          onPress={action.onPress}
          testID={testID && `${testID}-action`}
        />
      )}
      {secondaryAction !== undefined && (
        <Button
          label={secondaryAction.label}
          onPress={secondaryAction.onPress}
          variant="text"
          testID={testID && `${testID}-secondary-action`}
        />
      )}
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
  iconTile: {
    width: size.tileLg,
    height: size.tileLg,
    borderRadius: radius.full,
    backgroundColor: color.bg.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
