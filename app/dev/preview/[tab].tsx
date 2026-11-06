import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { PreviewHost } from '../../../features/dev-preview/PreviewHost';
import {
  isPreviewEnabled,
  parsePreviewFontScale,
  parsePreviewScreen,
  parsePreviewState,
} from '../../../features/dev-preview/previewGuard';

// Dev only: /dev/preview/<today|records|medicines|profile>?state=<state>&fontScale=2
// Release builds redirect to the app root, exactly as the component gallery does.
export default function PreviewRoute() {
  const params = useLocalSearchParams<{ tab?: string; state?: string; fontScale?: string; view?: string }>();
  if (!isPreviewEnabled(__DEV__)) return <Redirect href="/" />;

  const screen = parsePreviewScreen(params.tab);
  if (!screen) return <Redirect href="/dev/preview/today" />;

  const state = parsePreviewState(screen, params.state);
  const fontScale = parsePreviewFontScale(params.fontScale);
  // `view` is read by the real Records screen from the URL, as in the app. It is part of the key
  // so the preview starts again when it changes.
  return <PreviewHost key={`${screen}|${state}|${fontScale}|${params.view ?? ''}`} screen={screen} state={state} fontScale={fontScale} />;
}
