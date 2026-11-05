import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color, space } from '../../tokens';
import { RefreshScroll } from './RefreshScroll';
import { WaveHeader } from './WaveHeader';

export interface ScreenProps {
  children?: React.ReactNode;
  scroll?: boolean;
  onRefresh?: () => Promise<void>;
  // Fixed above the scrolling body, so it does not scroll away.
  header?: React.ReactNode;
  wave?: boolean;
  testID?: string;
}

// The outer View paints the white background, so the wave can sit behind the safe area.
export function Screen({
  children,
  scroll = true,
  onRefresh,
  header,
  wave = false,
  testID,
}: ScreenProps) {
  const body =
    scroll && onRefresh ? (
      <RefreshScroll onRefresh={onRefresh} contentContainerStyle={styles.content}>
        {children}
      </RefreshScroll>
    ) : scroll ? (
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    ) : (
      <View style={styles.fill}>{children}</View>
    );

  return (
    <View testID={testID} style={styles.root}>
      {wave ? (
        <View pointerEvents="none" style={styles.waveSlot}>
          <WaveHeader />
        </View>
      ) : null}
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        {header}
        {body}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.bg.screen,
  },
  waveSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: space.lg,
  },
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
