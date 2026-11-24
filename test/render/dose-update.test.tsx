// S07 Dose update sheet (04b task 14), through the dev preview over S06 Today: synthetic data,
// frozen clock at 10:30, fake backend. Clinical rules: Save is off until a choice; nothing is
// recorded until Save; Missed only from "No, I missed it"; other time never in the future;
// the sheet never opens for an upcoming dose.
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { t } from '../../design/strings';
import { renderPreview } from './support/renderPreview';

const DAY = '2026-11-06';
const NOT_CONFIRMED = `preview-dose-tm-a-${DAY}-0800`;
const DUE = `preview-dose-tm-b-${DAY}-1000`;
const UPCOMING = `preview-dose-tm-c-${DAY}-1300`;

async function openSheetFor(doseId: string) {
  await renderPreview('today', 'returning');
  await screen.findByTestId('today-hero');
  await fireEvent.press(screen.getByTestId(`today-row-${doseId}-open`));
}

const status = (id: string) => screen.getByTestId(`today-row-${id}-status`);
const saveDisabled = () => screen.getByTestId('dose-update-confirm').props.accessibilityState?.disabled === true;

describe('S07 Dose update sheet', () => {
  it('opens from a Not confirmed row with the medicine card, the question and the footnote; Save is off', async () => {
    await openSheetFor(NOT_CONFIRMED);
    expect(screen.getByTestId('dose-update-title')).toHaveTextContent('Update dose');
    expect(screen.getByTestId('dose-update-medicine')).toHaveTextContent(/Testmed A 500 mg/);
    expect(screen.getByTestId('dose-update-medicine')).toHaveTextContent(/500 mg · Scheduled 8:00/);
    expect(screen.getByText(t('doseUpdate.question'))).toBeTruthy();
    expect(screen.getByTestId('dose-update-footnote')).toHaveTextContent(t('doseUpdate.footnote'));
    expect(saveDisabled()).toBe(true);
    await fireEvent.press(screen.getByTestId('dose-update-confirm'));
    expect(status(NOT_CONFIRMED)).toHaveTextContent('Not confirmed');
  });

  it('opens from the Due now row too', async () => {
    await openSheetFor(DUE);
    expect(screen.getByTestId('dose-update-medicine')).toHaveTextContent(/Testmed B 20 mg/);
  });

  it('never opens for an upcoming dose', async () => {
    await openSheetFor(UPCOMING);
    expect(screen.queryByTestId('dose-update')).toBeNull();
  });

  it('Yes, I took it, as scheduled: records Taken at the scheduled time on Save only', async () => {
    await openSheetFor(NOT_CONFIRMED);
    await fireEvent.press(screen.getByTestId('dose-update-took'));
    expect(screen.getByTestId('dose-update-when')).toBeTruthy();
    expect(status(NOT_CONFIRMED)).toHaveTextContent('Not confirmed');
    expect(saveDisabled()).toBe(false);
    await fireEvent.press(screen.getByTestId('dose-update-confirm'));
    await waitFor(() => expect(status(NOT_CONFIRMED)).toHaveTextContent(/Taken at 8:00/));
    expect(screen.queryByTestId('dose-update')).toBeNull();
    expect(screen.getByTestId('today-notice-saved')).toHaveTextContent(/Testmed A 500 mg updated/);
  });

  it('other time: the wheel offers nothing after now, and Save records the picked time', async () => {
    await openSheetFor(NOT_CONFIRMED);
    await fireEvent.press(screen.getByTestId('dose-update-took'));
    await fireEvent.press(screen.getByTestId('dose-update-when-other'));
    expect(screen.getByTestId('dose-update-wheel')).toBeTruthy();
    expect(screen.queryByTestId('dose-update-wheel-hour-11')).toBeNull();
    // At 10 o'clock, nothing after 10:30.
    await fireEvent.press(screen.getByTestId('dose-update-wheel-hour-10'));
    expect(screen.getByTestId('dose-update-wheel-minute-30')).toBeTruthy();
    expect(screen.queryByTestId('dose-update-wheel-minute-35')).toBeNull();
    await fireEvent.press(screen.getByTestId('dose-update-wheel-hour-9'));
    await fireEvent.press(screen.getByTestId('dose-update-wheel-minute-15'));
    await fireEvent.press(screen.getByTestId('dose-update-confirm'));
    await waitFor(() => expect(status(NOT_CONFIRMED)).toHaveTextContent(/Taken at 9:15/));
  });

  it('No, I skipped it, with a reason: records Skipped', async () => {
    await openSheetFor(NOT_CONFIRMED);
    await fireEvent.press(screen.getByTestId('dose-update-skipped'));
    expect(screen.getByTestId('dose-update-reason')).toBeTruthy();
    await fireEvent.press(screen.getByText('Ran out'));
    await fireEvent.press(screen.getByTestId('dose-update-confirm'));
    await waitFor(() => expect(status(NOT_CONFIRMED)).toHaveTextContent(t('status.skipped')));
  });

  it('No, I missed it: records Missed, and only then', async () => {
    await openSheetFor(NOT_CONFIRMED);
    expect(screen.queryByText(/^Missed$/)).toBeNull();
    await fireEvent.press(screen.getByTestId('dose-update-missed'));
    await fireEvent.press(screen.getByTestId('dose-update-confirm'));
    await waitFor(() => expect(status(NOT_CONFIRMED)).toHaveTextContent('Missed'));
  });

  it('Cancel closes without recording anything', async () => {
    await openSheetFor(NOT_CONFIRMED);
    await fireEvent.press(screen.getByTestId('dose-update-missed'));
    await fireEvent.press(screen.getByTestId('dose-update-cancel'));
    expect(screen.queryByTestId('dose-update')).toBeNull();
    expect(status(NOT_CONFIRMED)).toHaveTextContent('Not confirmed');
  });
});

describe('S07 preview states', () => {
  const states: [string, RegExp | null][] = [
    ['update-ask', null],
    ['update-taken', /Yes, I took it/],
    ['update-other', /Pick a time/],
    ['update-skipped', /Reason/],
    ['update-missed', /No, I missed it/],
  ];
  it.each(states)('%s opens the sheet', async (state, text) => {
    await renderPreview('today', state);
    expect(await screen.findByTestId('dose-update')).toBeTruthy();
    if (text) expect(screen.getByTestId('dose-update')).toHaveTextContent(text);
  });

  it('update-saving: Save shows Saving and nothing changes yet', async () => {
    await renderPreview('today', 'update-saving');
    await screen.findByTestId('dose-update');
    await fireEvent.press(screen.getByTestId('dose-update-confirm'));
    await waitFor(() => expect(screen.getByTestId('dose-update-confirm')).toHaveTextContent('Saving'));
    expect(saveDisabled()).toBe(true);
  });

  it('update-failed: says it was not saved, offers Retry, and the dose is not left Missed', async () => {
    await renderPreview('today', 'update-failed');
    await screen.findByTestId('dose-update');
    await fireEvent.press(screen.getByTestId('dose-update-confirm'));
    await waitFor(() => expect(screen.getByTestId('dose-update-failed')).toBeTruthy());
    expect(screen.getByTestId('dose-update-confirm')).toHaveTextContent(t('common.retry'));
    expect(status(NOT_CONFIRMED)).toHaveTextContent('Not confirmed');
  });

  it('update-offline: Save is off with the reason', async () => {
    await renderPreview('today', 'update-offline');
    await screen.findByTestId('dose-update');
    expect(screen.getByTestId('dose-update-offline')).toHaveTextContent(t('doseUpdate.offline'));
    expect(saveDisabled()).toBe(true);
  });
});
