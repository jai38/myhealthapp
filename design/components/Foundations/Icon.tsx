import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { TextTone, ToneName } from '../../tokens';
import { iconSize, resolveIconColor } from './iconNames';
import type { IconName } from './iconNames';

export interface IconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  tone?: TextTone | ToneName;
  // Overrides the tone color, used by tone pills.
  color?: string;
  accessibilityLabel?: string;
  testID?: string;
}

// Decorative unless a label is given.
export function Icon({
  name,
  size = 'md',
  tone = 'primary',
  color,
  accessibilityLabel,
  testID,
}: IconProps) {
  const labelled = accessibilityLabel !== undefined;
  return (
    <Ionicons
      name={name}
      size={iconSize[size]}
      color={color ?? resolveIconColor(tone)}
      accessible={labelled}
      accessibilityRole={labelled ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    />
  );
}
