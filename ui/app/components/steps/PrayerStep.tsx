import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated, Text, Platform, Dimensions } from 'react-native';
import { SPACING } from '../../themes/spacing';
import { useSwipe } from '../../hooks/swipe';
import WarningModal from '../modals/WarningModal';

type Props = {
  onNext: (prayer: string) => void;
  onBack?: () => void;
};

export default function PrayerStep({ onNext, onBack }: Props) {
  const [prayer, setPrayer] = useState('');
  const prayerRef = useRef('');
  const opacity = useRef(new Animated.Value(0)).current;

  const [showWarning, setShowWarning] = useState(false);

  // fade in on mount
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleSubmit = () => {
    if (!prayerRef.current.trim()) {
      setShowWarning(true);
      return;
    }
    onNext(prayerRef.current);
  };

  const { panResponder, translateX } = useSwipe({
    onLeftSwipe: handleSubmit,
    onRightSwipe: onBack,
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.container, { opacity, transform: [{ translateX }] }]}
    >
      <View style={{ flex: 0.25 }} />
      <View style={styles.centerContent}>
        <Text style={styles.prompt}>what's on your heart?</Text>
        <TextInput
          style={styles.input}
          placeholder="our God hears ✝️"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={prayer}
          onChangeText={(text) => {
            setPrayer(text);
            prayerRef.current = text;
          }}
          multiline
          textAlignVertical="top"
          selectionColor="#fff"
        />
        <Text style={styles.hint}>Swipe to the left to continue</Text>
      </View>

      <WarningModal
        visible={showWarning}
        message="don't forget to enter your prayer request!"
        onDismiss={() => setShowWarning(false)}
      />
    </Animated.View>
  );
}

const { height: windowHeight, width } = Dimensions.get('window');

const isWeb = Platform.OS === 'web';
const isMobileWeb = isWeb && width < 480;

const TEXTINPUT_WIDTH = isMobileWeb ? width * 0.85 : isWeb ? width * 0.5 : 400;
const TEXTINPUT_HEIGHT = isMobileWeb ? width * 0.5 : isWeb ? width * 0.2 : 200;

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
    width: TEXTINPUT_WIDTH,
    textAlign: 'center',
    height: TEXTINPUT_HEIGHT,
  },
  note: {
    marginTop: SPACING.md,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  hint: {
    marginTop: SPACING.lg,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
});
