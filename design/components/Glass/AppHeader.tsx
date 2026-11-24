import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LogoMark } from '../../assets/LogoMark';
import { layout, space } from '../../tokens';
import { useTheme } from '../../theme';
import { t } from '../../strings';
import { Text } from '../Foundations/Text';

export interface AppHeaderProps {
  testID?: string;
}

// v4 header: the logo lockup on the left. Search and the bell are hidden until their phases
// (decision D3), so the right side is empty and there is no profile icon.
export function AppHeader({ testID }: AppHeaderProps) {
  const { color: c } = useTheme();
  return (
    <View
      testID={testID}
      style={styles.bar}
      accessible
      accessibilityRole="header"
      accessibilityLabel={t('brand.name')}
    >
      <LogoMark size={30} />
      <Text variant="wordmark" style={{ color: c.text.primary }}>
        {t('brand.name').toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: layout.screenMargin,
    minHeight: 44,
  },
});
