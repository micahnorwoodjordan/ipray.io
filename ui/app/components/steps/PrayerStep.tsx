import { Dimensions, Platform } from 'react-native';
import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

import { SoftButton } from '../SoftButton';
import { SPACING } from '../../themes/spacing';

type Props = { onSubmit: (prayer: string) => void };

export default function PrayerStep({ onSubmit }: Props) {
  const [prayer, setPrayer] = useState('');

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="enter your prayer"
          placeholderTextColor="rgba(0,0,0,0.35)"
          value={prayer}
          onChangeText={setPrayer}
          multiline
          textAlignVertical="top"
        />

        <View style={{ height: SPACING.xl }} />
        <SoftButton title="submit" onPress={() => onSubmit(prayer)} />
      </View>

      <View style={{ flex: 0.25 }} />
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

  form: {
    gap: SPACING.md,
  },

  input: {
    backgroundColor: '#fff',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,

    fontSize: 16,
    color: '#111',
    textAlign: "center",
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },

    minHeight: 160,
    lineHeight: 22,
  },
});
