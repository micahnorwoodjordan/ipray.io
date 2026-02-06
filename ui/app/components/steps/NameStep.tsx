import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated, PanResponder, Text, Platform, Dimensions } from 'react-native';
import { SPACING } from '../../themes/spacing';

type Props = { 
  onNext: (name: string) => void;
  onBack?: () => void;
};

export default function NameStep({ onNext, onBack }: Props) {
  const [name, setName] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  // fade in on mount
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // swipe gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const screenWidth = Dimensions.get('window').width;

        if (gestureState.dx < -100) {
          // swipe left → next
          Animated.timing(translateX, { toValue: -screenWidth, duration: 200, useNativeDriver: true }).start(() => {
            onNext(name);
            translateX.setValue(0); // reset for next mount
          });
        } else if (gestureState.dx > 100 && onBack) {
          // swipe right → back
          Animated.timing(translateX, { toValue: screenWidth, duration: 200, useNativeDriver: true }).start(() => {
            onBack();
            translateX.setValue(0); // reset for next mount
          });
        } else {
          // snap back to center if threshold not reached
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

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
          onChangeText={setName}
          autoCapitalize="words"
          textAlign="center"
          selectionColor="#fff"
        />
        <Text style={styles.note}>it's also fine to stay anonymous 🙂</Text>
        <Text style={styles.hint}>
          Swipe left to continue{onBack ? ' or right to go back' : ''}
        </Text>
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
