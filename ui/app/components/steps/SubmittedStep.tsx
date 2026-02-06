import { Dimensions, Platform } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

import { SPACING } from '../../themes/spacing';

export default function SubmittedStep() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 7000,
        useNativeDriver: true,
      }).start();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />

      <View style={styles.content}>
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

      <View style={{ flex: 0.4 }} />
    </View>
  );
}

const { height: windowHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
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
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 32,
  },

  reference: {
    marginTop: SPACING.sm,
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },

  reminder: {
    fontSize: 15,
    color: '#f97316',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});
