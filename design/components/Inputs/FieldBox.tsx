import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text } from '../Foundations/Text';
import { space } from '../../tokens';
import {
  FIELD_HALO_WIDTH,
  fieldColors,
  fieldHaloColor,
  fieldLayout,
  fieldPaddingFor,
} from './inputStyle';
import type { FieldState } from './inputStyle';

export interface FieldBoxProps {
  state: FieldState;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// The shared field shell: rounded box, state border, and the soft focus ring.
export function FieldBox({ state, children, style, testID }: FieldBoxProps) {
  const colors = fieldColors(state);
  return (
    <View style={[styles.halo, { borderColor: fieldHaloColor(state) }]}>
      <View
        testID={testID}
        style={[
          styles.box,
          {
            borderColor: colors.border,
            borderWidth: colors.borderWidth,
            backgroundColor: colors.bg,
            paddingHorizontal: fieldPaddingFor(colors.borderWidth),
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export interface FieldLabelProps {
  children: string;
}

// Small slate label above every field, like iOS forms.
export function FieldLabel({ children }: FieldLabelProps) {
  return (
    <Text variant="caption" tone="secondary" style={styles.label}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  halo: {
    // The ring sits outside the field, so the field still lines up with its label.
    margin: -FIELD_HALO_WIDTH,
    borderWidth: FIELD_HALO_WIDTH,
    borderRadius: fieldLayout.borderRadius + FIELD_HALO_WIDTH,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: fieldLayout.minHeight,
    borderRadius: fieldLayout.borderRadius,
  },
  label: {
    fontWeight: '600',
  },
});
