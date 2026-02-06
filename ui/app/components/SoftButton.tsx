import { Pressable, Text, StyleSheet } from 'react-native';
import { SPACING } from '../themes/spacing';

type Props = {
  title: string;
  onPress: () => void;
};

export function SoftButton({ title, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(33, 157, 81, 0.9)', // slightly translucent
    paddingVertical: SPACING.md,               // more vertical air
    paddingHorizontal: SPACING.xl,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.08,      // lighter shadow
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  text: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',        // not too bold
    letterSpacing: 0.4,
  },
});
