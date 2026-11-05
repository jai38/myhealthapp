import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { IconButton } from '../Actions/IconButton';
import { Icon } from '../Foundations/Icon';
import { Text } from '../Foundations/Text';
import { color, radius, size, space } from '../../tokens';
import { t } from '../../strings';

export interface FilterBarProps {
  // Active filters only.
  filters: { key: string; label: string }[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
  onOpenFilters?: () => void;
  testID?: string;
}

export function FilterBar({ filters, onRemove, onClearAll, onOpenFilters, testID }: FilterBarProps) {
  return (
    <ScrollView
      testID={testID}
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={t('filter.activeCount', { count: filters.length })}
      contentContainerStyle={styles.row}
    >
      {onOpenFilters ? (
        <IconButton
          icon="funnel-outline"
          accessibilityLabel={t('filter.label')}
          onPress={onOpenFilters}
          testID={testID && `${testID}-open`}
        />
      ) : null}
      {filters.map((filter) => (
        <Pressable
          key={filter.key}
          testID={testID && `${testID}-chip-${filter.key}`}
          accessibilityRole="button"
          accessibilityLabel={t('filter.remove', { label: filter.label })}
          onPress={() => onRemove(filter.key)}
          style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
        >
          <Text variant="caption" tone="primary" style={styles.chipText}>
            {filter.label}
          </Text>
          <Icon name="close" size="sm" tone="info" />
        </Pressable>
      ))}
      {filters.length > 0 ? (
        <Pressable
          testID={testID && `${testID}-clear`}
          accessibilityRole="button"
          accessibilityLabel={t('common.clearAll')}
          onPress={onClearAll}
          style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
        >
          <Text variant="caption" tone="link">
            {t('common.clearAll')}
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: size.touchMin,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    backgroundColor: color.tone.info.bg,
  },
  chipText: {
    color: color.tone.info.fg,
  },
  clear: {
    minHeight: size.touchMin,
    minWidth: size.touchMin,
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
