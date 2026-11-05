import React, { useState } from 'react';
import {
  Checkbox,
  ChipGroup,
  DateField,
  EmailField,
  MultilineField,
  NumberUnitField,
  OtpField,
  PasswordField,
  RadioGroup,
  SearchField,
  SelectSheet,
  SeverityScale,
  Switch,
  TextField,
  TimeField,
  defaultPasswordRules,
} from '../../components/Inputs';
import type { PartialDate, Severity, Time24 } from '../../components/Inputs';
import { GallerySection, GalleryItem } from '../GallerySection';

type FrequencyValue = 'once' | 'twice' | 'thrice';

const FREQUENCY_OPTIONS: { value: FrequencyValue; label: string }[] = [
  { value: 'once', label: 'Once daily' },
  { value: 'twice', label: 'Twice daily' },
  { value: 'thrice', label: 'Three times daily' },
];

const TIMING_OPTIONS: { value: string; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'night', label: 'Night' },
];

const FORM_OPTIONS: { value: string; label: string }[] = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'liquid', label: 'Liquid' },
];

const UNITS_GLUCOSE = ['mg/dL', 'mmol/L'];

const noop = (): void => {};

export function InputsSection() {
  // TextField
  const [emptyName, setEmptyName] = useState('');
  const [filledName, setFilledName] = useState('Asha Rao');
  const [helperPhone, setHelperPhone] = useState('');
  const [errorPhone, setErrorPhone] = useState('12345');
  const [countNote, setCountNote] = useState('');

  // EmailField
  const [email, setEmail] = useState('');

  // PasswordField
  const [plainPassword, setPlainPassword] = useState('');
  const [rulesPassword, setRulesPassword] = useState('');

  // OtpField
  const [otpEmpty, setOtpEmpty] = useState('');
  const [otpPart, setOtpPart] = useState('12');
  const [otpError, setOtpError] = useState('000000');

  // SearchField
  const [search, setSearch] = useState('');

  // MultilineField
  const [notes, setNotes] = useState('');

  // NumberUnitField
  const [systolic, setSystolic] = useState('120');
  const [glucoseValue, setGlucoseValue] = useState('5.4');
  const [glucoseUnit, setGlucoseUnit] = useState('mmol/L');
  const [badValue, setBadValue] = useState('1,5');
  const [badUnit, setBadUnit] = useState('mg/dL');

  // Checkbox
  const [checkedOn, setCheckedOn] = useState(true);
  const [checkedOff, setCheckedOff] = useState(false);

  // RadioGroup
  const [frequency, setFrequency] = useState<FrequencyValue | null>(null);

  // Switch
  const [switchOn, setSwitchOn] = useState(true);
  const [switchOff, setSwitchOff] = useState(false);
  const [switchHelper, setSwitchHelper] = useState(true);

  // ChipGroup
  const [singleTiming, setSingleTiming] = useState<string[]>(['morning']);
  const [multiTiming, setMultiTiming] = useState<string[]>(['morning', 'night']);

  // SelectSheet
  const [form, setForm] = useState<string | null>(null);

  // DateField
  const [fullDate, setFullDate] = useState<PartialDate | null>(null);
  const [partialDate, setPartialDate] = useState<PartialDate | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<PartialDate | null>({ year: 2019, month: 3 });

  // TimeField
  const [reminderTime, setReminderTime] = useState<Time24 | null>(null);
  const [prefilledTime, setPrefilledTime] = useState<Time24 | null>({ hour: 8, minute: 30 });

  // SeverityScale
  const [severityNone, setSeverityNone] = useState<Severity | null>(null);
  const [severityThree, setSeverityThree] = useState<Severity | null>(3);

  return (
    <GallerySection title="Inputs" testID="gallery-inputs">
      <GalleryItem label="TextField, empty with placeholder">
        <TextField
          label="Full name"
          placeholder="Enter your full name"
          value={emptyName}
          onChangeText={setEmptyName}
        />
      </GalleryItem>

      <GalleryItem label="TextField, filled">
        <TextField label="Full name" value={filledName} onChangeText={setFilledName} />
      </GalleryItem>

      <GalleryItem label="TextField, with helper">
        <TextField
          label="Mobile number"
          placeholder="10 digits"
          helper="Used only for sign-in codes."
          value={helperPhone}
          onChangeText={setHelperPhone}
          keyboardType="number-pad"
        />
      </GalleryItem>

      <GalleryItem label="TextField, with error">
        <TextField
          label="Mobile number"
          value={errorPhone}
          onChangeText={setErrorPhone}
          error="Enter a 10-digit mobile number"
          keyboardType="number-pad"
        />
      </GalleryItem>

      <GalleryItem label="TextField, disabled">
        <TextField label="Patient ID" value="PT-0001" onChangeText={noop} disabled />
      </GalleryItem>

      <GalleryItem label="TextField, with character count (max 40)">
        <TextField
          label="Short note"
          placeholder="A few words"
          value={countNote}
          onChangeText={setCountNote}
          maxLength={40}
          showCount
        />
      </GalleryItem>

      <GalleryItem label="EmailField">
        <EmailField
          label="Email"
          placeholder="name@example.com"
          helper="We never share this."
          value={email}
          onChangeText={setEmail}
        />
      </GalleryItem>

      <GalleryItem label="PasswordField, no rules">
        <PasswordField label="Password" value={plainPassword} onChangeText={setPlainPassword} />
      </GalleryItem>

      <GalleryItem label="PasswordField, default rules">
        <PasswordField
          label="New password"
          value={rulesPassword}
          onChangeText={setRulesPassword}
          rules={defaultPasswordRules}
        />
      </GalleryItem>

      <GalleryItem label="OtpField, empty">
        <OtpField value={otpEmpty} onChangeText={setOtpEmpty} />
      </GalleryItem>

      <GalleryItem label="OtpField, part filled">
        <OtpField value={otpPart} onChangeText={setOtpPart} />
      </GalleryItem>

      <GalleryItem label="OtpField, with error">
        <OtpField
          value={otpError}
          onChangeText={setOtpError}
          error="That code does not match. Try again."
        />
      </GalleryItem>

      <GalleryItem label="SearchField">
        <SearchField value={search} onChangeText={setSearch} />
      </GalleryItem>

      <GalleryItem label="MultilineField, max 200">
        <MultilineField
          label="Notes"
          placeholder="Describe how you feel"
          value={notes}
          onChangeText={setNotes}
          maxLength={200}
        />
      </GalleryItem>

      <GalleryItem label="NumberUnitField, one unit">
        <NumberUnitField
          label="Systolic pressure"
          value={systolic}
          onChangeText={setSystolic}
          units={['mmHg']}
          unit="mmHg"
          onUnitChange={noop}
        />
      </GalleryItem>

      <GalleryItem label="NumberUnitField, two units">
        <NumberUnitField
          label="Blood glucose"
          value={glucoseValue}
          onChangeText={setGlucoseValue}
          units={UNITS_GLUCOSE}
          unit={glucoseUnit}
          onUnitChange={setGlucoseUnit}
          helper="Fasting reading"
        />
      </GalleryItem>

      <GalleryItem label="NumberUnitField, invalid entry">
        <NumberUnitField
          label="Blood glucose"
          value={badValue}
          onChangeText={setBadValue}
          units={UNITS_GLUCOSE}
          unit={badUnit}
          onUnitChange={setBadUnit}
        />
      </GalleryItem>

      <GalleryItem label="Checkbox, checked">
        <Checkbox label="Remind me each morning" checked={checkedOn} onChange={setCheckedOn} />
      </GalleryItem>

      <GalleryItem label="Checkbox, unchecked">
        <Checkbox label="Share with my doctor" checked={checkedOff} onChange={setCheckedOff} />
      </GalleryItem>

      <GalleryItem label="Checkbox, disabled">
        <Checkbox label="Locked option" checked={false} onChange={noop} disabled />
      </GalleryItem>

      <GalleryItem label="RadioGroup">
        <RadioGroup
          label="How often"
          options={FREQUENCY_OPTIONS}
          value={frequency}
          onChange={setFrequency}
        />
      </GalleryItem>

      <GalleryItem label="Switch, on">
        <Switch label="Dose reminders" value={switchOn} onValueChange={setSwitchOn} />
      </GalleryItem>

      <GalleryItem label="Switch, off">
        <Switch label="Lock screen previews" value={switchOff} onValueChange={setSwitchOff} />
      </GalleryItem>

      <GalleryItem label="Switch, with helper">
        <Switch
          label="Show on lock screen"
          helper="Reminder text may be visible to others nearby."
          value={switchHelper}
          onValueChange={setSwitchHelper}
        />
      </GalleryItem>

      <GalleryItem label="ChipGroup, single">
        <ChipGroup
          label="Time of day"
          options={TIMING_OPTIONS}
          selected={singleTiming}
          onChange={setSingleTiming}
          allowNone
        />
      </GalleryItem>

      <GalleryItem label="ChipGroup, multi">
        <ChipGroup
          label="Time of day"
          options={TIMING_OPTIONS}
          selected={multiTiming}
          onChange={setMultiTiming}
          multi
        />
      </GalleryItem>

      <GalleryItem label="SelectSheet">
        <SelectSheet
          label="Medicine form"
          title="Choose a form"
          options={FORM_OPTIONS}
          value={form}
          onChange={setForm}
        />
      </GalleryItem>

      <GalleryItem label="DateField, full date">
        <DateField label="Date started" value={fullDate} onChange={setFullDate} />
      </GalleryItem>

      <GalleryItem label="DateField, allowPartial">
        <DateField
          label="Date started"
          value={partialDate}
          onChange={setPartialDate}
          allowPartial
          helper="Year is enough if you do not remember the day."
        />
      </GalleryItem>

      <GalleryItem label="DateField, allowPartial, prefilled 2019 March">
        <DateField
          label="Date started"
          value={prefilledDate}
          onChange={setPrefilledDate}
          allowPartial
        />
      </GalleryItem>

      <GalleryItem label="TimeField, empty">
        <TimeField label="Reminder time" value={reminderTime} onChange={setReminderTime} />
      </GalleryItem>

      <GalleryItem label="TimeField, prefilled 8:30">
        <TimeField label="Reminder time" value={prefilledTime} onChange={setPrefilledTime} />
      </GalleryItem>

      <GalleryItem label="SeverityScale, unselected">
        <SeverityScale label="How bad is the headache" value={severityNone} onChange={setSeverityNone} />
      </GalleryItem>

      <GalleryItem label="SeverityScale, selected 3">
        <SeverityScale label="How bad is the headache" value={severityThree} onChange={setSeverityThree} />
      </GalleryItem>
    </GallerySection>
  );
}
