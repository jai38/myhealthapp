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
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 30px rgba(14, 17, 22, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        } as any)
      : {}),
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentCoralLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 91, 34, 0.15)',
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
          boxShadow: '0 4px 12px rgba(14, 17, 22, 0.15)',
        } as any)
      : {}),
  },
  actionButtonActive: {
    backgroundColor: colors.accentCoral,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 14px rgba(255, 91, 34, 0.4)',
        } as any)
      : {}),
  },
  actionArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
