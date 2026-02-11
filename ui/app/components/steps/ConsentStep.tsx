import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { SPACING } from '../../themes/spacing';
import { useSwipe } from '../../hooks/swipe';
import SoftButton from '../SoftButton';

type Props = {
  onDecide: (permissionToShare: boolean) => void;
  onBack: () => void;
};

export default function ConsentStep({ onDecide, onBack }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // intentionally no left swipe
  const { panResponder, translateX } = useSwipe({
    onRightSwipe: onBack,
  });

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
        <View style={styles.content}>
          <Text style={styles.title}>some prayers are private, but others can edify the Church when shared</Text>
          <Text style={styles.body}>sharing lets your prayer be lifted up by others</Text>
          <Text style={styles.prompt}>which would you prefer?</Text>
        </View>

        <View style={styles.actions}>
          <SoftButton
            label="i want to keep this private"
            onPress={() => onDecide(false)}
            variant="safe"
          />

          <SoftButton
            label="i want this to be shared with the saints"
            onPress={() => onDecide(true)}
            variant="caution"
          />

          <Text style={styles.hint}>swipe right to go back</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.25,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    minHeight: Platform.OS === 'web' ? height : undefined,
  },

  content: {
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: SPACING.lg,
    textAlign: 'center',
    color: '#e5e7eb',
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#cbd5e1',
    opacity: 0.95,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },

  prompt: {
    fontSize: 13,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.55)',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },

  actions: {
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
    alignItems: 'center',
  },

  hint: {
    marginTop: SPACING.sm,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
});
