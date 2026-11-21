// TEST ONLY. A small stand-in for `react-native` used by the render tests (vitest.render.config.ts).
//
// Real React Native ships Flow source and native modules, so it cannot load in Node. The unit
// tests alias it to react-native-web, but web components render DOM hosts (`div`) that React
// Native Testing Library cannot query. This shim keeps every non-visual API from
// react-native-web (StyleSheet, Platform, Easing, …) and swaps the visual components for host
// components with the names RNTL looks for (`View`, `Text`, `TextInput`, `RCTScrollView`,
// `Modal`, `Image`, `RCTSwitch`), the same approach as React Native's own Jest setup.
//
// Animations finish at once and nothing measures layout, so these tests check what renders,
// not how it looks. Screenshots (scripts/screens.mjs) cover the look.
import React from 'react';
// react-native-web ships no types. Its non-visual APIs match React Native's, so they are typed
// from `react-native` here.
// @ts-expect-error untyped package
import * as WebUntyped from 'react-native-web';
import type * as RN from 'react-native';

const Web = WebUntyped as Pick<typeof RN, 'StyleSheet' | 'Platform' | 'Easing' | 'PixelRatio' | 'I18nManager'>;

type AnyProps = { children?: React.ReactNode; [prop: string]: unknown };

function host(name: string) {
  const Host = React.forwardRef<unknown, AnyProps>((props, ref) =>
    React.createElement(name, { ...props, ref }, props.children as React.ReactNode),
  );
  Host.displayName = name;
  return Host;
}

export const View = host('View');
export const Text = host('Text');
export const TextInput = host('TextInput');
export const Image = host('Image');
export const Switch = host('RCTSwitch');
export const ActivityIndicator = host('ActivityIndicator');
export const RefreshControl = host('RefreshControl');
export const SafeAreaView = View;
export const KeyboardAvoidingView = View;

export const ScrollView = React.forwardRef<unknown, AnyProps>(({ refreshControl, ...props }, ref) =>
  React.createElement('RCTScrollView', { ...props, ref }, refreshControl as React.ReactNode, props.children as React.ReactNode),
);
ScrollView.displayName = 'ScrollView';

export function Modal({ visible = true, children, ...props }: AnyProps & { visible?: boolean }) {
  if (!visible) return null;
  return React.createElement('Modal', { ...props, visible }, children);
}

type PressableProps = AnyProps & {
  disabled?: boolean | null;
  accessibilityState?: Record<string, unknown> | undefined;
  children?: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
  style?: unknown;
};

export const Pressable = React.forwardRef<unknown, PressableProps>(
  ({ children, style, disabled, accessibilityState, onPress, onLongPress, ...props }, ref) =>
    React.createElement(
      'View',
      {
        accessible: true,
        ...props,
        // Like React Native, a disabled Pressable declines the touch, so it ignores presses.
        // RNTL reads this to decide whether a press reaches the handler.
        onStartShouldSetResponder: () => !disabled,
        onPress,
        onLongPress,
        ref,
        style: typeof style === 'function' ? style({ pressed: false }) : style,
        accessibilityState: disabled ? { ...(accessibilityState ?? {}), disabled: true } : accessibilityState,
      },
      typeof children === 'function' ? children({ pressed: false }) : children,
    ),
);
Pressable.displayName = 'Pressable';
export const TouchableOpacity = Pressable;
export const TouchableHighlight = Pressable;
export const TouchableWithoutFeedback = Pressable;

type ListProps<T> = AnyProps & {
  data?: readonly T[] | null;
  renderItem: (info: { item: T; index: number }) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  ListHeaderComponent?: React.ReactNode | React.ComponentType;
  ListFooterComponent?: React.ReactNode | React.ComponentType;
  ListEmptyComponent?: React.ReactNode | React.ComponentType;
};

function slot(c: React.ReactNode | React.ComponentType | undefined): React.ReactNode {
  if (c === undefined || c === null) return null;
  return typeof c === 'function' ? React.createElement(c as React.ComponentType) : (c as React.ReactNode);
}

export function FlatList<T>({
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  ...props
}: ListProps<T>) {
  const items = data ?? [];
  return React.createElement(
    ScrollView,
    props,
    slot(ListHeaderComponent),
    items.length === 0
      ? slot(ListEmptyComponent)
      : items.map((item, index) =>
          React.createElement(
            React.Fragment,
            { key: keyExtractor ? keyExtractor(item, index) : String(index) },
            renderItem({ item, index }),
          ),
        ),
    slot(ListFooterComponent),
  );
}

// Animations complete immediately; values never change on their own.
class AnimatedValue {
  constructor(private value: number) {}
  setValue(v: number) {
    this.value = v;
  }
  interpolate() {
    return this;
  }
  stopAnimation() {}
  addListener() {
    return '';
  }
  removeAllListeners() {}
  __getValue() {
    return this.value;
  }
}

const finished = () => ({
  start: (cb?: (r: { finished: boolean }) => void) => cb?.({ finished: true }),
  stop: () => {},
  reset: () => {},
});

export const Animated = {
  Value: AnimatedValue,
  View,
  Text,
  ScrollView,
  Image,
  timing: finished,
  spring: finished,
  decay: finished,
  loop: finished,
  sequence: finished,
  parallel: finished,
  stagger: finished,
  delay: finished,
  event: () => () => {},
  createAnimatedComponent: <C,>(c: C) => c,
};

export const Alert = { alert: () => {} };
export const Share = { share: async () => ({ action: 'dismissedAction' }) };
export const Linking = {
  openURL: async () => true,
  canOpenURL: async () => true,
  getInitialURL: async () => null,
  addEventListener: () => ({ remove: () => {} }),
};
export const AppState = {
  currentState: 'active',
  addEventListener: () => ({ remove: () => {} }),
};
export const AccessibilityInfo = {
  isReduceMotionEnabled: async () => true,
  isScreenReaderEnabled: async () => false,
  addEventListener: () => ({ remove: () => {} }),
  announceForAccessibility: () => {},
};

const WINDOW = { width: 360, height: 800, scale: 2, fontScale: 1 };
export const useWindowDimensions = () => WINDOW;
// The system light/dark setting. Tests set globalThis.__rnColorScheme to 'dark' to simulate it.
export const useColorScheme = (): 'light' | 'dark' =>
  (globalThis as { __rnColorScheme?: 'light' | 'dark' }).__rnColorScheme ?? 'light';
export const Dimensions = {
  get: () => WINDOW,
  addEventListener: () => ({ remove: () => {} }),
};

export const StyleSheet = Web.StyleSheet;
export const Platform = Web.Platform;
export const Easing = Web.Easing;
export const PixelRatio = Web.PixelRatio;
export const I18nManager = Web.I18nManager;
export const Keyboard = { dismiss: () => {}, addListener: () => ({ remove: () => {} }) };

export type ViewStyle = Record<string, unknown>;
export type TextStyle = Record<string, unknown>;
export type StyleProp<T> = T | readonly StyleProp<T>[] | null | undefined | false;
