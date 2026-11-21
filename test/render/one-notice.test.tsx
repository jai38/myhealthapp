// Phase 4b rule: one notice at a time (brief, decision 3). Upload progress, "saved", errors and
// "all done" share one slot, so they can never stack or overlap.
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react-native';
import { NoticeSlot } from '../../design/components/Glass';
import { UndoToast } from '../../design/components/Actions/UndoToast';
import { PREVIEW_STATES } from '../../features/dev-preview/previewGuard';
import { expectAtMostOneNotice, renderedNotices } from './support/notices';
import { renderPreview } from './support/renderPreview';

describe('the one-notice check', () => {
  it('fails when two notices render at once', async () => {
    await render(
      <>
        <NoticeSlot testID="today-notice" notices={[{ id: 'u', kind: 'uploading', message: 'Uploading' }]} />
        <UndoToast visible message="Saved" onUndo={() => {}} onDismiss={() => {}} testID="today-undo-toast" />
      </>,
    );
    expect(renderedNotices()).toEqual(['today-notice-uploading', 'today-undo-toast']);
    expect(() => expectAtMostOneNotice()).toThrow(/today-notice-uploading, today-undo-toast/);
  });

  it('passes with a single notice', async () => {
    await render(<NoticeSlot testID="today-notice" notices={[{ id: 'u', kind: 'uploading', message: 'Uploading' }]} />);
    expect(() => expectAtMostOneNotice()).not.toThrow();
  });
});

// Task 3 audit, Today 1: upload progress and "All done" used to stack. Since the S06 rebuild,
// "All done" lives in the hero and progress in the single notice slot, so every state passes.
// Each Today state ends on one of these. Waiting for it means the data has loaded, so the
// check cannot pass just because nothing has rendered yet.
const SETTLED = ['today-new-user', 'today-hero', 'today-notice-error', 'today-loading'];

async function waitForToday(): Promise<void> {
  await waitFor(() => {
    expect(SETTLED.some((id) => screen.queryByTestId(id) !== null)).toBe(true);
  });
}

describe('Today shows at most one notice', () => {
  for (const state of PREVIEW_STATES.today) {
    it(state, async () => {
      await renderPreview('today', state);
      await waitForToday();
      expectAtMostOneNotice();
    });
  }
});
