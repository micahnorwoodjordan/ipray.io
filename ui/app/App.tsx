import { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Halo from './components/Halo';
import NameStep from './components/steps/NameStep';
import PrayerStep from './components/steps/PrayerStep';
import SubmittedStep from './components/steps/SubmittedStep';


export default function App() {
  const [step, setStep] = useState<'landing' | 'name' | 'prayer' | 'submitted'>('landing');
  const [userName, setUserName] = useState<string>('');
  const haloAnim = useRef(new Animated.Value(1)).current;

  const haloAnimatedStyle = {
  opacity: haloAnim,
  transform: [
    {
      scale: haloAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1.4, 1],
      }),
    },
  ],
};

  const animateHaloOut = (nextStep: typeof step) => {
    Animated.timing(haloAnim, {
      toValue: 0,
      duration: 750,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
    });
};

  useEffect(() => {
    if (step === 'submitted') {
      const timer = setTimeout(() => setStep('landing'), 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'landing') {
      haloAnim.setValue(0);
      Animated.timing(haloAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [step]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      
      <View style={styles.topSection}>
        <View style={styles.content}>
          {step === 'landing' && (
            <Animated.View style={[styles.haloContainer, haloAnimatedStyle]}>
              <Halo onPress={() => animateHaloOut('name')}>
                <Text style={styles.beginText}>Begin</Text>
              </Halo>
            </Animated.View>
          )}

          {step === 'name' && (
          <NameStep
            onNext={(name) => {
              setUserName(name);
              setStep('prayer');
            }}
          />
        )}
        {step === 'prayer' && <PrayerStep onSubmit={() => setStep('submitted')} />}
        {step === 'submitted' && <SubmittedStep />}
        </View>
      </View>

      <View style={styles.bottomSection}>
        {step === 'landing' && (
          <Text style={styles.scripture}>
          “Therefore, confess your sins to one another and pray for one another,
          that you may be healed. The prayer of a righteous person has great power
          as it is working.”{'\n'}
          — James 5:16 (ESV)
        </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  haloContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  beginText: {
    color: '#e5e7eb',
    fontSize: 35,
    letterSpacing: 8
  },

  root: {
    flex: 1,
    backgroundColor: '#111827',
  },

  /* Vertical quarters logic */
  topSection: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomSection: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 24,
  },

  content: {
    paddingHorizontal: 16,
    alignItems: 'center',
    width: "85%"
  },

  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 12,
  },

  divider: {
    width: 72,
    height: 1,
    backgroundColor: '#d1d5db',
    opacity: 0.6,
    marginBottom: 16,
  },

  scripture: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#9ca3af',
    marginBottom: 12,
  },

  footer: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#6b7280',
  },
});

