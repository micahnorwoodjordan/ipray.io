import { Dimensions, Platform } from 'react-native';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

import { SoftButton } from '../SoftButton';
import { SPACING } from '../../themes/spacing';

type Props = { onNext: (name: string) => void };

export default function NameStep({ onNext }: Props) {
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="anonymous"
          placeholderTextColor="rgba(0,0,0,0.35)"
          value={name}
          onChangeText={setName}
        />
        <View style={{ height: SPACING.xl }} />
        <SoftButton  title="continue" onPress={() => onNext(name)} />
      </View>
      <View style={{ flex: 0.25 }} />
    </View>
  );
}

const { height: windowHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  form: {
    gap: SPACING.md,
  },

  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    minHeight: Platform.OS === 'web' ? windowHeight : undefined,
  },

  label: {
    color: '#e5e7eb',
    fontSize: 20,
    marginBottom: 8
  },

  primaryButton: {
    marginTop: SPACING.lg,
    paddingVertical: 18,
    borderRadius: 999,

    backgroundColor: '#219d51',

    shadowColor: '#219d51',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },

    elevation: 4,
  },

  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  secondaryText: {
  marginTop: SPACING.md,
  fontSize: 15,
  color: '#f97316',
  textAlign: 'center',
},

  input: {
  backgroundColor: '#fff', // solid, grounded
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.lg,
  borderRadius: 16,
  letterSpacing: 3,
  textAlign: "center",
  fontSize: 16,
  color: '#111',           // strong text
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.08)',
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
},


});
