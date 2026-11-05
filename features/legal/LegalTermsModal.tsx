import React, { useState } from 'react';
import { Modal, View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../design/components/Foundations/Text';
import { Icon } from '../../design/components/Foundations/Icon';
import { IconButton } from '../../design/components/Actions/IconButton';
import { Button } from '../../design/components/Actions/Button';
import { SegmentedControl } from '../../design/components/Containers/SegmentedControl';
import { color, elevation, font, radius, space } from '../../design/tokens';
import type { ToneName } from '../../design/tokens';
import { t } from '../../design/strings';

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
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Scrim: a token-coloured layer behind the sheet. */}
        <View style={styles.scrim} pointerEvents="none" />
        <View style={styles.sheetContainer}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text variant="title2">{t('legal.title')}</Text>
              <Text variant="callout" tone="secondary">
                {t('legal.subtitle')}
              </Text>
            </View>
            <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={onClose} />
          </View>

          <View style={styles.tabs}>
            <SegmentedControl<'terms' | 'privacy'>
              options={[
                { value: 'terms', label: t('legal.tabTerms') },
                { value: 'privacy', label: t('legal.tabPrivacy') },
              ]}
              value={activeTab}
              onChange={setActiveTab}
            />
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={true}>
            {activeTab === 'terms' ? <TermsContent /> : <PrivacyContent />}
            <View style={styles.bottomGap} />
          </ScrollView>

          <View style={styles.footer}>
            <Button label={t('legal.done')} variant="primary" fullWidth onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

function TermsContent() {
  return (
    <View style={styles.contentSection}>
      <View style={styles.badgeRow}>
        <Pill label={t('legal.terms.updated')} tone="neutral" />
        <Pill label={t('legal.terms.safetyBadge')} tone="caution" />
      </View>

      <Heading>{t('legal.terms.s1Title')}</Heading>
      <Para>{t('legal.terms.s1Body')}</Para>

      <Heading>{t('legal.terms.s2Title')}</Heading>
      <AlertCard icon="warning-outline" tone="caution" title={t('legal.terms.s2AlertTitle')} body={t('legal.terms.s2AlertBody')} />

      <Heading>{t('legal.terms.s3Title')}</Heading>
      <Para>{t('legal.terms.s3Body')}</Para>

      <Heading>{t('legal.terms.s4Title')}</Heading>
      <Para>{t('legal.terms.s4Body')}</Para>

      <Heading>{t('legal.terms.s5Title')}</Heading>
      <Para>{t('legal.terms.s5Body')}</Para>

      <Heading>{t('legal.terms.s6Title')}</Heading>
      <Para>{t('legal.terms.s6Body')}</Para>
    </View>
  );
}

function PrivacyContent() {
  return (
    <View style={styles.contentSection}>
      <View style={styles.badgeRow}>
        <Pill label={t('legal.privacy.hipaaBadge')} tone="success" />
        <Pill label={t('legal.privacy.brokerBadge')} tone="info" />
      </View>

      <Heading>{t('legal.privacy.s1Title')}</Heading>
      <Para>{t('legal.privacy.s1Body')}</Para>

      <Heading>{t('legal.privacy.s2Title')}</Heading>
      <Para>{t('legal.privacy.s2Intro')}</Para>
      <Bullet label={t('legal.privacy.s2CredLabel')} body={t('legal.privacy.s2CredBody')} />
      <Bullet label={t('legal.privacy.s2DocLabel')} body={t('legal.privacy.s2DocBody')} />
      <Bullet label={t('legal.privacy.s2MedLabel')} body={t('legal.privacy.s2MedBody')} />
      <Bullet label={t('legal.privacy.s2AdhLabel')} body={t('legal.privacy.s2AdhBody')} />

      <Heading>{t('legal.privacy.s3Title')}</Heading>
      <AlertCard icon="shield-checkmark" tone="success" title={t('legal.privacy.s3AlertTitle')} body={t('legal.privacy.s3AlertBody')} />

      <Heading>{t('legal.privacy.s4Title')}</Heading>
      <Para>{t('legal.privacy.s4Body')}</Para>

      <Heading>{t('legal.privacy.s5Title')}</Heading>
      <Para>{t('legal.privacy.s5Intro')}</Para>
      <Bullet label={t('legal.privacy.s5TransitLabel')} body={t('legal.privacy.s5TransitBody')} />
      <Bullet label={t('legal.privacy.s5RestLabel')} body={t('legal.privacy.s5RestBody')} />
      <Bullet label={t('legal.privacy.s5TenantLabel')} body={t('legal.privacy.s5TenantBody')} />
      <Bullet label={t('legal.privacy.s5UrlLabel')} body={t('legal.privacy.s5UrlBody')} />

      <Heading>{t('legal.privacy.s6Title')}</Heading>
      <Para>{t('legal.privacy.s6Intro')}</Para>
      <Bullet label={t('legal.privacy.s6ExportLabel')} body={t('legal.privacy.s6ExportBody')} />
      <Bullet label={t('legal.privacy.s6EraseLabel')} body={t('legal.privacy.s6EraseBody')} />
    </View>
  );
}

function Heading({ children }: { children: string }) {
  return (
    <Text variant="title3" style={styles.heading}>
      {children}
    </Text>
  );
}

function Para({ children }: { children: string }) {
  return (
    <Text variant="callout" tone="secondary" style={styles.paragraph}>
      {children}
    </Text>
  );
}

function Bullet({ label, body }: { label: string; body: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text variant="callout" tone="secondary" style={styles.bulletText}>
        <Text variant="callout" tone="primary" style={styles.boldLabel}>
          {label}
        </Text>{' '}
        {body}
      </Text>
    </View>
  );
}

function AlertCard({
  icon,
  tone,
  title,
  body,
}: {
  icon: 'warning-outline' | 'shield-checkmark';
  tone: 'caution' | 'success';
  title: string;
  body: string;
}) {
  const palette = color.tone[tone];
  return (
    <View style={[styles.alertCard, { backgroundColor: palette.bg }]}>
      <View style={styles.alertTitleRow}>
        <Icon name={icon} size="sm" color={palette.fg} />
        <Text variant="bodyStrong" style={[styles.alertTitle, { color: palette.fg }]}>
          {title}
        </Text>
      </View>
      <Text variant="caption" tone="secondary">
        {body}
      </Text>
    </View>
  );
}

function Pill({ label, tone }: { label: string; tone: ToneName }) {
  const palette = color.tone[tone];
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text variant="caption" style={{ color: palette.fg }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: color.text.primary,
    opacity: 0.45,
  },
  sheetContainer: {
    backgroundColor: color.bg.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '90%',
    paddingBottom: space.lg,
    ...elevation.sheet,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  headerText: {
    flex: 1,
    gap: space.xxs,
    paddingRight: space.sm,
  },
  tabs: {
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  body: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  contentSection: {
    paddingBottom: space.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginBottom: space.md,
  },
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
  },
  heading: {
    marginTop: space.md,
    marginBottom: space.xs,
  },
  paragraph: {
    marginBottom: space.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    marginBottom: space.xs,
    paddingLeft: space.xs,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: color.text.secondary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
  },
  boldLabel: {
    fontFamily: font.semibold,
  },
  alertCard: {
    borderRadius: radius.md,
    padding: space.md,
    marginVertical: space.sm,
    gap: space.xs,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  alertTitle: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border.subtle,
  },
  bottomGap: {
    height: space.xxl * 2,
  },
});
