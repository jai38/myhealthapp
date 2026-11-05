import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from './styles-feed';

export function MetricsGrid({
  totalDosesCount,
  adherencePct,
  takenDosesCount,
  activeMedsCount,
  totalRecordsCount,
}: {
  totalDosesCount: number;
  adherencePct: number;
  takenDosesCount: number;
  activeMedsCount: number;
  totalRecordsCount: number;
}) {
  const router = useRouter();
  return (
    <>
      {/* 6. THREE-TILE STATS MATRIX (Clean, cohesive clinical slate) */}
      <View style={styles.metricsGrid}>
        {/* Adherence Rate */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(tabs)/medications')}
          activeOpacity={0.85}
        >
          <View style={[styles.metricIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Text style={styles.metricIcon}>⏱️</Text>
          </View>
          <Text style={styles.metricValue}>{totalDosesCount > 0 ? `${adherencePct}%` : '—'}</Text>
          <Text style={styles.metricLabel}>Adherence</Text>
          <View style={styles.metricFooter}>
            <Text style={styles.metricSubText}>
              {takenDosesCount}/{totalDosesCount || 0} Doses Done
            </Text>
          </View>
        </TouchableOpacity>

        {/* Active Medications */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(tabs)/medications')}
          activeOpacity={0.85}
        >
          <View style={[styles.metricIconBox, { backgroundColor: '#F0F9FF' }]}>
            <Text style={styles.metricIcon}>💊</Text>
          </View>
          <Text style={styles.metricValue}>{activeMedsCount}</Text>
          <Text style={styles.metricLabel}>Active Meds</Text>
          <View style={styles.metricFooter}>
            <Text style={styles.metricSubText}>Prescriptions</Text>
          </View>
        </TouchableOpacity>

        {/* Verified Health Records */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push({ pathname: '/records', params: { view: 'reports' } })}
          activeOpacity={0.85}
        >
          <View style={[styles.metricIconBox, { backgroundColor: '#F8FAFC' }]}>
            <Text style={styles.metricIcon}>📋</Text>
          </View>
          <Text style={styles.metricValue}>{totalRecordsCount}</Text>
          <Text style={styles.metricLabel}>Records</Text>
          <View style={styles.metricFooter}>
            <Text style={styles.metricSubText}>Labs & Summaries</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}
