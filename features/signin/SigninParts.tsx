// Shared parts for the Phase 5 sign-in and account-security screens (S01–S03, A01–A04),
// in the v4 look (designes/claude-design/S01MobileNumber.dc.html and the others). Each reads
// useTheme(), so the screens draw light or dark.
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogoMark } from '../../design/assets/LogoMark';
import { Icon } from '../../design/components/Foundations/Icon';
import type { IconName } from '../../design/components/Foundations/iconNames';
import { Text } from '../../design/components/Foundations/Text';
import { radius, size, space } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { t } from '../../design/strings';

/** A full-height sign-in screen: scrolling content, and the main button pinned at the bottom. */
export function SigninLayout({
  children,
  footer,
  testID,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  testID?: string;
}) {
  const { color: c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      testID={testID}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: c.bg.screen, paddingTop: insets.top }]}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer ? <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg) + space.sm }]}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

/** The large logo and wordmark (S01). */
export function BrandBlock({ tagline }: { tagline?: string }) {
  const { color: c } = useTheme();
  return (
    <View style={styles.brand} accessible accessibilityRole="header" accessibilityLabel={t('brand.name')}>
      <LogoMark size={66} />
      <Text variant="wordmark" style={{ color: c.text.primary, marginTop: space.xs }}>
        {t('brand.name').toUpperCase()}
      </Text>
      {tagline ? (
        <Text variant="caption" style={{ color: c.text.secondary }}>
          {tagline}
        </Text>
      ) : null}
    </View>
  );
}

/** A back button and the small logo lockup (S02, A02 enter, A04). */
export function BackBar({ onBack, testID }: { onBack?: () => void; testID?: string }) {
  const { color: c } = useTheme();
  return (
    <View style={styles.backBar}>
      {onBack ? (
        <Pressable
          testID={testID}
          accessibilityRole="button"
          accessibilityLabel={t('s02.back')}
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: c.bg.glass, borderColor: c.bg.glassHairline }]}
        >
          <Icon name="chevron-back" size="md" color={c.text.primary} />
        </Pressable>
      ) : (
        <View style={styles.backButton} />
      )}
      <View style={styles.lockup}>
        <LogoMark size={22} />
        <Text variant="wordmark" style={{ color: c.text.primary, fontSize: 13 }}>
          {t('brand.name').toUpperCase()}
        </Text>
      </View>
      <View style={styles.backButton} />
    </View>
  );
}

/** A round gradient-tinted icon tile at the top of A01–A04 and S02. */
export function HeroIcon({ name, tone = 'blue' }: { name: IconName; tone?: 'blue' | 'teal' | 'error' }) {
  const { color: c } = useTheme();
  const fg = tone === 'teal' ? c.text.teal : tone === 'error' ? c.text.error : c.action.blue;
  const bg = tone === 'teal' ? c.bg.tintTeal : tone === 'error' ? c.dose.missed.bg : c.bg.tintBlue;
  return (
    <View style={[styles.heroIcon, { backgroundColor: bg }]}>
      <Icon name={name} size="lg" color={fg} />
    </View>
  );
}

export function Title({ children, align = 'center' }: { children: React.ReactNode; align?: 'center' | 'left' }) {
  const { color: c } = useTheme();
  return (
    <Text variant="title1" align={align} style={{ color: c.text.primary }}>
      {children}
    </Text>
  );
}

export function Lead({ children, align = 'center' }: { children: React.ReactNode; align?: 'center' | 'left' }) {
  const { color: c } = useTheme();
  return (
    <Text variant="body" align={align} style={{ color: c.text.secondary }}>
      {children}
    </Text>
  );
}

export interface FieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
  leading?: React.ReactNode;
  keyboardType?: KeyboardTypeOptions;
  testID?: string;
}

