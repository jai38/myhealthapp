import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../Foundations/Text';
import { color, radius, space } from '../../tokens';

export interface ListGroupProps {
  children: React.ReactNode;
  header?: string;
  footer?: string;
  separatorInset?: number;
  testID?: string;
}

// iOS-style inset grouped list: one white rounded card, hairline separators between rows only.
export function ListGroup({
  children,
  header,
  footer,
  separatorInset = space.lg,
  testID,
}: ListGroupProps) {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <View testID={testID}>
      {header !== undefined && (
        <Text variant="caption" tone="secondary" style={styles.header}>
          {header}
        </Text>
      )}
      <View style={styles.group}>
        {items.map((child, index) => (
          <React.Fragment key={index}>
            {index > 0 && <View style={[styles.separator, { marginLeft: separatorInset }]} />}
            {child}
          </React.Fragment>
        ))}
      </View>
      {footer !== undefined && (
        <Text variant="caption" tone="secondary" style={styles.footer}>
          {footer}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: space.lg,
    marginBottom: space.xs,
  },
  group: {
    backgroundColor: color.bg.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.border.subtle,
  },
  footer: {
    paddingHorizontal: space.lg,
    marginTop: space.xs,
  },
});
