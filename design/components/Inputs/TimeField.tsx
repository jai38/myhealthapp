import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Icon, Text } from '../Foundations';
import { color, radius, size, space } from '../../tokens';
import { textStyles } from '../../typography';
import { t } from '../../strings';
import { ChipGroup } from './ChipGroup';
import { from12h, to12h } from './time';
import type { Period, Time24 } from './time';

export interface TimeFieldProps {
  label: string;
  value: Time24 | null;
  onChange: (next: Time24 | null) => void;
  disabled?: boolean;
  testID?: string;
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'am', label: t('time.am') },
  { value: 'pm', label: t('time.pm') },
];

function toNumber(raw: string): number {
  const s = raw.trim();
  return /^\d+$/.test(s) ? Number(s) : NaN;
}

export function TimeField({ label, value, onChange, disabled = false, testID }: TimeFieldProps) {
  const initial = value ? to12h(value) : null;
  const [hour, setHour] = useState(initial ? String(initial.hour) : '');
  const [minute, setMinute] = useState(initial ? String(initial.minute) : '');
  const [period, setPeriod] = useState<Period | null>(initial ? initial.period : null);

  const complete = hour.trim() !== '' && minute.trim() !== '' && period !== null;
  const parsed = period ? from12h(toNumber(hour), toNumber(minute), period) : null;
  const showError = complete && parsed === null;

  const commit = (nextHour: string, nextMinute: string, nextPeriod: Period | null) => {
    setHour(nextHour);
    setMinute(nextMinute);
    setPeriod(nextPeriod);
    onChange(
      nextPeriod ? from12h(toNumber(nextHour), toNumber(nextMinute), nextPeriod) : null,
    );
  };

  return (
    <View testID={testID} style={styles.wrap}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>

      <View style={styles.row}>
        <NumberBox
          caption={t('time.hour')}
          value={hour}
          onChangeText={(text) => commit(text, minute, period)}
          disabled={disabled}
          testID={testID ? `${testID}-hour` : undefined}
        />
        <Text variant="title2" style={styles.colon}>
          :
        </Text>
        <NumberBox
          caption={t('time.minute')}
          value={minute}
          onChangeText={(text) => commit(hour, text, period)}
          disabled={disabled}
          testID={testID ? `${testID}-minute` : undefined}
        />
        <ChipGroup
          testID={testID ? `${testID}-period` : undefined}
          options={PERIOD_OPTIONS}
          selected={period ? [period] : []}
          disabled={disabled}
          onChange={(next) => {
            const np = next[0] === 'am' || next[0] === 'pm' ? next[0] : null;
            commit(hour, minute, np);
          }}
        />
      </View>

      {showError ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Icon name="warning-outline" size="sm" tone="danger" />
          <Text variant="caption" tone="danger">
            {t('time.invalid')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

interface NumberBoxProps {
  caption: string;
  value: string;
  onChangeText: (text: string) => void;
  disabled: boolean;
  testID?: string;
}

function NumberBox({ caption, value, onChangeText, disabled, testID }: NumberBoxProps) {
  return (
    <View style={styles.box}>
      <Text variant="caption" tone="secondary">
        {caption}
      </Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        maxLength={2}
        editable={!disabled}
        accessibilityLabel={caption}
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  box: {
    gap: space.xxs,
  },
  input: {
    ...textStyles.body,
    color: color.text.primary,
    width: size.tileLg,
    minHeight: size.inputHeight,
    paddingHorizontal: space.sm,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: color.border.input,
    borderRadius: radius.md,
    backgroundColor: color.bg.screen,
  },
  colon: {
    paddingBottom: space.md,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
});