/** A labelled input, 52 high, radius 16; red border and message on an error. */
export function Field({ label, error, leading, testID, ...input }: FieldProps) {
  const { color: c } = useTheme();
  return (
    <View style={styles.fieldWrap}>
      <Text variant="caption" style={{ color: c.text.secondary, fontFamily: undefined }}>
        {label}
      </Text>
      <View style={styles.fieldRow}>
        {leading}
        <TextInput
          testID={testID}
          accessibilityLabel={label}
          placeholderTextColor={c.text.tertiary}
          style={[
            styles.field,
            {
              color: c.text.primary,
              backgroundColor: c.bg.surface,
              borderColor: error ? c.text.error : c.bg.divider,
            },
          ]}
          {...input}
        />
      </View>
      {error ? (
        <View style={styles.errorRow} accessibilityRole="alert">
          <Icon name="alert-circle-outline" size="sm" color={c.text.error} />
          <Text variant="caption" style={{ color: c.text.error }} testID={testID && `${testID}-error`}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** A checkbox with its sentence (S01 Terms, S03 consent, A02 "I've saved my recovery code"). */
export function CheckRow({
  checked,
  onToggle,
  label,
  testID,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  testID?: string;
}) {
  const { color: c } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={styles.check}
    >
      <View
        style={[
          styles.box,
          checked ? { backgroundColor: c.action.blue, borderColor: c.action.blue } : { borderColor: c.text.tertiary },
        ]}
      >
        {checked ? <Icon name="checkmark" size="sm" color={c.text.inverse} /> : null}
      </View>
      <Text variant="caption" style={[styles.checkText, { color: c.text.secondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** A calm blue note, not an error (S01/S02 "no WhatsApp", A03, A04). */
export function InfoNote({ title, body, testID }: { title?: string; body: string; testID?: string }) {
  const { color: c } = useTheme();
  return (
    <View testID={testID} accessibilityRole="alert" style={[styles.note, { backgroundColor: c.bg.tintBlue }]}>
      <Icon name="information-circle-outline" size="md" color={c.text.link} />
      <View style={styles.noteWords}>
        {title ? (
          <Text variant="bodyStrong" style={{ color: c.text.primary }}>
            {title}
          </Text>
        ) : null}
        <Text variant="caption" style={{ color: c.text.link }}>
          {body}
        </Text>
      </View>
    </View>
  );
}

/** A red note for a failure the user can retry (no internet, save failed, wrong code). */
export function ErrorNote({ title, body, testID }: { title?: string; body: string; testID?: string }) {
  const { color: c } = useTheme();
  return (
    <View testID={testID} accessibilityRole="alert" style={[styles.note, { backgroundColor: c.dose.missed.bg }]}>
      <Icon name="alert-circle-outline" size="md" color={c.text.error} />
      <View style={styles.noteWords}>
        {title ? (
          <Text variant="bodyStrong" style={{ color: c.text.error }}>
            {title}
          </Text>
        ) : null}
        <Text variant="caption" style={{ color: c.text.error }}>
          {body}
        </Text>
      </View>
    </View>
  );
}

/** An amber note (A02 "keep it somewhere safe"). */
export function CautionNote({ body, testID }: { body: string; testID?: string }) {
  const { color: c } = useTheme();
  return (
    <View testID={testID} style={[styles.note, { backgroundColor: c.dose.notConfirmed.bg }]}>
      <Icon name="warning-outline" size="md" color={c.dose.notConfirmed.fg} />
      <Text variant="caption" style={[styles.noteWords, { color: c.dose.notConfirmed.fg }]}>
        {body}
      </Text>
    </View>
  );
}

/** A text button (Change number, Not Now, I don't have my code). */
export function LinkButton({ label, onPress, testID, tone = 'link' }: { label: string; onPress: () => void; testID?: string; tone?: 'link' | 'secondary' }) {
  const { color: c } = useTheme();
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.link}>
      <Text variant="bodyStrong" style={{ color: tone === 'link' ? c.text.link : c.text.secondary }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: space.sm, paddingBottom: space.xl, gap: space.lg },
  footer: { paddingHorizontal: 20, paddingTop: space.sm, gap: space.sm },
  brand: { alignItems: 'center', gap: 2, marginTop: space.md },
  backBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  backButton: { width: 44, height: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  lockup: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  heroIcon: { alignSelf: 'center', width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: space.md },
  fieldWrap: { gap: space.xs, alignSelf: 'stretch' },
  fieldRow: { flexDirection: 'row', gap: space.sm, alignSelf: 'stretch' },
  // minWidth 0: on web an input otherwise keeps its default width and runs past the card.
  field: { flex: 1, minWidth: 0, height: 52, borderRadius: radius.input, borderWidth: 1.5, paddingHorizontal: space.lg, fontSize: 17 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, minHeight: size.touchMin, paddingVertical: space.sm },
  box: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  checkText: { flex: 1 },
  note: { flexDirection: 'row', gap: space.sm, padding: space.md, borderRadius: 14, alignItems: 'flex-start' },
  noteWords: { flex: 1, gap: 2 },
  link: { minHeight: size.touchMin, alignItems: 'center', justifyContent: 'center' },
});
