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
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={{ flex: 1 }} />

      <View style={styles.content}>
        <Text style={styles.primary}>“But know that the LORD has set apart the godly for himself;</Text>
        <Text style={styles.primary}>the LORD hears when I call to him.”</Text>
        <Text style={styles.reference}>— Psalm 4:3</Text>
        <View style={{ height: SPACING.xl }} />
        <Text style={styles.secondary}>you don’t need to carry this anymore</Text>
      </View>

      <View style={{ flex: 0.3 }} />
    </Animated.View>
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

  primary: {
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 30,
  },

  reference: {
    marginTop: SPACING.sm,
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  secondary: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    maxWidth: 350,
    lineHeight: 22,
  },
});
