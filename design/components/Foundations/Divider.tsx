import React from 'react';
import { StyleSheet, View } from 'react-native';
import { color, space } from '../../tokens';

export interface DividerProps {
  inset?: keyof typeof space;
  testID?: string;
}

export function Divider({ inset, testID }: DividerProps) {
  return (
    <View
      testID={testID}
      accessible={false}
      style={[styles.line, inset ? { marginLeft: space[inset] } : null]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.border.subtle,
  },
});
