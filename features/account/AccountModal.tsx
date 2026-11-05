import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { IconButton, TopBar } from '../../design/components';
import { color } from '../../design/tokens';
import { t } from '../../design/strings';
import { AccountContent } from './AccountContent';

export interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
}

// The account sheet opened from Today. The same content is the Profile tab.
export const AccountModal: React.FC<AccountModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TopBar
          title={t('profile.accountTitle')}
          right={
            <IconButton
              icon="close"
              accessibilityLabel={t('common.close')}
              onPress={onClose}
            />
          }
        />

        <AccountContent resetKey={visible} onSignedOut={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg.screen,
  },
});
