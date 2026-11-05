import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../Foundations/Text';
import { color, radius, size, space } from '../../tokens';
import { textStyles } from '../../typography';
import { t } from '../../strings';
import { TextField } from './TextField';
import { fieldLayout, parseDecimal } from './inputStyle';

export interface NumberUnitFieldProps {
  label: string;
  // Raw text as typed. Never converted or rewritten here.
  value: string;
  onChangeText: (text: string) => void;
  units: string[];
  unit: string;
  onUnitChange: (unit: string) => void;
  helper?: string;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

export function NumberUnitField({
  label,
  value,
  onChangeText,
  units,
  unit,
  onUnitChange,
  helper,
  error,
  disabled = false,
  testID,
}: NumberUnitFieldProps) {
  const invalid = value.length > 0 && parseDecimal(value) === null;
  const shownError = error ? error : invalid ? t('input.invalidNumber') : undefined;
  // Lines the unit picker up with the input box, below the caption label.
  const pickerTop = textStyles.caption.lineHeight + space.xs;

  return (
    <View testID={testID} style={styles.row}>
      <View style={styles.field}>
        <TextField
          label={label}
          value={value}
          onChangeText={onChangeText}
          helper={helper}
          error={shownError}
          disabled={disabled}
          keyboardType="decimal-pad"
          testID={testID && `${testID}-field`}
        />
      </View>
      {units.length === 1 ? (
        <View style={[styles.single, { marginTop: pickerTop }]}>
          <Text variant="body" tone="secondary" testID={testID && `${testID}-unit`}>
            {units[0]}
          </Text>
        </View>
      ) : units.length > 1 ? (
        <View style={[styles.chips, { marginTop: pickerTop }]}>
          {units.map((u) => {
            const selected = u === unit;
            return (
              <Pressable
                key={u}
                testID={testID && `${testID}-unit-${u}`}
                accessibilityRole="button"
                accessibilityLabel={u}
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => onUnitChange(u)}
                style={[
                  styles.chip,
                  { backgroundColor: selected ? color.tone.info.bg : color.bg.subtle },
                ]}
              >
                <Text
                  variant="caption"
                  style={{
                    color: selected
                      ? color.tone.info.fg
                      : disabled
                        ? color.text.secondary
                        : color.text.primary,
                  }}
                >
                  {u}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
  },
  field: {
    flex: 1,
  },
  single: {
    minHeight: fieldLayout.minHeight,
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    gap: space.xs,
  },
  chip: {
    minWidth: size.touchMin,
    minHeight: size.touchMin,
    paddingHorizontal: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
});
