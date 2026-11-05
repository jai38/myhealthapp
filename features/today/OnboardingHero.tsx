import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/index';
import { styles } from './styles-header';

export function OnboardingHero({
  isProcessing,
  onScanPrescription,
  onAddManual,
}: {
  isProcessing: boolean;
  onScanPrescription: () => void;
  onAddManual: () => void;
}) {
  return (
        <View style={styles.newPatientOnboardingHero}>
          <View style={styles.onboardingIconCircle}>
            <Text style={styles.onboardingHeroEmoji}>📸</Text>
          </View>
          <Text style={styles.onboardingHeroTitle}>Upload Your Prescription</Text>
          <Text style={styles.onboardingHeroSubtitle}>
            Snap a photo or upload an image of your prescription slip. MyHealth extracts your medicines, dosages, and sets up your personalized reminder schedule.
          </Text>

          <TouchableOpacity
            style={styles.onboardingPrimaryBtn}
            onPress={onScanPrescription}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <Text style={styles.onboardingPrimaryBtnText}>📸 Scan / Upload Prescription</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.onboardingSecondaryBtn}
            onPress={onAddManual}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <Text style={styles.onboardingSecondaryBtnText}>+ Add Medication Manually</Text>
          </TouchableOpacity>

          {/* 3-Step Simple Patient Guide */}
          <View style={styles.onboardingStepsCard}>
            <Text style={styles.onboardingStepsTitle}>How MyHealth Works:</Text>
            <View style={styles.onboardingStepItem}>
              <View style={styles.onboardingStepNumBadge}>
                <Text style={styles.onboardingStepNum}>1</Text>
              </View>
              <Text style={styles.onboardingStepText}>
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Upload Prescription: </Text>
                Camera or file upload of any doctor's prescription slip.
              </Text>
            </View>
            <View style={styles.onboardingStepItem}>
              <View style={styles.onboardingStepNumBadge}>
                <Text style={styles.onboardingStepNum}>2</Text>
              </View>
              <Text style={styles.onboardingStepText}>
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Review & Confirm: </Text>
                Pick your course duration (e.g. 5 days, 1 month) and exact reminder times.
              </Text>
            </View>
            <View style={styles.onboardingStepItem}>
              <View style={styles.onboardingStepNumBadge}>
                <Text style={styles.onboardingStepNum}>3</Text>
              </View>
              <Text style={styles.onboardingStepText}>
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Daily Tracker & Alarms: </Text>
                Receive 15-minute advance alerts, and 1-tap track every dose from your dashboard.
              </Text>
            </View>
          </View>
        </View>
  );
}
