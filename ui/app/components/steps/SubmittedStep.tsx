import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SubmittedStep() {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>Thank you. We are praying over your request.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  message: { color: '#e5e7eb', fontSize: 18, textAlign: 'center' },
});
