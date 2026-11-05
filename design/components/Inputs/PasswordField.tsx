import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../Foundations/Text';
import { Icon } from '../Foundations/Icon';
import { IconButton } from '../Actions/IconButton';
import { space } from '../../tokens';
import { t } from '../../strings';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField';
import { evaluatePasswordRules } from './inputStyle';
import type { PasswordRule } from './inputStyle';

export interface PasswordFieldProps
  extends Omit<
    TextFieldProps,
    'leadingIcon' | 'trailing' | 'secureTextEntry' | 'autoComplete' | 'textContentType'
  > {
  rules?: PasswordRule[];
}

export function PasswordField({ rules, value, disabled = false, testID, ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const results = rules ? evaluatePasswordRules(value, rules) : null;
  const metCount = results ? results.filter((r) => r.met).length : 0;

  return (
    <View style={styles.wrapper}>
      <TextField
        {...rest}
        testID={testID}
        value={value}
        disabled={disabled}
        leadingIcon="lock-closed-outline"
        secureTextEntry={!visible}
        autoComplete={rules ? 'new-password' : 'password'}
        textContentType={rules ? 'newPassword' : 'password'}
        trailing={
          <IconButton
            icon={visible ? 'eye-off-outline' : 'eye-outline'}
            accessibilityLabel={visible ? t('common.hidePassword') : t('common.showPassword')}
            onPress={() => setVisible((v) => !v)}
            disabled={disabled}
            testID={testID ? `${testID}-toggle` : undefined}
          />
        }
      />
      {results ? (
        <View style={styles.rules}>
          <View accessibilityLiveRegion="polite">
            <Text variant="caption" tone="secondary">
              {t('input.passwordRulesMet', { met: metCount, total: results.length })}
            </Text>
          </View>
          {results.map((rule) => (
            <View key={rule.key} style={styles.ruleRow}>
              <Icon
                name={rule.met ? 'checkmark-circle' : 'ellipse-outline'}
                tone={rule.met ? 'success' : 'secondary'}
              />
              <Text variant="callout">{t(rule.key)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space.sm,
  },
  rules: {
    gap: space.xs,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
});
