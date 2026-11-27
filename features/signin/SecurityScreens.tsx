// Phase 5 account security, Flow 3 (LOCKED 2026-11-21; screens.md): A01 app lock, A02 recovery
// code, A03 new-device check, A04 under 18. Views only: the flow container and the app-lock
// gate own the state and the calls.
import React from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { GlassCard, PrimaryButton } from '../../design/components/Glass';
import { Icon } from '../../design/components/Foundations/Icon';
import type { IconName } from '../../design/components/Foundations/iconNames';
import { Text } from '../../design/components/Foundations/Text';
import { LogoMark } from '../../design/assets/LogoMark';
import { radius, size, space } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { t } from '../../design/strings';
import { isCompleteRecoveryCode, maskIndianMobile } from './signinModel';
import {
  BackBar,
  CautionNote,
  CheckRow,
  ErrorNote,
  HeroIcon,
  InfoNote,
  Lead,
  LinkButton,
  SigninLayout,
  Title,
} from './SigninParts';

function InfoRow({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  const { color: c } = useTheme();
  return (
    <View style={styles.infoRow}>
      <View style={[styles.rowIcon, { backgroundColor: c.bg.tintBlue }]}>
        <Icon name={icon} size="md" color={c.action.blue} />
      </View>
      <View style={styles.rowWords}>
        <Text variant="title3" style={{ color: c.text.primary }}>
          {title}
        </Text>
        <Text variant="caption" style={{ color: c.text.secondary }}>
          {body}
        </Text>
      </View>
    </View>
  );
}

// ---- A04 Under 18 ---------------------------------------------------------------------------

export function A04Under18({ onBack, onCheckDob, onClose }: { onBack: () => void; onCheckDob: () => void; onClose: () => void }) {
  return (
    <SigninLayout
      testID="a04"
      footer={
        <>
          <PrimaryButton testID="a04-check-dob" label={t('a04.checkDob')} onPress={onCheckDob} />
          <LinkButton testID="a04-close" label={t('a04.close')} onPress={onClose} tone="secondary" />
        </>
      }
    >
      <BackBar onBack={onBack} testID="a04-back" />
      <HeroIcon name="shield-outline" />
      <View style={styles.heading}>
        <Title>{t('a04.title')}</Title>
        <Lead>{t('a04.body')}</Lead>
      </View>
      <InfoNote testID="a04-note" body={t('a04.note')} />
    </SigninLayout>
  );
}

// ---- A01 App lock: offer --------------------------------------------------------------------

export function A01Offer({
  enabled,
  onToggle,
  onTurnOn,
  onNotNow,
}: {
  enabled: boolean;
  onToggle: (on: boolean) => void;
  onTurnOn: () => void;
  onNotNow: () => void;
}) {
  const { color: c } = useTheme();
  return (
    <SigninLayout
      testID="a01-offer"
      footer={
        <>
          <PrimaryButton testID="a01-turn-on" label={t('a01.turnOn')} onPress={onTurnOn} disabled={!enabled} />
          <LinkButton testID="a01-not-now" label={t('a01.notNow')} onPress={onNotNow} tone="secondary" />
        </>
      }
    >
      <HeroIcon name="lock-closed-outline" />
      <View style={styles.heading}>
        <Title>{t('a01.title')}</Title>
        <Lead>{t('a01.body')}</Lead>
      </View>
      <GlassCard style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.rowWords}>
            <Text variant="title3" style={{ color: c.text.primary }}>
              {t('a01.switch')}
            </Text>
            <Text variant="caption" style={{ color: c.text.secondary }}>
              {t('a01.switchDetail')}
            </Text>
          </View>
          <Switch
            testID="a01-switch"
            accessibilityLabel={t('a01.switch')}
            value={enabled}
            onValueChange={onToggle}
            trackColor={{ true: c.action.blue, false: c.bg.divider }}
          />
        </View>
        <InfoRow icon="time-outline" title={t('a01.leaveTitle')} body={t('a01.leaveBody')} />
        <InfoRow icon="finger-print" title={t('a01.staysTitle')} body={t('a01.staysBody')} />
      </GlassCard>
      <Text variant="caption" align="center" style={{ color: c.text.tertiary }}>
        {t('a01.footnote')}
      </Text>
    </SigninLayout>
  );
}

