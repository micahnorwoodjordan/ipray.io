import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { SPACING } from '../themes/spacing';

export default function TitleComponent() {
  return <Text style={styles.title}>ipray.io</Text>;
}

const styles = StyleSheet.create({
  title: {
    color: '#e5e7eb',
    fontSize: 28,
    marginBottom: 24, // space between title and halo
    letterSpacing: 7,
    textAlign: 'center',
    paddingTop: SPACING.lg
  },
});
