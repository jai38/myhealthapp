// S01 Mobile Number (LOCKED 2026-11-16, WhatsApp update LOCKED 2026-11-21; screens.md).
// A view: the flow container owns the number, the box and the status.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GlassCard, PrimaryButton } from '../../design/components/Glass';
import { Text } from '../../design/components/Foundations/Text';
import { radius, space } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { t } from '../../design/strings';
import { canContinueS01, formatIndianMobile } from './signinModel';
import { BrandBlock, CheckRow, ErrorNote, Field, InfoNote, Lead, SigninLayout } from './SigninParts';

export type S01Status = 'idle' | 'sending' | 'invalid' | 'noInternet' | 'rateLimited' | 'unavailable' | 'noWhatsapp' | 'failed';

export interface S01Props {
  /** Digits only, at most 10. */
  phone: string;
  onPhoneChange: (text: string) => void;
  termsAccepted: boolean;
  onToggleTerms: () => void;
  status: S01Status;
  onContinue: () => void;
}

export function S01MobileNumber({ phone, onPhoneChange, termsAccepted, onToggleTerms, status, onContinue }: S01Props) {
  const { color: c } = useTheme();
  const sending = status === 'sending';
  // "No WhatsApp on this number": Continue stays off until the number changes.
  const enabled = canContinueS01(phone, termsAccepted) && !sending && status !== 'noWhatsapp';
  return (
    <SigninLayout
      testID="s01"
      footer={
        <PrimaryButton
          testID="s01-continue"
          label={sending ? t('s01.sending') : t('s01.continue')}
          onPress={onContinue}
          disabled={!enabled}
        />
      }
    >
      <BrandBlock tagline={t('s01.tagline')} />
      <View style={styles.heading}>
        <Text variant="display" align="center" style={{ color: c.text.primary }}>
          {t('s01.title')}
        </Text>
        <Text variant="display" align="center" style={{ color: c.action.blue }}>
          {t('s01.titleAccent')}
        </Text>
        <Lead>{t('s01.lead')}</Lead>
      </View>
      <GlassCard>
        <Text variant="title3" style={{ color: c.text.primary }}>
          {t('s01.cardTitle')}
        </Text>
        <Text variant="caption" style={{ color: c.text.secondary, marginBottom: space.md }}>
          {t('s01.cardHelp')}
        </Text>
        <Field
          testID="s01-number"
          label={t('s01.numberLabel')}
          value={formatIndianMobile(phone)}
          onChangeText={onPhoneChange}
          placeholder={t('s01.numberPlaceholder')}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={11}
          editable={!sending}
          error={status === 'invalid' ? t('s01.invalid') : null}
          leading={
            <View style={[styles.cc, { backgroundColor: c.bg.surface, borderColor: c.bg.divider }]} accessible accessibilityLabel={t('s01.countryCode')}>
              <Text variant="bodyStrong" tabular style={{ color: c.text.primary }}>
                {t('s01.countryCode')}
              </Text>
            </View>
          }
        />
        {status === 'noWhatsapp' ? (
          <View style={styles.note}>
            <InfoNote testID="s01-no-whatsapp" title={t('s01.noWhatsappTitle')} body={t('s01.noWhatsappBody')} />
          </View>
        ) : null}
        {status === 'noInternet' ? (
          <View style={styles.note}>
            <ErrorNote testID="s01-no-internet" body={t('s01.noInternet')} />
          </View>
        ) : null}
        {status === 'rateLimited' ? (
          <View style={styles.note}>
            <ErrorNote testID="s01-rate-limited" body={t('s01.rateLimited')} />
          </View>
        ) : null}
        {status === 'failed' ? (
          <View style={styles.note}>
            <ErrorNote testID="s01-failed" body={t('s02.sendFailed')} />
          </View>
        ) : null}
        {status === 'unavailable' ? (
          <View style={styles.note}>
            <InfoNote testID="s01-unavailable" body={t('s01.unavailable')} />
          </View>
        ) : null}
        <CheckRow testID="s01-terms" checked={termsAccepted} onToggle={onToggleTerms} label={t('s01.terms')} />
      </GlassCard>
    </SigninLayout>
  );
}

const styles = StyleSheet.create({
  heading: { gap: space.xs },
  cc: { width: 72, height: 52, borderRadius: radius.input, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  note: { marginTop: space.md },
});