// ---- A01 App lock: locked and failed --------------------------------------------------------

/** Shown when the app returns from the background with app lock on. No health data is visible. */
export function A01Locked({
  failed,
  methodLabel,
  onUnlock,
  onUsePin,
}: {
  failed: boolean;
  /** "Face ID", "fingerprint", or the generic label when the phone doesn't say. */
  methodLabel?: string;
  onUnlock: () => void;
  onUsePin: () => void;
}) {
  const { color: c } = useTheme();
  return (
    <SigninLayout
      testID={failed ? 'a01-failed' : 'a01-locked'}
      footer={
        failed ? (
          <>
            <PrimaryButton testID="a01-use-pin" label={t('a01.usePin')} onPress={onUsePin} />
            <LinkButton testID="a01-try-again" label={t('a01.tryAgain')} onPress={onUnlock} />
          </>
        ) : (
          <>
            <PrimaryButton testID="a01-unlock" label={t('a01.unlock')} onPress={onUnlock} />
            <LinkButton testID="a01-use-pin" label={t('a01.usePin')} onPress={onUsePin} />
          </>
        )
      }
    >
      <View style={styles.lockBrand} accessible accessibilityLabel={t('brand.name')}>
        <LogoMark size={48} />
        <Text variant="wordmark" style={{ color: c.text.primary }}>
          {t('brand.name').toUpperCase()}
        </Text>
      </View>
      <View style={styles.heading}>
        <Title>{t('a01.lockedTitle')}</Title>
        <Lead>{t('a01.lockedBody')}</Lead>
      </View>
      <View
        style={[styles.bigGlyph, { backgroundColor: c.bg.glass, borderColor: failed ? c.text.error : c.bg.glassHairline }]}
        accessible
        accessibilityLabel={methodLabel ?? t('a01.switchDetail')}
      >
        <Icon name="finger-print" size="lg" color={failed ? c.text.error : c.action.blue} />
      </View>
      {failed ? <ErrorNote testID="a01-failed-note" title={t('a01.failedTitle')} body={t('a01.failedBody')} /> : null}
    </SigninLayout>
  );
}

// ---- A02 Recovery code: show (once) ----------------------------------------------------------

export function A02Show({
  code,
  saved,
  copied,
  usedUp,
  onCopy,
  onToggleSaved,
  onContinue,
}: {
  code: string | null;
  saved: boolean;
  copied: boolean;
  /** The old code was used to sign in, so this one replaces it. */
  usedUp?: boolean;
  onCopy: () => void;
  onToggleSaved: () => void;
  onContinue: () => void;
}) {
  const { color: c } = useTheme();
  return (
    <SigninLayout
      testID="a02-show"
      footer={<PrimaryButton testID="a02-continue" label={t('a02.continue')} onPress={onContinue} disabled={!saved || !code} />}
    >
      <HeroIcon name="key-outline" />
      <View style={styles.heading}>
        <Title>{usedUp ? t('a02.makeNewTitle') : t('a02.title')}</Title>
        <Lead>{usedUp ? t('a02.makeNewBody') : t('a02.body')}</Lead>
      </View>
      <GlassCard style={styles.codeCard}>
        <Text variant="overline" style={{ color: c.text.secondary }}>
          {t('a02.fieldLabel')}
        </Text>
        {/* Selectable, so it can be copied by hand too. Never logged or sent anywhere. */}
        <Text variant="title2" tabular selectable align="center" numberOfLines={1} style={{ color: c.text.primary, letterSpacing: 1 }} testID="a02-code">
          {code ?? '····-····-····-····'}
        </Text>
        <PrimaryButton testID="a02-copy" label={t('a02.copy')} icon="copy-outline" onPress={onCopy} disabled={!code} />
        {copied ? (
          <View style={styles.copied} testID="a02-copied" accessibilityRole="alert">
            <Icon name="checkmark-circle" size="sm" color={c.dose.taken.fg} />
            <Text variant="caption" style={{ color: c.dose.taken.fg }}>
              {t('a02.copied')}
            </Text>
          </View>
        ) : null}
      </GlassCard>
      <CautionNote testID="a02-note" body={t('a02.note')} />
      <CheckRow testID="a02-saved" checked={saved} onToggle={onToggleSaved} label={t('a02.saved')} />
    </SigninLayout>
  );
}

