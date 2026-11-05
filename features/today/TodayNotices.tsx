import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Card } from '../../design/components/Containers/Card';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { color, radius, space } from '../../design/tokens';
import type { ToneName } from '../../design/tokens';
import type { IconName } from '../../design/components/Foundations/iconNames';

export interface TodayNoticeProps {
  tone: ToneName;
  text: string;
  icon?: IconName;
  testID?: string;
}

// A small calm card in a tone from the design tokens. Feedback only; it never changes a dose.
export function TodayNotice({ tone, text, icon, testID }: TodayNoticeProps) {
  const palette = color.tone[tone];
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={text}
      style={[styles.notice, { backgroundColor: palette.bg }]}
    >
      {icon !== undefined ? <Icon name={icon} size="sm" color={palette.fg} /> : null}
      <Text variant="callout" style={[styles.noticeText, { color: palette.fg }]}>
        {text}
      </Text>
    </View>
  );
}

export interface TodayNoticesProps {
  actionNotice: string | null;
  confirmationNotice: string | null;
  uploadError: string | null;
}

export function TodayNotices({ actionNotice, confirmationNotice, uploadError }: TodayNoticesProps) {
  if (!actionNotice && !confirmationNotice && !uploadError) return null;
  return (
    <View style={styles.stack} testID="today-notices">
      {actionNotice ? <TodayNotice tone="info" text={actionNotice} testID="today-action-notice" /> : null}
      {confirmationNotice ? (
        <TodayNotice
          tone="success"
          text={confirmationNotice}
          icon="checkmark-circle"
          testID="today-confirmation-notice"
        />
      ) : null}
      {uploadError ? (
        <TodayNotice
          tone="caution"
          text={uploadError}
          icon="alert-circle-outline"
          testID="today-upload-error"
        />
      ) : null}
    </View>
  );
}

// Shown while a prescription is uploaded and read. The user may leave the screen.
export function TodayProcessing({ status }: { status: string }) {
  return (
    <Card testID="today-processing">
      <View style={styles.processing}>
        <ActivityIndicator size="small" color={color.action.primary} />
        <Text variant="callout" tone="secondary" style={styles.processingText}>
          {status}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space.sm,
    marginTop: space.md,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
  },
  noticeText: {
    flex: 1,
  },
  processing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  processingText: {
    flex: 1,
  },
});
