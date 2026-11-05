import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IconButton } from '../Actions/IconButton';
import { Text } from '../Foundations/Text';
import { color, elevation, radius, space } from '../../tokens';
import { t } from '../../strings';
import { SHEET_MAX_HEIGHT_RATIO } from './containerStyle';
import { useReduceMotion } from './useReduceMotion';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  testID?: string;
}

export function BottomSheet({ visible, onClose, title, children, testID }: BottomSheetProps) {
  const reduceMotion = useReduceMotion();
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
          style={styles.backdrop}
          testID={testID && `${testID}-backdrop`}
        />
        <View
          accessibilityViewIsModal
          testID={testID}
          style={[styles.sheet, { maxHeight: height * SHEET_MAX_HEIGHT_RATIO }]}
        >
          <View accessible={false} importantForAccessibility="no" style={styles.grabHandle} />
          <View style={styles.header}>
            {title !== undefined ? (
              <Text variant="title2" tone="primary" style={styles.title} testID={testID && `${testID}-title`}>
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
          <ScrollView bounces={false} style={styles.body}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: color.text.primary,
    opacity: 0.4,
  },
  sheet: {
    backgroundColor: color.bg.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    ...elevation.sheet,
  },
  grabHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: color.border.input,
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
