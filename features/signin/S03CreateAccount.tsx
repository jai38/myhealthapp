// S03 Create Your Account (LOCKED 2026-11-16; screens.md). A view: the flow container owns
// the form, the status and the PUT /auth/account call. Errors show only after Continue.
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BottomSheet } from '../../design/components/Containers/BottomSheet';
import { ChipGroup } from '../../design/components/Inputs/ChipGroup';
import { GlassCard, PrimaryButton, WheelColumn } from '../../design/components/Glass';
import { Icon } from '../../design/components/Foundations/Icon';
import { Text } from '../../design/components/Foundations/Text';
import { radius, space } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { t } from '../../design/strings';
import type { StringKey } from '../../design/strings';
import { maskIndianMobile, validateS03 } from './signinModel';
import type { Gender, S03Field, S03Form } from './signinModel';
import { CheckRow, ErrorNote, Field, Lead, SigninLayout, Title } from './SigninParts';

export type S03Status = 'idle' | 'saving' | 'saveFailed';

export interface S03Props {
  phone: string;
  form: S03Form;
  onChange: (next: S03Form) => void;
  /** Errors appear once the user has tried Continue. */
  showErrors: boolean;
  status: S03Status;
  onContinue: () => void;
  today: { year: number; month: number; day: number };
  /** Open the date-of-birth wheel at once (A04 "Check Date of Birth"). */
  dobOpen?: boolean;
  onDobOpenChange?: (open: boolean) => void;
}

const GENDERS: { value: Gender; label: StringKey }[] = [
  { value: 'MALE', label: 's03.genderMale' },
  { value: 'FEMALE', label: 's03.genderFemale' },
  { value: 'OTHER', label: 's03.genderOther' },
  { value: 'SELF_DESCRIBE', label: 's03.genderSelf' },
  { value: 'PREFER_NOT_TO_SAY', label: 's03.genderNone' },
];

const pad2 = (n: number) => String(n).padStart(2, '0');

