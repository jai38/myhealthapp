// TEST ONLY. Renders one tab exactly as the dev screen preview does: the real screen, inside the
// signed-in chrome, fed from the synthetic fixtures in features/dev-preview/ (no backend).
import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import type { PreviewScreen } from '../../../features/dev-preview/previewGuard';

export async function renderPreview(tab: PreviewScreen, state: string, fontScale = 1) {
  // The app's stores and services are module singletons. A request still in flight from the
  // previous test could otherwise land in this one, so each render gets fresh app modules.
  vi.resetModules();
  const { PreviewHost } = await import('../../../features/dev-preview/PreviewHost');
  const result = await render(<PreviewHost screen={tab} state={state} fontScale={fontScale} />);
  await screen.findByTestId(`preview-${tab}-${state}`);
  return result;
}
