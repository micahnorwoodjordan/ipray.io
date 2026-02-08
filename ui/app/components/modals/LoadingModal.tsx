// components/modals/LoadingModal.tsx
import React from 'react';
import { View, Modal, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { SPACING } from '../../themes/spacing';

type Props = {
  visible: boolean;
  message?: string;
};

export default function LoadingModal({ visible, message = "Submitting..." }: Props) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: SPACING.lg,           // replaced hardcoded padding
    backgroundColor: '#222',
    borderRadius: SPACING.md,      // nice rounded corners
    minWidth: 200,
    alignItems: 'center',
  },
  text: {
    marginTop: SPACING.sm,         // spacing between spinner and text
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
});