function daysIn(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** DD / MM / YYYY on three wheels; nothing after today (S03: no future dates). */
function DobWheel({
  value,
  today,
  onChange,
}: {
  value: { year: number; month: number; day: number };
  today: { year: number; month: number; day: number };
  onChange: (v: { year: number; month: number; day: number }) => void;
}) {
  const years = Array.from({ length: today.year - 1900 + 1 }, (_, i) => today.year - i);
  const months = Array.from({ length: value.year === today.year ? today.month : 12 }, (_, i) => i + 1);
  const maxDay = value.year === today.year && value.month === today.month ? today.day : daysIn(value.year, value.month);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const set = (next: { year: number; month: number; day: number }) => {
    const month = next.year === today.year ? Math.min(next.month, today.month) : next.month;
    const limit = next.year === today.year && month === today.month ? today.day : daysIn(next.year, month);
    onChange({ year: next.year, month, day: Math.min(next.day, limit) });
  };
  return (
    <View style={styles.wheel}>
      <WheelColumn items={days} selected={value.day} label={t('s03.day')} render={pad2} onSelect={(day) => set({ ...value, day })} testID="s03-dob-day" />
      <WheelColumn items={months} selected={value.month} label={t('s03.month')} render={pad2} onSelect={(month) => set({ ...value, month })} testID="s03-dob-month" />
      <WheelColumn items={years} selected={value.year} label={t('s03.year')} render={String} onSelect={(year) => set({ ...value, year })} testID="s03-dob-year" />
    </View>
  );
}

export function S03CreateAccount({ phone, form, onChange, showErrors, status, onContinue, today, dobOpen, onDobOpenChange }: S03Props) {
  const { color: c } = useTheme();
  const [localDobOpen, setLocalDobOpen] = useState(false);
  const open = dobOpen ?? localDobOpen;
  const setOpen = onDobOpenChange ?? setLocalDobOpen;
  const [draftDob, setDraftDob] = useState(form.dateOfBirth ?? { year: today.year - 30, month: 1, day: 1 });
  const errors: Partial<Record<S03Field, StringKey>> = showErrors ? validateS03(form, today) : {};
  const err = (f: S03Field) => (errors[f] ? t(errors[f]!) : null);
  const saving = status === 'saving';
  const dob = form.dateOfBirth;

  return (
    <SigninLayout
      testID="s03"
      footer={
        <PrimaryButton
          testID="s03-continue"
          label={saving ? t('s03.saving') : t('s03.continue')}
          onPress={onContinue}
          disabled={saving}
        />
      }
    >
      <Text variant="overline" style={{ color: c.text.link, marginTop: space.md }}>
        {t('s03.step')}
      </Text>
      <View style={styles.heading}>
        <Title align="left">{t('s03.title')}</Title>
        <Lead align="left">{t('s03.lead')}</Lead>
      </View>
      <View style={[styles.pill, { backgroundColor: c.dose.taken.bg }]} testID="s03-phone">
        <Icon name="checkmark-circle" size="sm" color={c.dose.taken.fg} />
        <Text variant="chip" tabular style={{ color: c.dose.taken.fg }}>
          {`${maskIndianMobile(phone)} · ${t('s03.verified')}`}
        </Text>
      </View>

      <GlassCard style={styles.form}>
        <Field
          testID="s03-name"
          label={t('s03.fullName')}
          value={form.fullName}
          onChangeText={(fullName) => onChange({ ...form, fullName })}
          autoComplete="name"
          textContentType="name"
          maxLength={100}
          error={err('fullName')}
        />

        <View style={styles.group}>
          <Text variant="caption" style={{ color: c.text.secondary }}>
            {t('s03.dob')}
          </Text>
          <Pressable
            testID="s03-dob"
            accessibilityRole="button"
            accessibilityLabel={t('s03.dob')}
            accessibilityValue={{ text: dob ? `${pad2(dob.day)} / ${pad2(dob.month)} / ${dob.year}` : t('s03.dobPlaceholder') }}
            onPress={() => {
              setDraftDob(form.dateOfBirth ?? { year: today.year - 30, month: 1, day: 1 });
              setOpen(true);
            }}
            style={[styles.dob, { backgroundColor: c.bg.surface, borderColor: err('dateOfBirth') ? c.text.error : c.bg.divider }]}
          >
            <Text variant="body" tabular style={{ color: dob ? c.text.primary : c.text.tertiary }}>
              {dob ? `${pad2(dob.day)} / ${pad2(dob.month)} / ${dob.year}` : t('s03.dobPlaceholder')}
            </Text>
            <Icon name="calendar-outline" size="md" color={c.text.secondary} />
          </Pressable>
          {err('dateOfBirth') ? (
            <Text variant="caption" style={{ color: c.text.error }} testID="s03-dob-error">
              {err('dateOfBirth')}
            </Text>
          ) : null}
        </View>

        <View style={styles.group}>
          <Text variant="caption" style={{ color: c.text.secondary }}>
            {t('s03.gender')}
          </Text>
          <ChipGroup
            testID="s03-gender"
            options={GENDERS.map((g) => ({ value: g.value, label: t(g.label) }))}
            selected={form.gender ? [form.gender] : []}
            onChange={(next) => onChange({ ...form, gender: (next[0] as Gender | undefined) ?? null })}
          />
          {err('gender') ? (
            <Text variant="caption" style={{ color: c.text.error }} testID="s03-gender-error">
              {err('gender')}
            </Text>
          ) : null}
          {form.gender === 'SELF_DESCRIBE' ? (
            <Field
              testID="s03-self"
              label={t('s03.selfDescribe')}
              value={form.genderSelfDescription}
              onChangeText={(genderSelfDescription) => onChange({ ...form, genderSelfDescription })}
              maxLength={60}
            />
          ) : null}
        </View>

        <Field
          testID="s03-email"
          label={t('s03.email')}
          value={form.email}
          onChangeText={(email) => onChange({ ...form, email })}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          error={err('email')}
        />
      </GlassCard>

      <View>
        <CheckRow
          testID="s03-consent"
          checked={form.healthDataConsent}
          onToggle={() => onChange({ ...form, healthDataConsent: !form.healthDataConsent })}
          label={t('s03.consent')}
        />
        {err('healthDataConsent') ? (
          <Text variant="caption" style={{ color: c.text.error }} testID="s03-consent-error">
            {err('healthDataConsent')}
          </Text>
        ) : null}
      </View>

      {status === 'saveFailed' ? <ErrorNote testID="s03-save-failed" body={t('s03.saveFailed')} /> : null}

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('s03.dob')}
        confirm={{
          label: t('s03.dobDone'),
          onPress: () => {
            onChange({ ...form, dateOfBirth: draftDob });
            setOpen(false);
          },
        }}
        testID="s03-dob-sheet"
      >
        <DobWheel value={draftDob} today={today} onChange={setDraftDob} />
      </BottomSheet>
    </SigninLayout>
  );
}

const styles = StyleSheet.create({
  heading: { gap: space.xs },
  pill: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: space.xs, borderRadius: radius.full, paddingHorizontal: space.md, paddingVertical: space.xs },
  form: { gap: space.lg },
  group: { gap: space.sm },
  dob: { height: 52, borderRadius: radius.input, borderWidth: 1.5, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wheel: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, paddingVertical: space.md },
});
