import React, { createContext, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabBarClearance } from './navStyle';

// The floating tab bar sits over the tab screens. Inside a TabBarClearanceProvider, scrolling
// content pads its bottom by this much so the last row is never hidden behind the bar. Outside
// it (sheets, sign-in, modals) the clearance is 0.
const FloatingTabBar = createContext(false);

export function TabBarClearanceProvider({ children }: { children: React.ReactNode }) {
  return <FloatingTabBar.Provider value>{children}</FloatingTabBar.Provider>;
}

export function useTabBarClearance(): number {
  const floating = useContext(FloatingTabBar);
  const insets = useSafeAreaInsets();
  return floating ? tabBarClearance(insets.bottom) : 0;
}
