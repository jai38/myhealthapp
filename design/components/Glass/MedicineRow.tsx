import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { DoseDisplayState } from '../../status';
import { layout, radius, size, space } from '../../tokens';
import { useTheme } from '../../theme';
import { t } from '../../strings';
import { Icon } from '../Foundations/Icon';
import { MedicineIcon } from '../Foundations/MedicineIcon';
import type { MedicineForm } from '../Foundations/iconNames';
import { Text } from '../Foundations/Text';
import { DoseChip } from './DoseChip';

export interface MedicineRowProps {
  name: string;
  /** "5 mg · Tablet · 1:00 PM": strength, form and time. No quantity until Phase 12. */
  detail: string;
  form?: MedicineForm;
  state: DoseDisplayState;
  formatTime: (d: Date) => string;
  /** Shown only once a medicine can carry the supplement type (brief: not before Phase 14). */
  supplement?: boolean;
  /** "Tap to update" under a Not confirmed dose. */
  hint?: string;
  onPress?: () => void;
  onMore?: () => void;
  testID?: string;
}

// v4 medicine row: icon chip, name, dose · time, an optional Supplement tag on its own line,
// the status chip (with the taken time), and ⋮. At least 68 high.
export function MedicineRow({
  name,
  detail,
  form = 'tablet',
  state,
  formatTime,
  supplement = false,
  hint,
  onPress,
  onMore,
  testID,
}: MedicineRowProps) {
  const { color: c } = useTheme();
  return (
    <View testID={testID} style={styles.row}>
      <Pressable
        testID={testID && `${testID}-open`}
        accessibilityRole="button"
        accessibilityLabel={name}
        accessibilityHint={hint}
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={[styles.iconChip, { backgroundColor: supplement ? c.bg.tintTeal : c.bg.tintBlue }]}>
          <MedicineIcon form={form} size="md" color={supplement ? c.text.teal : c.action.blue} />
        </View>
        <View style={styles.words}>
          <Text variant="title3" style={{ color: c.text.primary }}>
            {name}
          </Text>
          <Text variant="callout" tabular style={{ color: c.text.secondary }}>
            {detail}
          </Text>
          {supplement ? (
            <View style={[styles.tag, { backgroundColor: c.supplement.bg }]}>
              <Text variant="chip" style={{ color: c.supplement.fg }}>
                {t('dose.supplement')}
              </Text>
            </View>
          ) : null}
          <DoseChip state={state} formatTime={formatTime} testID={testID && `${testID}-status`} />
          {hint ? (
            <Text variant="caption" style={{ color: c.text.tertiary }}>
              {hint}
            </Text>
          ) : null}
        </View>
      </Pressable>
      {onMore ? (
        <Pressable
          testID={testID && `${testID}-more`}
          accessibilityRole="button"
          accessibilityLabel={t('common.more')}
          onPress={onMore}
          hitSlop={4}
          style={({ pressed }) => [styles.more, pressed && styles.pressed]}
        >
          <Icon name="ellipsis-vertical" size="md" color={c.text.secondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', minHeight: layout.rowMinHeight },
  main: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingVertical: space.sm },
  words: { flex: 1, gap: space.xs },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.iconChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
  },
  more: {
    width: size.touchMin,
    height: size.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  pressed: { opacity: 0.7 },
});
