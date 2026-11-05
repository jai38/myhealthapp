import React from 'react';
import { View, Text } from 'react-native';
import { spacing } from '../../theme/index';
import { styles } from './styles-feed';

export function SecurityFooter() {
  return (
    <>
      {/* 9. ADVANCED ENCRYPTION & PRIVACY SHIELD FOOTER */}
      <View style={styles.securityFooter}>
        <Text style={styles.securityShieldIcon}>🔒</Text>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.securityTitle}>Encrypted Health Vault</Text>
          <Text style={styles.securityText}>
            Your medical records and doses are protected with local and cloud encryption. No data is modified without your explicit clinical review.
          </Text>
        </View>
      </View>
    </>
  );
}
