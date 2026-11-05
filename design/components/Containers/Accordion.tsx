import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { color, size } from '../../tokens';
import { t } from '../../strings';

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
  testID?: string;
}

export function Accordion({ title, children, initiallyOpen = false, testID }: AccordionProps) {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <View testID={testID}>
      <Pressable
        testID={testID && `${testID}-header`}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={open ? t('container.collapse') : t('container.expand')}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <Text variant="title3" tone="primary" style={styles.title}>
          {title}
        </Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size="md" tone="primary" />
      </Pressable>
      {open && <View testID={testID && `${testID}-content`}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: size.touchMin,
  },
  pressed: {
    backgroundColor: color.bg.subtle,
  },
  title: {
    flex: 1,
  },
});
