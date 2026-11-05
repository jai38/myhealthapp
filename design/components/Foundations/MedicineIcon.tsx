import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { TextTone, ToneName } from '../../tokens';
import { iconSize, medicineFormIcon, resolveIconColor } from './iconNames';
import type { MedicineForm } from './iconNames';

export interface MedicineIconProps {
  form: MedicineForm;
  size?: 'sm' | 'md' | 'lg';
  tone?: TextTone | ToneName;
  color?: string;
  testID?: string;
}

// Decorative: the medicine name next to it carries the meaning.
export function MedicineIcon({ form, size = 'md', tone = 'secondary', color, testID }: MedicineIconProps) {
  return (
    <MaterialCommunityIcons
      name={medicineFormIcon[form]}
      size={iconSize[size]}
      color={color ?? resolveIconColor(tone)}
      accessible={false}
      testID={testID}
    />
  );
}
