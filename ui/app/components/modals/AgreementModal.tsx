import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Pressable,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  prayerText: string;
};

export default function AgreementModal({
  visible,
  onClose,
  prayerText,
}: Props) {
  const translateX = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    translateX.setValue(-40);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 40,
        duration: 600,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [{ translateX }],
            },
          ]}
        >
          <Text style={styles.prayerText}>{prayerText}</Text>

          <Pressable onPress={handleClose}>
            <Text style={styles.closeText}>back</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.95)', // soft dark veil
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  card: {
    maxWidth: 500,
  },

  prayerText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 32,
  },

  closeText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    letterSpacing: 2,
  },
});
