import React from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '../../tokens';
import { useTheme } from '../../theme';
import { Text } from '../Foundations/Text';

export interface GroupHeaderProps {
  title: string;
  /** Shown beside the title, e.g. "2 of 3". Omit for none. */
  count?: string;
  testID?: string;
}

// v4 section header: Title 3 (20/25 bold) with a tertiary count, e.g. "Morning  1 of 3".
export function GroupHeader({ title, count, testID }: GroupHeaderProps) {
  const { color: c } = useTheme();
  return (
    <View testID={testID} style={styles.row}>
      <Text variant="title2" style={{ color: c.text.primary }}>
        {title}
      </Text>
      {count ? (
        <Text variant="caption" tabular style={{ color: c.text.tertiary }}>
          {count}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, flexWrap: 'wrap' },
});
