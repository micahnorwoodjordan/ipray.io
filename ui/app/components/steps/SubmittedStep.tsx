import { Dimensions, Platform } from 'react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { SPACING } from '../../themes/spacing';

export default function SubmittedStep() {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />

      <View style={styles.content}>
        <Text style={styles.primary}>"But know that the LORD has set apart the godly for himself;</Text>
        <Text style={styles.primary}>the LORD hears when I call to him."</Text>
        <Text style={styles.primary}>— Psalm 4:3</Text>

        <View style={{ height: SPACING.lg }} />

        <Text style={styles.secondary}>
          you don’t need to carry this anymore  ✝️ 
        </Text>
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

  primary: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)', // near-white, soft
    textAlign: 'center',
  },

  secondary: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)', // quieter, receding
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});
