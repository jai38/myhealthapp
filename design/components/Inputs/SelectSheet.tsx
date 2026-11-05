import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, Text } from '../Foundations';
import { color, elevation, radius, size, space } from '../../tokens';
import { FieldLabel } from './FieldBox';
import { t } from '../../strings';
import { choiceCheckIcon, choiceLayout } from './choiceStyle';

export interface SelectSheetProps {
  label: string;
  title: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
}

// Uses Modal directly; switches to the shared BottomSheet after task 11.
export function SelectSheet({
  label,
  title,
  options,
  value,
  onChange,
  placeholder = t('select.placeholder'),
  disabled = false,
  testID,
}: SelectSheetProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: selectedLabel ?? '' }}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.field, { borderColor: color.border.input }]}
      >
        <Text
          variant="body"
          tone={selectedLabel ? 'primary' : 'tertiary'}
          style={styles.fieldText}
          numberOfLines={1}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <Icon name="chevron-forward" size="md" tone="secondary" />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRoot}>
          {/* Tap-outside to close; hidden from screen readers, which use the Close button. */}
          <Pressable
            accessible={false}
            importantForAccessibility="no"
            onPress={() => setOpen(false)}
            style={styles.scrim}
          />
          <View style={styles.sheet} accessibilityViewIsModal>
            <Text variant="title3">{title}</Text>
            <ScrollView style={styles.list}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    testID={testID ? `${testID}-option-${option.value}` : undefined}
                    accessibilityRole="radio"
                    accessibilityLabel={option.label}
                    accessibilityState={{ checked: isSelected }}
                    hitSlop={choiceLayout.hitSlop}
                    onPress={() => pick(option.value)}
                    style={styles.option}
                  >
                    <Text
                      variant={isSelected ? 'bodyStrong' : 'body'}
                      style={[
                        styles.optionText,
                        { color: isSelected ? color.text.link : color.text.primary },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {/* The check icon marks the selection, not the color. */}
                    {isSelected ? (
                      <Icon name={choiceCheckIcon} size="md" color={color.action.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={choiceLayout.hitSlop}
              onPress={() => setOpen(false)}
              style={styles.closeButton}
            >
              <Text variant="bodyStrong" tone="link">
                {t('common.close')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: size.inputHeight,
    paddingHorizontal: space.lg,
    borderWidth: 1,
    borderRadius: radius.control,
    backgroundColor: color.bg.card,
  },
  fieldText: {
    flex: 1,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: color.text.primary,
    opacity: 0.4,
  },
  sheet: {
    backgroundColor: color.bg.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.xl,
    gap: space.sm,
    ...elevation.sheet,
  },
  list: {
    maxHeight: '70%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: choiceLayout.minHeight,
  },
  optionText: {
    flex: 1,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: choiceLayout.minHeight,
  },
});
