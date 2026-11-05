import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { color, space } from '../../tokens';
import { listRowLayout } from './containerStyle';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  testID?: string;
}

export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  showChevron,
  testID,
}: ListRowProps) {
  const chevron = showChevron ?? onPress !== undefined;
  const label = subtitle !== undefined ? `${title}, ${subtitle}` : title;

  const content = (
    <>
      {leading}
      <View style={styles.text}>
        <Text variant="title3" tone="primary" testID={testID && `${testID}-title`}>
          {title}
        </Text>
        {subtitle !== undefined && (
          <Text variant="callout" tone="secondary" testID={testID && `${testID}-subtitle`}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
      {chevron && <Icon name="chevron-forward" size="md" tone="secondary" />}
    </>
  );

  if (onPress === undefined) {
    return (
      <View testID={testID} accessible accessibilityLabel={label} style={[listRowLayout, styles.row]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [listRowLayout, styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  pressed: {
    backgroundColor: color.bg.subtle,
  },
  text: {
    flex: 1,
  },
});
