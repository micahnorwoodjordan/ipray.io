import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

type Props = { onSubmit: (prayer: string) => void };

export default function PrayerStep({ onSubmit }: Props) {
  const [prayer, setPrayer] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Prayer</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your prayer"
        value={prayer}
        onChangeText={setPrayer}
        multiline
      />
      <Button title="Submit" onPress={() => onSubmit(prayer)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  label: { color: '#e5e7eb', fontSize: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#1f2937',
    color: '#e5e7eb',
    width: 250,
    minHeight: 80,
    padding: 8,
    marginBottom: 16,
    borderRadius: 6,
    textAlignVertical: 'top',
  },
});
