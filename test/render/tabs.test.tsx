// One render test per tab, through the dev screen preview: the real screens with synthetic
// fixtures and no backend. They check what renders in each preview state, not how it looks.
import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react-native';
import { t } from '../../design/strings';
import { renderPreview } from './support/renderPreview';
import { searchParams } from './support/router';

afterEach(() => {
  searchParams.current = {};
});

describe('Today tab', () => {
  it('new user: the first-use state and no dose list', async () => {
    await renderPreview('today', 'newUser');
    expect(await screen.findByTestId('today-new-user')).toBeTruthy();
    expect(screen.queryByTestId('today-next-dose')).toBeNull();
  });

  it('nothing due: says so, with no next dose', async () => {
    await renderPreview('today', 'nothingDue');
    expect(await screen.findByTestId('today-nothing-due')).toBeTruthy();
    expect(screen.queryByTestId('today-next-dose')).toBeNull();
  });

  it('due now: the next dose with Taken, Snooze and Skip', async () => {
    await renderPreview('today', 'dueNow');
    expect(await screen.findByTestId('today-next-name')).toHaveTextContent('Testmed B 20 mg');
    expect(await screen.findByTestId('today-next-taken')).toBeTruthy();
    expect(await screen.findByTestId('today-next-snooze')).toBeTruthy();
    expect(await screen.findByTestId('today-next-skip')).toBeTruthy();
  });

  it('many due: the due-now list and the earlier not-confirmed doses', async () => {
    await renderPreview('today', 'manyDue');
    expect(await screen.findByTestId('today-due-now')).toBeTruthy();
    expect(await screen.findByTestId('today-earlier')).toBeTruthy();
  });

  it('all done: one all-done card and no next dose', async () => {
    await renderPreview('today', 'allDone');
    expect(await screen.findByTestId('today-all-done')).toBeTruthy();
    expect(screen.queryByTestId('today-next-dose')).toBeNull();
  });

  it('error: the error state, not an empty day', async () => {
    await renderPreview('today', 'error');
    expect(await screen.findByTestId('today-error')).toBeTruthy();
    expect(screen.queryByTestId('today-new-user')).toBeNull();
  });

  it('offline: the offline banner over the cached day', async () => {
    await renderPreview('today', 'offline');
    expect(await screen.findByTestId('offline-banner')).toBeTruthy();
  });
});

describe('Records tab', () => {
  it('timeline: search and the synthetic events', async () => {
    await renderPreview('records', 'timeline');
    expect(await screen.findByTestId('timeline-search')).toBeTruthy();
    expect(await screen.findByText('Testclinic review visit')).toBeTruthy();
  });

  it('a search with no match shows the no-results state', async () => {
    await renderPreview('records', 'timeline');
    await screen.findByText('Testclinic review visit');
    await fireEvent.changeText(screen.getByTestId('timeline-search'), 'zzz-no-such-record');
    expect(await screen.findByTestId('timeline-no-match')).toBeTruthy();
  });

  it('?view=reports opens the Reports view', async () => {
    searchParams.current = { view: 'reports' };
    await renderPreview('records', 'reports');
    expect(screen.queryByTestId('timeline-search')).toBeNull();
  });
});

describe('Medicines tab', () => {
  it('list: the medicines list with the synthetic medicines', async () => {
    await renderPreview('medicines', 'list');
    expect(await screen.findByTestId('medicines-list')).toBeTruthy();
    expect((await screen.findAllByText('Testmed A 500 mg')).length).toBeGreaterThan(0);
  });

  it('empty: the empty list state', async () => {
    await renderPreview('medicines', 'empty');
    expect(await screen.findByTestId('medicines-list-empty')).toBeTruthy();
  });
});

describe('Profile tab', () => {
  it('signed in: the synthetic patient and sign out', async () => {
    await renderPreview('profile', 'signedIn');
    expect(await screen.findByText('Asha Test')).toBeTruthy();
    expect(await screen.findByText(t('profile.signOut'))).toBeTruthy();
  });
});
