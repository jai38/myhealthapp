// TEST ONLY. Phase 4b rule: one notice at a time. Upload progress, "saved", errors and
// "all done" share one slot, so two of them must never be on screen together.
//
// Today shows notices through one NoticeSlot; the Undo toast counts as a notice too.
import { screen } from '@testing-library/react-native';

export const NOTICE_TEST_IDS = [
  // The single notice slot on Today (design/components/Glass/NoticeSlot), one ID per kind.
  'today-notice-error',
  'today-notice-offline',
  'today-notice-uploading',
  'today-notice-saved',
  'today-notice-info',
  // The Mark as Taken toast with Undo: it must never stack with a slot notice either.
  'today-undo-toast',
] as const;

/** The test IDs of every notice currently rendered. */
export function renderedNotices(): string[] {
  return NOTICE_TEST_IDS.filter((id) => screen.queryAllByTestId(id).length > 0).flatMap((id) =>
    screen.queryAllByTestId(id).map(() => id),
  );
}

/** Fails, naming them, when more than one notice is on screen. */
export function expectAtMostOneNotice(): void {
  const notices = renderedNotices();
  if (notices.length > 1) {
    throw new Error(`Two or more notices render at once: ${notices.join(', ')}`);
  }
}
