import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Button } from '../Actions/Button';
import { Text } from '../Foundations/Text';
import { color, elevation, radius, space } from '../../tokens';
import { useReduceMotion } from './useReduceMotion';

export interface DialogProps {
  visible: boolean;
  title: string;
  body?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  // Falls back to onClose when a secondary label is shown without its own handler.
  onSecondary?: () => void;
  destructive?: boolean;
  onClose: () => void;
  testID?: string;
}

// The backdrop is not pressable: a dialog has to be answered with one of its buttons.
export function Dialog({
  visible,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  destructive = false,
  onClose,
  testID,
}: DialogProps) {
  const reduceMotion = useReduceMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <View accessible={false} importantForAccessibility="no" style={styles.scrim} />
        <View accessibilityViewIsModal testID={testID} style={styles.card}>
          <Text variant="title2" tone="primary" accessibilityRole="header" testID={testID && `${testID}-title`}>
            {title}
          </Text>
          {body !== undefined && (
            <Text variant="body" tone="secondary" style={styles.body} testID={testID && `${testID}-body`}>
              {body}
            </Text>
          )}
          <View style={styles.actions}>
            <Button
              label={primaryLabel}
              onPress={onPrimary}
              variant={destructive ? 'danger' : 'primary'}
              fullWidth
              testID={testID && `${testID}-primary`}
            />
            {secondaryLabel !== undefined && (
              <Button
                label={secondaryLabel}
                onPress={onSecondary ?? onClose}
                variant="secondary"
                fullWidth
                testID={testID && `${testID}-secondary`}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: color.text.primary,
    opacity: 0.4,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: color.bg.card,
    borderRadius: radius.xl,
    padding: space.xl,
    ...elevation.raised,
  },
  body: {
    marginTop: space.sm,
  },
  actions: {
    marginTop: space.xl,
    gap: space.sm,
  },
});
