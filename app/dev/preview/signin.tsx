import React from 'react';
import { View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SigninPreview } from '../../../features/dev-preview/SigninPreview';
import { isPreviewEnabled, parsePreviewTheme } from '../../../features/dev-preview/previewGuard';
import { useAppFonts } from '../../../design/fonts';

// Dev only: /dev/preview/signin?state=s02-wrong&theme=dark. Release builds redirect to the root.
export default function SigninPreviewRoute() {
  const params = useLocalSearchParams<{ state?: string; theme?: string }>();
  const { loaded } = useAppFonts();
  if (!isPreviewEnabled(__DEV__)) return <Redirect href="/" />;
  if (!loaded) return null;
  const state = typeof params.state === 'string' ? params.state : 's01-default';
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} testID={`signin-preview-${state}`}>
        <SigninPreview state={state} theme={parsePreviewTheme(params.theme)} />
      </View>
    </SafeAreaProvider>
  );
}
