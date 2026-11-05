import React from 'react';
import { StyleSheet, View } from 'react-native';
import { color } from '../../design/tokens';
import { AccountContent } from './AccountContent';

// The Profile tab: the same account content as the sheet opened from Today.
export default function ProfileScreen() {
  return (
    <View style={styles.root}>
      <AccountContent />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg.screen },
});
