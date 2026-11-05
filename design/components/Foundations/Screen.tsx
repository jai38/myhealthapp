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
  // The wave sits inside the scrolling content, so it scrolls away with the
  // header instead of staying pinned behind the page.
  const waveNode = wave ? (
    <View pointerEvents="none" style={styles.waveSlot}>
      <WaveHeader />
    </View>
  ) : null;
  const content = (
    <>
      {waveNode}
      {children}
    </>
  );
  const body =
    scroll && onRefresh ? (
      <RefreshScroll onRefresh={onRefresh} contentContainerStyle={styles.content}>
        {content}
      </RefreshScroll>
    ) : scroll ? (
      <ScrollView contentContainerStyle={styles.content}>{content}</ScrollView>
    ) : (
      <View style={styles.fill}>{content}</View>
    );

  return (
    <View testID={testID} style={styles.root}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        {header ? <View style={styles.gutter}>{header}</View> : null}
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
  // The gutter lives on the content, not the scroll view, so the wave can run
  // edge to edge (absolute children are placed against the padding box).
  waveSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  safeArea: {
    flex: 1,
  },
  gutter: {
    paddingHorizontal: space.lg,
  },
  fill: {
    flex: 1,
    paddingHorizontal: space.lg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: space.lg,
  },
});
