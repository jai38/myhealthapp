import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../Foundations/Icon';
import type { IconName } from '../Foundations/iconNames';
import { iconTileColors, iconTileRadius, iconTileSize } from './containerStyle';
import type { TileTone } from './containerStyle';

export interface IconTileProps {
  icon: IconName;
  tone?: TileTone;
  size?: 'md' | 'lg';
  testID?: string;
}

// Callers should pass filled glyph names (e.g. 'heart', 'medkit', 'document-text') for the category look.
// Decorative: the tile carries no label, so the row or heading next to it names the content.
export function IconTile({ icon, tone = 'blue', size = 'md', testID }: IconTileProps) {
  const colors = iconTileColors(tone);
  const dimension = iconTileSize[size];

  return (
    <View
      testID={testID}
      accessible={false}
      style={[
        styles.tile,
        {
          width: dimension,
          height: dimension,
          borderRadius: iconTileRadius[size],
          backgroundColor: colors.bg,
        },
      ]}
    >
      <Icon
        name={icon}
        size={size === 'lg' ? 'lg' : 'md'}
        color={colors.icon}
        testID={testID && `${testID}-icon`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
