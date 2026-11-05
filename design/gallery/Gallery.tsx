import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { color, space } from '../tokens';
import { useAppFonts } from '../fonts';
import { Screen } from '../components/Foundations/Screen';
import { Text } from '../components/Foundations/Text';
import { Logo } from '../components/Foundations/Logo';
import { FoundationsSection } from './sections/FoundationsSection';
import { ActionsSection } from './sections/ActionsSection';
import { InputsSection } from './sections/InputsSection';
import { ContainersSection } from './sections/ContainersSection';
import { NavigationSection } from './sections/NavigationSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { TrustSection } from './sections/TrustSection';

// Developer-only gallery (Y4). Sample data is synthetic. Large-text checks are
// done with the phone's own text-size setting, which this screen follows.
export function Gallery() {
  const { loaded } = useAppFonts();

  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg.screen }}>
        <ActivityIndicator color={color.action.primary} />
      </View>
    );
  }

  return (
    <Screen testID="gallery">
      <View style={{ paddingTop: space.lg, gap: space.sm }}>
        <Logo variant="full" />
        <Text variant="display">Component gallery</Text>
        <Text tone="secondary">Developer only. Not reachable in release builds.</Text>
      </View>
      <FoundationsSection />
      <ActionsSection />
      <InputsSection />
      <ContainersSection />
      <NavigationSection />
      <FeedbackSection />
      <TrustSection />
    </Screen>
  );
}
