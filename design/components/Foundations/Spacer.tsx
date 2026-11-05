import React from 'react';
import { View } from 'react-native';
import { space } from '../../tokens';

export interface SpacerProps {
  size: keyof typeof space;
  horizontal?: boolean;
  testID?: string;
}

export function Spacer({ size, horizontal = false, testID }: SpacerProps) {
  const value = space[size];
  return (
    <View
      testID={testID}
      accessible={false}
      style={horizontal ? { width: value } : { height: value }}
    />
  );
}
