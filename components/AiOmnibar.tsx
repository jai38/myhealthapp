import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme/index';

export interface AiOmnibarProps {
  onScanPress?: () => void;
  onSubmitPrompt?: (prompt: string) => void;
  placeholder?: string;
}

export const AiOmnibar: React.FC<AiOmnibarProps> = ({
  onScanPress,
  onSubmitPrompt,
  placeholder = 'Search medicines, records, or snap a prescription 📸',
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmitPrompt?.(query.trim());
      setQuery('');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Camera / Scan Pill Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={onScanPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Scan Prescription Document"
      >
        <Text style={styles.scanEmoji}>📸</Text>
      </TouchableOpacity>

      {/* 2. Text Input */}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
      />

      {/* 3. Send / Action Button */}
      <TouchableOpacity
        style={[styles.actionButton, query.trim().length > 0 ? styles.actionButtonActive : null]}
        onPress={query.trim().length > 0 ? handleSubmit : onScanPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Submit Query or AI Action"
      >
        <Text style={styles.actionArrow}>
          {query.trim().length > 0 ? '↑' : '✨'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        } as any)
      : shadows.sm),
  },
  scanButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanEmoji: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm + 2,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 40,
    fontWeight: '500',
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceObsidian,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
        } as any)
      : {}),
  },
  actionButtonActive: {
    backgroundColor: colors.accentCoral,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
        } as any)
      : {}),
  },
  actionArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
