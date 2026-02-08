import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';

type Props = {
  visible: boolean;
  message: string;
  onDismiss: () => void;
};

export default function ErrorModal({ visible, message, onDismiss }: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>oops...</Text>
          <Text style={styles.message}>{message}</Text>
          <Pressable onPress={onDismiss} style={styles.button}>
            <Text style={styles.buttonText}>okay</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
  width: '85%',
  backgroundColor: '#111827',
  borderRadius: 16,
  padding: 24,
  alignItems: 'center',

  // subtle red glow
  borderWidth: 1,
  borderColor: 'rgba(239, 68, 68, 0.5)',

  shadowColor: '#ef4444',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.35,
  shadowRadius: 12,

  elevation: 6, // Android glow
},


  title: {
    color: '#e5e7eb',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },

  message: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },

  buttonText: {
    color: '#e5e7eb',
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
