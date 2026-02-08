import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';

export default function Footer() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>2026 ipray.io — All prayers are private.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    color: '#6b7280', // soft gray
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontStyle: 'normal',
    opacity: 0.8,
    ...Platform.select({
      web: { userSelect: 'none' },
    }),
  },
});
