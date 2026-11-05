import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Icon, Text } from '../Foundations';
import { color, radius, size, space } from '../../tokens';
import { textStyles } from '../../typography';
import { FieldLabel } from './FieldBox';
import { t } from '../../strings';
import type { StringKey } from '../../strings';
import { ChipGroup } from './ChipGroup';
import {
  buildPartialDate,
  formatPartialDate,
  precisionOf,
} from './partialDate';
import type { DateFields, DatePrecision, PartialDate } from './partialDate';

export interface DateFieldProps {
  label: string;
  value: PartialDate | null;
  onChange: (next: PartialDate | null) => void;
  allowPartial?: boolean;
  helper?: string;
  disabled?: boolean;
  testID?: string;
}

const PRECISION_OPTIONS: { value: DatePrecision; label: string }[] = [
  { value: 'year', label: t('date.precisionYear') },
  { value: 'month', label: t('date.precisionMonth') },
  { value: 'day', label: t('date.precisionFull') },
];

function neededFields(p: DatePrecision): (keyof DateFields)[] {
  if (p === 'year') return ['year'];
  if (p === 'month') return ['year', 'month'];
  return ['year', 'month', 'day'];
}

export function DateField({
  label,
  value,
  onChange,
  allowPartial = false,
  helper,
  disabled = false,
  testID,
}: DateFieldProps) {
  const [precision, setPrecision] = useState<DatePrecision>(
    allowPartial && value ? precisionOf(value) : 'day',
  );
  const [fields, setFields] = useState<DateFields>(() => ({
    day: value?.day !== undefined ? String(value.day) : '',
    month: value?.month !== undefined ? String(value.month) : '',
    year: value ? String(value.year) : '',
  }));

  // Without allowPartial the precision is fixed to a full date.
  const activePrecision: DatePrecision = allowPartial ? precision : 'day';
  const parsed = buildPartialDate(activePrecision, fields);
  const incomplete = neededFields(activePrecision).some((k) => fields[k].trim() === '');
  const showError = !incomplete && parsed === null;

  const commit = (nextPrecision: DatePrecision, nextFields: DateFields) => {
    setPrecision(nextPrecision);
    setFields(nextFields);
    onChange(buildPartialDate(nextPrecision, nextFields));
  };

  const setField = (key: keyof DateFields) => (text: string) =>
    commit(activePrecision, { ...fields, [key]: text });

  const preview = parsed
    ? formatPartialDate(parsed, (m) => t(`month.${m}` as StringKey))
    : null;

  return (
    <View testID={testID} style={styles.wrap}>
      <FieldLabel>{label}</FieldLabel>

      {allowPartial ? (
        <ChipGroup
          testID={testID ? `${testID}-precision` : undefined}
          options={PRECISION_OPTIONS}
          selected={[activePrecision]}
          disabled={disabled}
          onChange={(next) => {
            const np = next[0] as DatePrecision | undefined;
            if (np) commit(np, fields);
          }}
        />
      ) : null}

      <View style={styles.inputRow}>
        {activePrecision === 'day' ? (
          <NumberBox
            caption={t('date.day')}
            fieldLabel={label}
            value={fields.day}
            onChangeText={setField('day')}
            maxLength={2}
            flex={1}
            disabled={disabled}
            testID={testID ? `${testID}-day` : undefined}
          />
        ) : null}
        {activePrecision !== 'year' ? (
          <NumberBox
            caption={t('date.month')}
            fieldLabel={label}
            value={fields.month}
            onChangeText={setField('month')}
            maxLength={2}
            flex={1}
            disabled={disabled}
            testID={testID ? `${testID}-month` : undefined}
          />
        ) : null}
        <NumberBox
          caption={t('date.year')}
          fieldLabel={label}
          value={fields.year}
          onChangeText={setField('year')}
          maxLength={4}
          flex={2}
          disabled={disabled}
          testID={testID ? `${testID}-year` : undefined}
        />
      </View>

      {showError ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Icon name="warning-outline" size="sm" tone="danger" />
          <Text variant="caption" tone="danger">
            {t('date.invalid')}
          </Text>
        </View>
      ) : helper ? (
        <Text variant="caption" tone="secondary">
          {helper}
        </Text>
      ) : null}

      {preview ? (
        <Text variant="caption" tone="secondary">
          {preview}
        </Text>
      ) : null}
    </View>
  );
}

interface NumberBoxProps {
  caption: string;
  // Spoken with the caption, so two date or time fields on one screen stay distinct.
  fieldLabel: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength: number;
  flex: number;
  disabled: boolean;
  testID?: string;
}

function NumberBox({ caption, fieldLabel, value, onChangeText, maxLength, flex, disabled, testID }: NumberBoxProps) {
  return (
    <View style={[styles.box, { flex }]}>
      <Text variant="caption" tone="secondary">
        {caption}
      </Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        maxLength={maxLength}
        editable={!disabled}
        accessibilityLabel={`${fieldLabel}, ${caption}`}
        placeholderTextColor={color.text.tertiary}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.xs,
  },
  inputRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  box: {
    gap: space.xxs,
  },
  input: {
    ...textStyles.body,
    color: color.text.primary,
    minHeight: size.inputHeight,
    paddingHorizontal: space.md,
    borderWidth: 1,
    borderColor: color.border.input,
    borderRadius: radius.control,
    backgroundColor: color.bg.card,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
});
