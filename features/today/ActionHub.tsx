import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/index';
import { styles } from './styles-feed';

export function ActionHub({
  isProcessing,
  onScanPrescription,
  onAddManual,
}: {
  isProcessing: boolean;
  onScanPrescription: () => void;
  onAddManual: () => void;
}) {
  const router = useRouter();
  return (
    <>
      {/* 7. THREE-TILE ACTION HUB */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.sectionSub}>Prescription scanner, medicine logs & health records</Text>
      </View>

      <View style={styles.actionHubGrid}>
        {/* Tile 1: AI Prescription Scanner */}
        <TouchableOpacity
          style={styles.actionHubTile}
          onPress={onScanPrescription}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <View style={[styles.actionHubIconBadge, { backgroundColor: '#F0F9FF' }]}>
            <Text style={styles.actionHubEmoji}>📸</Text>
          </View>
          <Text style={styles.actionHubTitle}>Scan Prescription</Text>
          <Text style={styles.actionHubDesc}>Instant OCR extraction to verify medicines</Text>
          <View style={[styles.actionHubTag, { backgroundColor: '#F0F9FF' }]}>
            <Text style={[styles.actionHubTagText, { color: colors.accentCoral }]}>Smart OCR</Text>
          </View>
        </TouchableOpacity>

        {/* Tile 2: Add Medication */}
        <TouchableOpacity
          style={styles.actionHubTile}
          onPress={onAddManual}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <View style={[styles.actionHubIconBadge, { backgroundColor: '#F0F9FF' }]}>
            <Text style={styles.actionHubEmoji}>💊</Text>
          </View>
          <Text style={styles.actionHubTitle}>Add Medication</Text>
          <Text style={styles.actionHubDesc}>Custom timing, dose reminders & instructions</Text>
          <View style={[styles.actionHubTag, { backgroundColor: '#F0F9FF' }]}>
            <Text style={[styles.actionHubTagText, { color: colors.accentCoral }]}>+ Add Med</Text>
          </View>
        </TouchableOpacity>

        {/* Tile 3: Doctor Summary Export */}
        <TouchableOpacity
          style={styles.actionHubTile}
          onPress={() => router.push({ pathname: '/records', params: { view: 'reports' } })}
          activeOpacity={0.8}
        >
          <View style={[styles.actionHubIconBadge, { backgroundColor: '#F8FAFC' }]}>
            <Text style={styles.actionHubEmoji}>📄</Text>
          </View>
          <Text style={styles.actionHubTitle}>Doctor Summary</Text>
          <Text style={styles.actionHubDesc}>Shareable overview for your next clinic visit</Text>
          <View style={[styles.actionHubTag, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[styles.actionHubTagText, { color: colors.textSecondary }]}>Export PDF</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}
