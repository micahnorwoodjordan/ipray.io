import React, { useEffect, useRef, useState } from 'react';
import { View, Modal, Text, StyleSheet, Animated } from 'react-native';
import { SPACING } from '../../themes/spacing';

type Props = {
  visible: boolean;
  message: string;
  onDismiss: () => void;
};

export default function WarningModal({ visible, message, onDismiss }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShowModal(true);

      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setShowModal(false);
          onDismiss();
        });
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!showModal) return null;

  return (
    <Modal transparent animationType="none" visible={showModal} onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity }]}>
          <Text style={styles.title}>⚠️ whoah!</Text>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // dim background
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(180,83,9,0.50)', // amber with 85% opacity
    borderRadius: SPACING.md,
    minWidth: 220,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
  },
});
