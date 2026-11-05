import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { cardStyle } from './containerStyle';

interface CardBaseProps {
  variant?: 'plain' | 'hero';
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// A label is required whenever the card is pressable.
export type CardProps = CardBaseProps &
  (
    | { onPress?: undefined; accessibilityLabel?: undefined }
    | { onPress: () => void; accessibilityLabel: string }
  );

export function Card({
  variant = 'plain',
  children,
  onPress,
  accessibilityLabel,
  style,
  testID,
}: CardProps) {
  const base = cardStyle[variant];

  if (onPress === undefined) {
    return (
      <View testID={testID} style={[base, style]}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, pressed && { opacity: 0.8 }, style]}
    >
      {children}
    </Pressable>
  );
}
