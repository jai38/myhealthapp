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
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Ambient Depth Orbs (Subtle Liquid Glow behind glass cards) */}
      <View style={styles.ambientBackground} pointerEvents="none">
        <View style={styles.glowOrbTopRight} />
        <View style={styles.glowOrbLeft} />
        <View style={styles.glowOrbBottom} />
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
  },
  ambientBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowOrbTopRight: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 91, 34, 0.08)', // Subtle Solar Coral glow
    ...(Platform.OS === 'web' ? ({ filter: 'blur(60px)' } as any) : {}),
  },
  glowOrbLeft: {
    position: 'absolute',
    top: 240,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(6, 182, 212, 0.07)', // Subtle Glacier Cyan glow
    ...(Platform.OS === 'web' ? ({ filter: 'blur(70px)' } as any) : {}),
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: 60,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(16, 185, 129, 0.06)', // Subtle Pistachio Mint glow
    ...(Platform.OS === 'web' ? ({ filter: 'blur(80px)' } as any) : {}),
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 130, // Generous clearance for floating dock
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
});
