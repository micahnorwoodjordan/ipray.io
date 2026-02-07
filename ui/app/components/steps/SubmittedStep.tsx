import { Dimensions, Platform } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

import { SPACING } from '../../themes/spacing';

type Props = {
  onNext: () => void;
};

export default function SubmittedStep({ onNext }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 7000,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onNext, 7100);
    return () => clearTimeout(timer);
  }, [onNext, opacity]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />

      <Animated.View style={[styles.content, { opacity }]}>
        <View>
          <Animated.Text
            style={[
              styles.confirmation,
              {
                opacity: opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.7],
                }),
              },
            ]}
          >
            Your prayer has been received.
          </Animated.Text>

          <View style={{ height: SPACING.lg }} />

          <View style={styles.content}>
            <Text style={styles.scripture}>
              “But know that the LORD has set apart the godly for himself;
            </Text>
            <Text style={styles.scripture}>
              the LORD hears when I call to him.”
            </Text>

            <Text style={styles.reference}>— Psalm 4:3</Text>

            <View style={{ height: SPACING.xl }} />

            <Text style={styles.reminder}>
              you don’t need to carry this anymore
            </Text>
          </View>
        </View>
      </Animated.View>

      <View style={{ flex: 0.4 }} />
    </View>
  );
}


const { height: windowHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  confirmation: {
    fontSize: 14,
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255,255,255,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    minHeight: Platform.OS === 'web' ? windowHeight : undefined,
  },

  content: {
    alignItems: 'center',
  },

  scripture: {
    fontSize: 22,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 32,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },

  reference: {
    marginTop: SPACING.sm,
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },

  reminder: {
    fontSize: 13,
    color: '#f97316',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
    textShadowColor: 'rgba(255, 245, 230, 0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
