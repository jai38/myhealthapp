import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme/index';
import { Badge } from '../../components/Badge';

export interface LegalTermsModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  visible,
  onClose,
  initialTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={typography.h2}>Legal & Compliance</Text>
              <Text style={[typography.bodyMuted, { marginTop: 2 }]}>
                Transparency & Health Data Protection
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Segmented Tab Bar */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
              onPress={() => setActiveTab('terms')}
            >
              <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>
                Terms of Service
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
              onPress={() => setActiveTab('privacy')}
            >
              <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>
                Health Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content ScrollView */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={true}>
            {activeTab === 'terms' ? (
              <View style={styles.contentSection}>
                <View style={styles.badgeRow}>
                  <Badge label="Last Updated: October 2026" variant="neutral" />
                  <Badge label="Clinical Safety Notice" variant="coral" />
                </View>

                <Text style={styles.sectionHeader}>1. Acceptance of Terms</Text>
                <Text style={styles.paragraph}>
                  By creating an account or accessing the MyHealth mobile application and services, you explicitly agree to be bound by these Terms of Service and all applicable national and international healthcare data regulations. If you do not agree, you must discontinue use immediately.
                </Text>

                <Text style={styles.sectionHeader}>2. Critical Medical Emergency Disclaimer</Text>
                <View style={styles.alertCard}>
                  <Text style={styles.alertTitle}>⚠️ NOT A MEDICAL EMERGENCY SERVICE</Text>
                  <Text style={styles.alertText}>
                    MyHealth is a personal health data organization and reminder tool. It is NOT an emergency response platform, diagnostic medical device, or licensed healthcare provider. If you are experiencing a medical emergency, call your local emergency services (e.g., 911, 112, 108) or proceed to the nearest hospital emergency room immediately.
                  </Text>
                </View>

                <Text style={styles.sectionHeader}>3. No Doctor-Patient Relationship</Text>
                <Text style={styles.paragraph}>
                  The content, insights, dose schedules, and AI-extracted prescription summaries provided by MyHealth are for personal informational reference only. They do NOT constitute medical advice, diagnosis, or clinical treatment recommendations. Never disregard professional medical advice or delay seeking treatment because of information displayed in this application.
                </Text>

                <Text style={styles.sectionHeader}>4. Patient Verification of AI Outputs</Text>
                <Text style={styles.paragraph}>
                  Prescription digitization uses optical character recognition and advanced AI models. While highly accurate, AI models may misinterpret handwritten doctor notes or complex medical abbreviations. You agree that it is your sole responsibility to inspect, verify, and confirm all extracted medicine names, dosages, and frequencies against your physical doctor's prescription before committing them to your active regimen.
                </Text>

                <Text style={styles.sectionHeader}>5. Account Security & Responsibilities</Text>
                <Text style={styles.paragraph}>
                  You are responsible for maintaining the confidentiality of your account credentials. You must immediately notify MyHealth of any unauthorized access. You may not share your account credentials or use the service for unlawful or fraudulent medical purposes.
                </Text>

                <Text style={styles.sectionHeader}>6. Account Deletion & Termination</Text>
                <Text style={styles.paragraph}>
                  You have the unilateral right to delete your account and all associated medical data at any time from your Account Settings. Upon deletion, all records, documents, and logs are permanently purged from active systems.
                </Text>
              </View>
            ) : (
              <View style={styles.contentSection}>
                <View style={styles.badgeRow}>
                  <Badge label="HIPAA & DPDP Aligned" variant="success" />
                  <Badge label="Zero Data Brokerage" variant="info" />
                </View>

                <Text style={styles.sectionHeader}>1. Commitment to Health Data Privacy</Text>
                <Text style={styles.paragraph}>
                  Your health information is sensitive and private. MyHealth is architected around strict privacy-by-design principles adhering to HIPAA (US), DPDP (India), and GDPR (EU) patient rights standards.
                </Text>

                <Text style={styles.sectionHeader}>2. What Health Data We Collect</Text>
                <Text style={styles.paragraph}>
                  We collect only the minimum necessary data to provide health organization services:
                </Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Account Credentials:</Text> Email address, encrypted password hash (BCrypt), and patient profile name.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Clinical Documents:</Text> Prescription photographs, doctor consultation notes, and laboratory reports uploaded by you.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Medication Regimens:</Text> Prescribed drug names, dosage strengths, administration routes, and scheduled reminder times.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Adherence Telemetry:</Text> Timestamped dose confirmation logs (Taken, Skipped, Snoozed) to compute personal consistency metrics.</Text>

                <Text style={styles.sectionHeader}>3. Explicit Guarantee: We Never Sell Your Data</Text>
                <View style={[styles.alertCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                  <Text style={[styles.alertTitle, { color: '#166534' }]}>🛡️ ZERO DATA MONETIZATION PROMISE</Text>
                  <Text style={[styles.alertText, { color: '#14532D' }]}>
                    MyHealth will NEVER sell, lease, rent, or trade your personal health information, prescription documents, or medical history to third-party data brokers, pharmaceutical marketers, health insurance underwriters, or advertising networks.
                  </Text>
                </View>

                <Text style={styles.sectionHeader}>4. How AI Processing Operates</Text>
                <Text style={styles.paragraph}>
                  When you upload a paper prescription or lab report, it is processed via secure, stateless AI model endpoints (Google Gemini Flash) solely for text extraction and clinical normalization. Your documents are never used to train public foundational AI models without separate explicit de-identified consent.
                </Text>

                <Text style={styles.sectionHeader}>5. Security Architecture & Safeguards</Text>
                <Text style={styles.paragraph}>
                  We implement multi-layered enterprise defense for your medical records:
                </Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Encryption in Transit:</Text> All API communications and document transfers enforce TLS 1.3 / HTTPS encryption.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Encryption at Rest:</Text> Object storage buckets and PostgreSQL databases are encrypted using AES-256 standards.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Tenant Isolation:</Text> Strict Insecure Direct Object Reference (IDOR) controls ensure each patient's records are accessible solely by their authenticated token.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Short-Lived Signed URLs:</Text> Document previews and uploads use cryptographically signed tokens with strict 15-minute expirations.</Text>

                <Text style={styles.sectionHeader}>6. Your Data Rights: Portability & Deletion</Text>
                <Text style={styles.paragraph}>
                  You own your health data. At any time, you can:
                </Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Export:</Text> Generate doctor-ready PDF reports of your complete medical timeline to share or archive.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Erase:</Text> Request complete deletion of your account, which immediately purges all stored files and database entries.</Text>
              </View>
            )}

            <View style={{ height: spacing.xxl * 2 }} />
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>I Understand & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '90%',
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.full,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  activeTab: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    ...typography.bodyMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  contentSection: {
    paddingBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.h3,
    fontSize: 15,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  paragraph: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 6,
    paddingLeft: spacing.xs,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  alertCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  alertTitle: {
    ...typography.body,
    fontWeight: '800',
    fontSize: 13,
    color: '#9A3412',
    marginBottom: 4,
  },
  alertText: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 18,
    color: '#7C2D12',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    ...typography.button,
    color: colors.surface,
  },
});
