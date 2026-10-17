import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/index';

export interface ScreenLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
}) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Ambient Nocturnal Light Orbs for Liquid Glass Refraction */}
      <View style={styles.ambientCanvas} pointerEvents="none">
        <View style={[styles.ambientOrb, styles.orbCyan]} />
        <View style={[styles.ambientOrb, styles.orbMint]} />
        <View style={[styles.ambientOrb, styles.orbViolet]} />
      </View>

      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.contentContainer, contentContainerStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientCanvas: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  ambientOrb: {
    position: 'absolute',
    borderRadius: 999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(80px)',
          WebkitFilter: 'blur(80px)',
        } as any)
      : {
          opacity: 0.12,
        }),
  },
  orbCyan: {
    top: -40,
    right: -40,
    width: 280,
    height: 280,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
  },
  orbMint: {
    top: '35%',
    left: -80,
    width: 240,
    height: 240,
    backgroundColor: 'rgba(0, 245, 160, 0.12)',
  },
  orbViolet: {
    bottom: 80,
    right: -60,
    width: 260,
    height: 260,
    backgroundColor: 'rgba(129, 140, 248, 0.10)',
  },
  contentContainer: {
    position: 'relative',
    zIndex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 110, // Generous spacing so content scrolls past floating dock
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
});

