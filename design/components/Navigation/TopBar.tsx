import React from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from '../Actions/IconButton';
import { Text } from '../Foundations/Text';
import { size, space } from '../../tokens';
import { t } from '../../strings';

export interface TopBarProps {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  testID?: string;
}

export function TopBar({ title, onBack, right, testID }: TopBarProps) {
  return (
    <View testID={testID} style={styles.bar}>
      <View style={styles.slot}>
        {onBack ? (
          <IconButton
            icon="chevron-back"
            accessibilityLabel={t('common.back')}
            onPress={onBack}
            testID={testID && `${testID}-back`}
          />
        ) : null}
      </View>
      <View style={styles.titleWrap}>
        {title ? (
          <Text
            variant="title3"
            align="center"
            numberOfLines={1}
            accessibilityRole="header"
            testID={testID && `${testID}-title`}
          >
            {title}
          </Text>
        ) : null}
      </View>
      <View style={styles.slot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: size.touchMin,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
  },
  // Each side is one touch target wide, so the title stays centred.
  slot: {
    minWidth: size.touchMin,
    minHeight: size.touchMin,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
});