// ---- A02 Recovery code: enter (new phone) ---------------------------------------------------

export function A02Enter({
  value,
  onChange,
  error,
  submitting,
  onSubmit,
  onBack,
  onNoCode,
}: {
  value: string;
  onChange: (formatted: string) => void;
  error: string | null;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  onNoCode: () => void;
}) {
  const { color: c } = useTheme();
  return (
    <SigninLayout
      testID="a02-enter"
      footer={
        <PrimaryButton
          testID="a02-submit"
          label={submitting ? t('s02.verifying') : t('a02.continue')}
          onPress={onSubmit}
          disabled={!isCompleteRecoveryCode(value) || submitting}
        />
      }
    >
      <BackBar onBack={onBack} testID="a02-back" />
      <View style={styles.headingLeft}>
        <Title align="left">{t('a02.enterTitle')}</Title>
        <Lead align="left">{t('a02.enterBody')}</Lead>
      </View>
      <View style={styles.group}>
        <TextInput
          testID="a02-input"
          accessibilityLabel={t('a02.fieldLabel')}
          value={value}
          onChangeText={onChange}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          autoFocus
          maxLength={19}
          style={[
            styles.codeInput,
            { color: c.text.primary, backgroundColor: c.bg.surface, borderColor: error ? c.text.error : c.action.blue },
          ]}
        />
        {error ? (
          <Text variant="caption" style={{ color: c.text.error }} testID="a02-error" accessibilityRole="alert">
            {error}
          </Text>
        ) : (
          <Text variant="caption" style={{ color: c.text.secondary }}>
            {t('a02.hint')}
          </Text>
        )}
      </View>
      <LinkButton testID="a02-no-code" label={t('a02.noCode')} onPress={onNoCode} />
    </SigninLayout>
  );
}

// ---- A03 New-device check -------------------------------------------------------------------

export function A03Check({
  phone,
  hasPasskey,
  hasRecoveryCode,
  onPasskey,
  onRecoveryCode,
  onContactSupport,
  onBack,
}: {
  phone: string;
  hasPasskey: boolean;
  hasRecoveryCode: boolean;
  onPasskey: () => void;
  onRecoveryCode: () => void;
  onContactSupport: () => void;
  onBack: () => void;
}) {
  const { color: c } = useTheme();
  const Option = ({ testID, icon, title, detail, onPress }: { testID: string; icon: IconName; title: string; detail: string; onPress: () => void }) => (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={title} accessibilityHint={detail} onPress={onPress}>
      <GlassCard style={styles.optionCard}>
        <View style={styles.optionRow}>
          <View style={[styles.rowIcon, { backgroundColor: c.bg.tintBlue }]}>
            <Icon name={icon} size="md" color={c.action.blue} />
          </View>
          <View style={styles.rowWords}>
            <Text variant="title3" style={{ color: c.text.primary }}>
              {title}
            </Text>
            <Text variant="caption" style={{ color: c.text.secondary }}>
              {detail}
            </Text>
          </View>
          <Icon name="chevron-forward" size="md" color={c.text.tertiary} />
        </View>
      </GlassCard>
    </Pressable>
  );
  return (
    <SigninLayout testID="a03-check" footer={<LinkButton testID="a03-support" label={t('a03.neither')} onPress={onContactSupport} />}>
      <BackBar onBack={onBack} testID="a03-back" />
      <HeroIcon name="shield-checkmark" />
      <View style={styles.heading}>
        <Title>{t('a03.title')}</Title>
        <Lead>{t('a03.body')}</Lead>
      </View>
      <View style={[styles.phonePill, { backgroundColor: c.bg.tintBlue }]}>
        <Text variant="chip" tabular style={{ color: c.text.link }}>
          {maskIndianMobile(phone)}
        </Text>
      </View>
      {/* Only the options the account actually has. Passkeys come with Phase 5 task 14. */}
      {hasPasskey ? <Option testID="a03-passkey" icon="finger-print" title={t('a03.passkey')} detail={t('a03.passkeyDetail')} onPress={onPasskey} /> : null}
      {hasRecoveryCode ? (
        <Option testID="a03-recovery" icon="key-outline" title={t('a03.recovery')} detail={t('a03.recoveryDetail')} onPress={onRecoveryCode} />
      ) : null}
    </SigninLayout>
  );
}

