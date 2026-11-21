import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { darkCardHighlight, layout, radius } from '../../tokens';
import { useTheme } from '../../theme';

export interface GlassCardProps {
  children: React.ReactNode;
  /** Card padding; the spec's 16 by default. */
  padding?: number;
  /** 'tile' uses the 18 radius of Quick Action tiles; 'card' the 22 of cards. */
  shape?: 'card' | 'tile';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// v4 glass card: translucent fill, white edge with a hairline (light) or a blue edge and an
// inset top highlight (dark), soft shadow. Blur behind it on web only, for now.
export function GlassCard({ children, padding = layout.cardPadding, shape = 'card', style, testID }: GlassCardProps) {
  const { name, color: c, shadow } = useTheme();
  return (
    <View
      testID={testID}
      style={[
        styles.card,
        shadow.card,
        {
          padding,
          borderRadius: shape === 'tile' ? radius.tile : radius.card,
          backgroundColor: c.bg.glass,
          borderColor: name === 'light' ? c.bg.glassHairline : c.bg.glassEdge,
          borderTopColor: name === 'dark' ? darkCardHighlight : c.bg.glassHairline,
        },
        Platform.OS === 'web' ? ({ backdropFilter: 'blur(22px)' } as object) : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth * 2 },
});
