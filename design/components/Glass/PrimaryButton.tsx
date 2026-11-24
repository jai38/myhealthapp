import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { radius, size, space } from '../../tokens';
import { useTheme } from '../../theme';
import { t } from '../../strings';
import type { IconName } from '../Foundations/iconNames';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { GradientFill } from './GradientFill';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  /** Said under a disabled button, e.g. why Mark as Taken is off while offline. */
  disabledReason?: string;
  testID?: string;
}

// v4 primary button: a pill on the primary gradient with white text and, in light mode only, a
// blue glow. Disabled: a flat grey pill (the designer still has to rule on its contrast).
export function PrimaryButton({ label, onPress, icon, disabled = false, disabledReason, testID }: PrimaryButtonProps) {
  const { color: c, shadow } = useTheme();
  const fg = disabled ? c.text.disabled : c.text.inverse;
  return (
    <View style={styles.wrap}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={disabled ? disabledReason : undefined}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          disabled ? { backgroundColor: c.action.disabledBg } : shadow.button,
          pressed && styles.pressed,
        ]}
      >
        {disabled ? null : (
          <GradientFill
            stops={[
              { offset: 0, color: c.action.primaryFrom },
              { offset: 1, color: c.action.primaryTo },
            ]}
          />
        )}
        {icon ? <Icon name={icon} size="md" color={fg} /> : null}
        <Text variant="button" numberOfLines={1} style={{ color: fg }}>
          {label}
        </Text>
      </Pressable>
      {disabled && disabledReason ? (
        <Text variant="caption" style={{ color: c.text.secondary }} testID={testID && `${testID}-reason`}>
          {disabledReason}
        </Text>
      ) : null}
    </View>
  );
}

export interface MarkTakenButtonProps {
  onPress: () => void;
  disabled?: boolean;
  disabledReason?: string;
  testID?: string;
}

/** The one Mark as Taken under the Due now row. Records nothing by itself; the caller does, on tap. */
export function MarkTakenButton(props: MarkTakenButtonProps) {
  return <PrimaryButton label={t('today.markTaken')} icon="checkmark-circle" {...props} />;
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  button: {
    minHeight: size.touchMin,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85 },
});