export function A03Hidden({ onContactSupport, onSignOut }: { onContactSupport: () => void; onSignOut: () => void }) {
  const { color: c } = useTheme();
  const steps = [t('a03.step1'), t('a03.step2'), t('a03.step3')];
  return (
    <SigninLayout
      testID="a03-hidden"
      footer={
        <>
          <PrimaryButton testID="a03-contact" label={t('a03.contactSupport')} icon="mail-outline" onPress={onContactSupport} />
          <LinkButton testID="a03-sign-out" label={t('a03.signOut')} onPress={onSignOut} tone="secondary" />
        </>
      }
    >
      <HeroIcon name="lock-closed" />
      <View style={styles.heading}>
        <Title>{t('a03.hiddenTitle')}</Title>
        <Lead>{t('a03.hiddenBody')}</Lead>
      </View>
      <InfoNote testID="a03-hidden-note" body={t('a03.hiddenNote')} />
      <GlassCard style={styles.card}>
        {steps.map((step, i) => (
          <View key={step} style={styles.stepRow}>
            <View style={[styles.stepNum, { backgroundColor: c.action.primaryTo }]}>
              <Text variant="chip" style={{ color: c.text.inverse }}>
                {String(i + 1)}
              </Text>
            </View>
            <View style={styles.rowWords}>
              <Text variant="title3" style={{ color: c.text.primary }}>
                {step}
              </Text>
              {i === 2 ? (
                <Text variant="caption" style={{ color: c.text.secondary }}>
                  {t('a03.step3Detail')}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </GlassCard>
    </SigninLayout>
  );
}

const styles = StyleSheet.create({
  heading: { gap: space.xs, alignItems: 'center' },
  headingLeft: { gap: space.xs },
  card: { gap: space.lg },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: size.touchMin },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  rowIcon: { width: 40, height: 40, borderRadius: radius.iconChip, alignItems: 'center', justifyContent: 'center' },
  rowWords: { flex: 1, gap: 2 },
  lockBrand: { alignItems: 'center', gap: space.xs, marginTop: space.xxl },
  bigGlyph: { alignSelf: 'center', width: 96, height: 96, borderRadius: 48, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  codeCard: { gap: space.md, alignItems: 'stretch' },
  copied: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
  group: { gap: space.xs },
  codeInput: { height: 56, borderRadius: radius.input, borderWidth: 1.5, paddingHorizontal: space.lg, fontSize: 20, letterSpacing: 1, fontVariant: ['tabular-nums'] },
  phonePill: { alignSelf: 'center', borderRadius: radius.full, paddingHorizontal: space.md, paddingVertical: space.xs },
  optionCard: { paddingVertical: space.sm },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  stepNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
