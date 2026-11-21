import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IconButton } from '../Actions/IconButton';
import { Text } from '../Foundations/Text';
import { elevation, radius, space } from '../../tokens';
import { useTheme } from '../../theme';
import { t } from '../../strings';
import { SHEET_MAX_HEIGHT_RATIO } from './containerStyle';
import { useReduceMotion } from './useReduceMotion';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /**
   * A header with Cancel on the left and this action on the right (S07: Save, disabled until a
   * choice), in place of the close button.
   */
  confirm?: { label: string; onPress: () => void; disabled?: boolean };
  testID?: string;
}

export function BottomSheet({ visible, onClose, title, children, confirm, testID }: BottomSheetProps) {
  const reduceMotion = useReduceMotion();
  const { color: c } = useTheme();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          accessible={false}
          importantForAccessibility="no"
          onPress={onClose}
          style={[styles.backdrop, { backgroundColor: c.text.primary }]}
          testID={testID && `${testID}-backdrop`}
        />
        <View
          accessibilityViewIsModal
          testID={testID}
          style={[
            styles.sheet,
            { maxHeight: height * SHEET_MAX_HEIGHT_RATIO, backgroundColor: c.bg.surface },
          ]}
        >
          <View
            accessible={false}
            importantForAccessibility="no"
            style={[styles.grabHandle, { backgroundColor: c.bg.divider }]}
          />
          {confirm ? (
            <View style={styles.header}>
              <HeaderAction label={t('common.cancel')} onPress={onClose} color={c.text.link} testID={testID && `${testID}-cancel`} />
              <Text
                variant="title3"
                align="center"
                style={[styles.title, { color: c.text.primary }]}
                testID={testID && `${testID}-title`}
              >
                {title ?? ''}
              </Text>
              <HeaderAction
                label={confirm.label}
                onPress={confirm.onPress}
                disabled={confirm.disabled}
                color={confirm.disabled ? c.text.disabled : c.text.link}
                strong
                testID={testID && `${testID}-confirm`}
              />
            </View>
          ) : (
            <View style={styles.header}>
              {title !== undefined ? (
                <Text
                  variant="title2"
                  style={[styles.title, { color: c.text.primary }]}
                  testID={testID && `${testID}-title`}
                >
                  {title}
                </Text>
              ) : (
                <View style={styles.title} />
              )}
              <IconButton
                icon="close"
                accessibilityLabel={t('common.close')}
                onPress={onClose}
                testID={testID && `${testID}-close`}
              />
            </View>
          )}
          <ScrollView bounces={false} style={styles.body}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function HeaderAction({
  label,
  onPress,
  disabled = false,
  color,
  strong = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color: string;
  strong?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.headerAction}
    >
      <Text variant={strong ? 'bodyStrong' : 'body'} numberOfLines={1} style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    minHeight: 48,
    minWidth: 64,
    justifyContent: 'center',
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    opacity: 0.4,
  },
  sheet: {
    // v4: sheets are solid surfaces with the hero's 28 radius.
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    ...elevation.sheet,
  },
  grabHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    marginVertical: space.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  title: {
    flex: 1,
  },
  body: {
    flexShrink: 1,
  },
});
