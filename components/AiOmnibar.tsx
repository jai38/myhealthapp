import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/index';

export interface AiOmnibarProps {
  onScanPress?: () => void;
  onSubmitPrompt?: (prompt: string) => void;
  placeholder?: string;
}

export const AiOmnibar: React.FC<AiOmnibarProps> = ({
  onScanPress,
  onSubmitPrompt,
  placeholder = 'Ask AI or scan prescription...',
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
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 6px 20px rgba(17, 20, 24, 0.05)',
        } as any)
      : {}),
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanEmoji: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm + 2,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 40,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: colors.accentCoral,
  },
  actionArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
