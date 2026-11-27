// S02 OTP Verification (LOCKED 2026-11-16, WhatsApp update LOCKED 2026-11-21; screens.md).
// A view: the flow container owns the code, the timer, the status and the API calls.
// Six boxes are drawn over one hidden input, so a screen reader hears one field.
import React, { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { PrimaryButton } from '../../design/components/Glass';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { radius, size, space } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { t } from '../../design/strings';
import { CODE_LENGTH, formatCountdown, formatIndianMobile } from './signinModel';
import { BackBar, ErrorNote, HeroIcon, InfoNote, Lead, LinkButton, SigninLayout, Title } from './SigninParts';

export type S02Status =
  | { kind: 'idle' }
  | { kind: 'verifying' }
  | { kind: 'verified' }
  | { kind: 'wrong'; attemptsLeft: number }
  | { kind: 'expired' }
  | { kind: 'locked' }
  | { kind: 'noWhatsapp' }
  | { kind: 'sendFailed' }
  | { kind: 'noInternet' };

export interface S02Props {
  phone: string;
  code: string;
  onCodeChange: (digits: string) => void;
  onPaste: () => void;
  status: S02Status;
  resendSecondsLeft: number;
  onResend: () => void;
  onVerify: () => void;
  onBack: () => void;
  onChangeNumber: () => void;
}

export function S02Code({ phone, code, onCodeChange, onPaste, status, resendSecondsLeft, onResend, onVerify, onBack, onChangeNumber }: S02Props) {
  const { color: c } = useTheme();
  const input = useRef<TextInput>(null);
  const busy = status.kind === 'verifying' || status.kind === 'verified';
  const noWhatsapp = status.kind === 'noWhatsapp';
  const wrong = status.kind === 'wrong';
  const digits = code.slice(0, CODE_LENGTH).split('');
  const canResend = resendSecondsLeft === 0 && !busy;

  const footer = noWhatsapp ? (
    <PrimaryButton testID="s02-use-another" label={t('s02.useAnother')} onPress={onChangeNumber} />
  ) : (
    <PrimaryButton
      testID="s02-verify"
      label={status.kind === 'verifying' ? t('s02.verifying') : t('s02.verify')}
      onPress={onVerify}
      disabled={code.length !== CODE_LENGTH || busy || status.kind === 'expired' || status.kind === 'locked'}
    />
  );

  return (
    <SigninLayout testID="s02" footer={footer}>
      <BackBar onBack={onBack} testID="s02-back" />
      <HeroIcon name="chatbubble-ellipses-outline" />
      <View style={styles.heading}>
        <Title>{t('s02.title')}</Title>
        <Lead>{t('s02.sentTo', { phone: `+91 ${formatIndianMobile(phone)}` })}</Lead>
        <LinkButton testID="s02-change-number" label={t('s02.changeNumber')} onPress={onChangeNumber} />
      </View>

      {noWhatsapp ? (
        <InfoNote testID="s02-no-whatsapp" title={t('s02.noWhatsappTitle')} body={t('s02.noWhatsappBody')} />
      ) : (
        <>
          <Pressable
            accessible={false}
            onPress={() => input.current?.focus()}
            style={styles.boxes}
          >
            {Array.from({ length: CODE_LENGTH }, (_, i) => (
              <View
                key={i}
                testID={`s02-box-${i}`}
                style={[
                  styles.box,
                  i === 3 ? styles.gap : null,
                  {
                    backgroundColor: c.bg.surface,
                    borderColor: wrong ? c.text.error : i === digits.length && !busy ? c.action.blue : c.bg.divider,
                  },
                ]}
              >
                <Text variant="title1" tabular style={{ color: c.text.primary }}>
                  {digits[i] ?? ''}
                </Text>
              </View>
            ))}
            <TextInput
              ref={input}
              testID="s02-code"
              accessibilityLabel={t('s02.title')}
              value={code}
              onChangeText={(text) => onCodeChange(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={CODE_LENGTH}
              editable={!busy}
              autoFocus
              caretHidden
              style={styles.hiddenInput}
            />
          </Pressable>

          <View style={styles.timerRow}>
            {canResend ? (
              <LinkButton testID="s02-resend" label={t('s02.resend')} onPress={onResend} />
            ) : (
              <Text variant="caption" tabular style={{ color: c.text.secondary }} testID="s02-timer">
                {busy ? '' : t('s02.resendIn', { time: formatCountdown(resendSecondsLeft) })}
              </Text>
            )}
            {code.length === 0 && !busy ? (
              <Pressable
                testID="s02-paste"
                accessibilityRole="button"
                accessibilityLabel={t('s02.pasteLabel')}
                onPress={onPaste}
                style={[styles.paste, { backgroundColor: c.bg.glass, borderColor: c.bg.glassHairline }]}
              >
                <Icon name="clipboard-outline" size="sm" color={c.text.link} />
                <Text variant="caption" style={{ color: c.text.link, fontWeight: '600' }}>
                  {t('s02.paste')}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {status.kind === 'verified' ? (
            <View style={styles.verified} testID="s02-verified" accessibilityRole="alert">
              <Icon name="checkmark-circle" size="lg" color={c.dose.taken.fg} />
              <Text variant="bodyStrong" style={{ color: c.dose.taken.fg }}>
                {t('s02.verified')}
              </Text>
            </View>
          ) : null}
          {wrong ? (
            <ErrorNote
              testID="s02-wrong"
              body={status.attemptsLeft === 1 ? t('s02.wrongOne') : t('s02.wrongMany', { count: String(status.attemptsLeft) })}
            />
          ) : null}
          {status.kind === 'expired' ? (
            <View style={styles.stack}>
              <ErrorNote testID="s02-expired" body={t('s02.expired')} />
              {canResend ? null : <LinkButton testID="s02-send-new" label={t('s02.sendNew')} onPress={onResend} />}
            </View>
          ) : null}
          {status.kind === 'locked' ? <ErrorNote testID="s02-locked" body={t('s02.locked')} /> : null}
          {status.kind === 'sendFailed' ? <ErrorNote testID="s02-send-failed" body={t('s02.sendFailed')} /> : null}
          {status.kind === 'noInternet' ? <ErrorNote testID="s02-no-internet" body={t('s02.noInternet')} /> : null}
        </>
      )}
    </SigninLayout>
  );
}

const styles = StyleSheet.create({
  heading: { gap: space.xs, alignItems: 'center' },
  boxes: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, position: 'relative' },
  box: { width: 48, height: 58, borderRadius: radius.input, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  gap: { marginLeft: space.md },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1, left: 0, top: 0 },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: size.touchMin },
  paste: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderWidth: 1, borderRadius: radius.full, paddingHorizontal: space.md, minHeight: 36 },
  verified: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  stack: { gap: space.xs },
});
