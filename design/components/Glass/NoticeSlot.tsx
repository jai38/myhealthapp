import React from 'react';
import { StyleSheet, View } from 'react-native';
import { radius, space } from '../../tokens';
import type { ThemeColors } from '../../tokens';
import { useTheme } from '../../theme';
import { Button } from '../Actions/Button';
import type { IconName } from '../Foundations/iconNames';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { GlassCard } from './GlassCard';
import { pickNotice } from './glassStyle';
import type { Notice, NoticeKind } from './glassStyle';

export interface NoticeSlotProps {
  /** Every notice that wants the slot. Only the most important one shows (pickNotice). */
  notices: readonly (Notice | null | undefined)[];
  /** An action for the shown notice, e.g. Retry on an error. */
  action?: { label: string; onPress: () => void; forKind: NoticeKind };
  testID?: string;
}

const ICONS: Record<NoticeKind, IconName> = {
  error: 'warning-outline',
  offline: 'cloud-offline-outline',
  uploading: 'cloud-upload-outline',
  saved: 'checkmark-circle',
  info: 'information-circle-outline',
};

function fgFor(kind: NoticeKind, c: ThemeColors): string {
  switch (kind) {
    case 'error':
      return c.text.error;
    case 'saved':
      return c.dose.taken.fg;
    case 'offline':
      return c.dose.notConfirmed.fg;
    default:
      return c.text.link;
  }
}

// The single notice slot (04b decision 3): upload progress, "saved", errors and offline take
// turns in one place, so two notices can never stack or overlap.
export function NoticeSlot({ notices, action, testID }: NoticeSlotProps) {
  const { color: c } = useTheme();
  const notice = pickNotice(notices);
  if (!notice) return null;
  const fg = fgFor(notice.kind, c);
  return (
    <View testID={testID} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <GlassCard padding={space.md} testID={testID && `${testID}-${notice.kind}`}>
        <View style={styles.row}>
          <Icon name={ICONS[notice.kind]} size="md" color={fg} />
          <Text variant="callout" style={[styles.text, { color: c.text.primary }]}>
            {notice.message}
          </Text>
        </View>
        {action && action.forKind === notice.kind ? (
          <View style={styles.action}>
            <Button label={action.label} variant="secondary" onPress={action.onPress} testID={testID && `${testID}-action`} />
          </View>
        ) : null}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  text: { flex: 1 },
  action: { marginTop: space.md, alignItems: 'flex-start', borderRadius: radius.full },
});
