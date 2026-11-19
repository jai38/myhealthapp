// TEST ONLY. Phase 4b rule: one notice at a time. Upload progress, "saved", errors and
// "all done" share one slot, so two of them must never be on screen together.
//
// Until the shared notice slot lands (brief task 6), each kind of notice is its own component,
// so this lists their test IDs. When the slot replaces them, point this at the slot's testID.
import { screen } from '@testing-library/react-native';

export const NOTICE_TEST_IDS = [
  'today-action-notice', // a dose was recorded / an action failed
  'today-confirmation-notice', // "saved"
  'today-upload-error',
  'today-processing', // upload progress
  'today-all-done',
  'today-error', // load error with Retry
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
