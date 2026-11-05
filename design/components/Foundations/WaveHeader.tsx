import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { color } from '../../tokens';

const WAVE_HEIGHT = 64;
const WAVE_PATH = 'M0 28 C 60 8, 120 8, 180 28 S 300 48, 360 24 L 360 64 L 0 64 Z';

export interface WaveHeaderProps {
  height?: number;
  children?: React.ReactNode;
  testID?: string;
}

// Decorative only. The SVG is hidden from assistive tech, and the rest of the header stays white.
export function WaveHeader({ height = 160, children, testID }: WaveHeaderProps) {
  return (
    <View testID={testID} style={[styles.container, { height }]}>
      <View style={styles.waveLayer} pointerEvents="none" accessible={false}>
        <Svg width="100%" height={WAVE_HEIGHT} viewBox="0 0 360 64" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="ayoreniWaveGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={color.wave.from} stopOpacity={0.4} />
              <Stop offset="1" stopColor={color.wave.to} stopOpacity={0.4} />
            </LinearGradient>
          </Defs>
          <Path d={WAVE_PATH} fill="url(#ayoreniWaveGradient)" />
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: color.bg.screen,
  },
  waveLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: WAVE_HEIGHT,
  },
});
