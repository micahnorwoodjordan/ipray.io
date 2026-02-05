import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

type Props = { onNext: (name: string) => void };

export default function NameStep({ onNext }: Props) {
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Anonymous"
        value={name}
        onChangeText={setName}
      />
      <Button 
        // style={styles.button}
        title="Continue"
        onPress={() => onNext(name)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },

  label: {
    color: '#e5e7eb',
    fontSize: 20,
    marginBottom: 8
  },

  button: {
    color: '219d51',
  },

  input: {
    backgroundColor: '#1f2937',
    color: '#e5e7eb',
    width: 250,
    padding: 8,
    marginBottom: 16,
    borderRadius: 6,
  },
});
