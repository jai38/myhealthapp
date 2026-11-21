// S06 Today (04b task 13), every state through the dev preview: the real screen, synthetic
// fixtures (Testmed, Asha Test), a frozen clock at 10:30 and a fake backend.
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { t } from '../../design/strings';
import { renderPreview } from './support/renderPreview';

const DAY = '2026-11-06';
const DUE = `preview-dose-tm-b-${DAY}-1000`; // Testmed B 20 mg, 10:00, due now at 10:30
const NOT_CONFIRMED = `preview-dose-tm-a-${DAY}-0800`; // Testmed A, 08:00, nobody recorded it
const TAKEN = `preview-dose-tm-d-${DAY}-0900`; // Testmed D, recorded at 09:05

async function hero() {
  return screen.findByTestId('today-hero');
}

describe('S06 Today', () => {
  it('returning: greeting with the first name, hero, groups, one Due now and one Not confirmed', async () => {
    await renderPreview('today', 'returning');
    expect(await hero()).toBeTruthy();
    expect(screen.getByTestId('today-greeting')).toHaveTextContent(/^Good morning, Asha/);
    expect(screen.getByTestId('today-hero-headline')).toHaveTextContent('1 of 5 taken');
    expect(screen.getByTestId('today-hero')).toHaveTextContent(/Next: Testmed B 20 mg · 10:00/);
    expect(screen.getByTestId('today-hero')).toHaveTextContent(/1 needs confirming/);
    expect(screen.getByTestId('today-hero')).not.toHaveTextContent('%');

    expect(screen.getByTestId('today-group-morning')).toBeTruthy();
    expect(screen.getByTestId('today-group-afternoon')).toBeTruthy();
    expect(screen.getByTestId('today-group-evening')).toBeTruthy();

    expect(screen.getByTestId(`today-row-${DUE}-status`)).toHaveTextContent(t('status.dueNow'));
    expect(screen.getByTestId(`today-row-${NOT_CONFIRMED}-status`)).toHaveTextContent('Not confirmed');
    expect(screen.getByTestId(`today-row-${TAKEN}-status`)).toHaveTextContent(/Taken at/);
    expect(screen.queryByText(/missed/i)).toBeNull();
  });

  it('one Mark as Taken, under the Due now row only', async () => {
    await renderPreview('today', 'returning');
    await hero();
    expect(screen.getAllByTestId('today-mark-taken')).toHaveLength(1);
    expect(screen.getByTestId('today-mark-taken')).toHaveAccessibleName('Mark as Taken');
  });

  it('nothing is recorded until the tap; the tap logs Taken now, shows Undo and updates the hero', async () => {
    await renderPreview('today', 'returning');
    await hero();
    expect(screen.getByTestId(`today-row-${DUE}-status`)).toHaveTextContent(t('status.dueNow'));

    await fireEvent.press(screen.getByTestId('today-mark-taken'));
    await waitFor(() => expect(screen.getByTestId('today-undo-toast')).toBeTruthy());
    expect(screen.getByTestId('today-undo-toast')).toHaveTextContent(/Testmed B 20 mg marked as taken at 10:30/);
    expect(screen.getByTestId(`today-row-${DUE}-status`)).toHaveTextContent(/Taken at 10:30/);
    expect(screen.getByTestId('today-hero-headline')).toHaveTextContent('2 of 5 taken');
    // The Not confirmed dose is untouched.
    expect(screen.getByTestId(`today-row-${NOT_CONFIRMED}-status`)).toHaveTextContent('Not confirmed');
  });

  it('Undo returns the dose to Due now and the count back', async () => {
    await renderPreview('today', 'returning');
    await hero();
    await fireEvent.press(screen.getByTestId('today-mark-taken'));
    await waitFor(() => expect(screen.getByTestId('today-undo-toast-undo')).toBeTruthy());
    await fireEvent.press(screen.getByTestId('today-undo-toast-undo'));
    await waitFor(() =>
      expect(screen.getByTestId(`today-row-${DUE}-status`)).toHaveTextContent(t('status.dueNow')),
    );
    expect(screen.getByTestId('today-hero-headline')).toHaveTextContent('1 of 5 taken');
    expect(screen.queryByTestId('today-undo-toast')).toBeNull();
    expect(screen.getAllByTestId('today-mark-taken')).toHaveLength(1);
  });

  it('all done: "All done for today ✓", no Mark as Taken', async () => {
    await renderPreview('today', 'allDone');
    expect(await hero()).toHaveTextContent(/All done for today ✓/);
    expect(screen.queryByTestId('today-mark-taken')).toBeNull();
  });

  it('nothing due today: the hero says so, with Quick Actions', async () => {
    await renderPreview('today', 'nothingDue');
    expect(await hero()).toHaveTextContent(new RegExp(t('today.nothingDueTitle')));
    expect(screen.getByTestId('today-quick-upload')).toHaveAccessibleName('Upload Record');
    expect(screen.getByTestId('today-quick-add')).toHaveAccessibleName('Add Medication');
  });

  it('many doses: a group shows five rows, then Show all', async () => {
    await renderPreview('today', 'manyDue');
    await hero();
    const morning = screen.getByTestId('today-group-morning');
    const rows = () => within(morning).queryAllByTestId(/^today-row-[^-].*-open$/);
    expect(rows()).toHaveLength(5);
    await fireEvent.press(screen.getByTestId('today-group-morning-toggle'));
    expect(rows().length).toBeGreaterThan(5);
  });

  it('loading: skeleton hero and rows', async () => {
    await renderPreview('today', 'loading');
    expect(await screen.findByTestId('today-loading')).toBeTruthy();
    expect(screen.queryByTestId('today-hero')).toBeNull();
  });

  it('offline: cached day, the offline banner and stamp, and Mark as Taken off with a reason', async () => {
    await renderPreview('today', 'offline');
    await hero();
    expect(screen.getByTestId('offline-banner')).toBeTruthy();
    expect(screen.queryByTestId('today-notice-offline')).toBeNull();
    expect(screen.getByTestId('today-last-updated')).toHaveTextContent(/Last updated/);
    await fireEvent.press(screen.getByTestId('today-mark-taken'));
    expect(screen.queryByTestId('today-undo-toast')).toBeNull();
    expect(screen.getByTestId('today-mark-taken-reason')).toHaveTextContent(t('today.offlineNoMark'));
  });

  it('uploading: progress in the notice slot, nothing stacked', async () => {
    await renderPreview('today', 'uploading');
    await hero();
    expect(screen.getByTestId('today-notice-uploading')).toBeTruthy();
  });

  it('shows no appointment card and no Appointment or Reading tile (hard rule 8)', async () => {
    await renderPreview('today', 'returning');
    await hero();
    expect(screen.queryByText(/appointment/i)).toBeNull();
    expect(screen.queryByText(/reading/i)).toBeNull();
  });

  it('a row menu offers Update dose for a Not confirmed dose, and records nothing by itself', async () => {
    await renderPreview('today', 'returning');
    await hero();
    await fireEvent.press(screen.getByTestId(`today-row-${NOT_CONFIRMED}-more`));
    expect(screen.getByTestId('today-row-menu')).toBeTruthy();
    expect(screen.queryByTestId('today-row-menu-taken')).toBeNull();
    await fireEvent.press(screen.getByTestId('today-row-menu-update'));
    expect(screen.getByTestId('dose-update')).toBeTruthy();
    expect(screen.getByTestId(`today-row-${NOT_CONFIRMED}-status`)).toHaveTextContent('Not confirmed');
  });

  it('a Not confirmed row says "Tap to update"; an upcoming row does not', async () => {
    await renderPreview('today', 'returning');
    await hero();
    expect(screen.getByTestId(`today-row-${NOT_CONFIRMED}`)).toHaveTextContent(/Tap to update/);
    expect(screen.getByTestId(`today-row-preview-dose-tm-c-${DAY}-1300`)).not.toHaveTextContent(/Tap to update/);
  });
});
