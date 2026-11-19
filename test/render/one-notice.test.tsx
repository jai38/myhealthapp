// Phase 4b rule: one notice at a time (brief, decision 3). Upload progress, "saved", errors and
// "all done" share one slot, so they can never stack or overlap.
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react-native';
import { TodayNotices, TodayProcessing } from '../../features/today/TodayNotices';
import { PREVIEW_STATES } from '../../features/dev-preview/previewGuard';
import { expectAtMostOneNotice, renderedNotices } from './support/notices';
import { renderPreview } from './support/renderPreview';

describe('the one-notice check', () => {
  it('fails when two notices render at once', async () => {
    await render(
      <>
        <TodayNotices actionNotice={null} confirmationNotice="Saved" uploadError={null} />
        <TodayProcessing status="Uploading" />
      </>,
    );
    expect(renderedNotices()).toEqual(['today-confirmation-notice', 'today-processing']);
    expect(() => expectAtMostOneNotice()).toThrow(/today-confirmation-notice, today-processing/);
  });

  it('passes with a single notice', async () => {
    await render(<TodayProcessing status="Uploading" />);
    expect(() => expectAtMostOneNotice()).not.toThrow();
  });
});

// Known failure (task 3 audit, Today 1): while a prescription uploads on an all-done day, the
// progress card and the all-done card stack. The shared notice slot (brief task 6) and the
// Today rebuild (task 7) fix it; at that point this entry fails as "passed unexpectedly" and
// must move to the passing list.
// Each Today state ends on one of these. Waiting for it means the data has loaded, so the
// check cannot pass just because nothing has rendered yet.
const SETTLED = ['today-new-user', 'today-nothing-due', 'today-next-dose', 'today-all-done', 'today-error'];

async function waitForToday(): Promise<void> {
  await waitFor(() => {
    expect(SETTLED.some((id) => screen.queryByTestId(id) !== null)).toBe(true);
  });
}

const KNOWN_STACKED: readonly string[] = ['allDone-uploading'];

describe('Today shows at most one notice', () => {
  for (const state of PREVIEW_STATES.today) {
    const test = KNOWN_STACKED.includes(state) ? it.fails : it;
    test(`${state}${KNOWN_STACKED.includes(state) ? ' (known: stacks two, fixed by task 6/7)' : ''}`, async () => {
      await renderPreview('today', state);
      await waitForToday();
      expectAtMostOneNotice();
    });
  }
});
