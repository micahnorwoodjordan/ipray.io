import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated, Text, Platform, Dimensions } from 'react-native';
import { SPACING } from '../../themes/spacing';
import { useSwipe } from '../../hooks/swipe';

type Props = {
  onNext: (name: string) => void;
  onBack?: () => void;
};

export default function NameStep({ onNext, onBack }: Props) {
  const [name, setName] = useState('');
  const nameRef = useRef('');
  const opacity = useRef(new Animated.Value(0)).current;

  const { panResponder, translateX } = useSwipe({
    onLeftSwipe: () => onNext(nameRef.current),
    onRightSwipe: onBack,
  });

  // fade in on mount
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.container, { opacity, transform: [{ translateX }] }]}
    >
      <View style={{ flex: 0.3 }} />
      <View style={styles.centerContent}>
        <Text style={styles.prompt}>who are you?</Text>
        <TextInput
          style={styles.input}
          placeholder="name"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={name}
          onChangeText={(text) => {
            setName(text);
            nameRef.current = text;
          }}
          autoCapitalize="words"
          textAlign="center"
          selectionColor="#fff"
        />
        <Text style={styles.note}>it's also fine to stay anonymous 🙂</Text>
        <Text style={styles.hint}>Swipe left to continue</Text>
      </View>
    </Animated.View>
  );
}

const { height: windowHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    minHeight: Platform.OS === 'web' ? windowHeight : undefined,
    backgroundColor: 'transparent',
  },
  centerContent: {
    width: '100%',
    alignItems: 'center',
  },
  prompt: {
    fontSize: 22,
    fontWeight: '500',
    color: '#fff',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
    fontSize: 18,
    color: '#fff',
    minWidth: '80%',
    textAlign: 'center',
  },
  note: {
    marginTop: SPACING.md,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
  },
  hint: {
    marginTop: SPACING.lg,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
});
