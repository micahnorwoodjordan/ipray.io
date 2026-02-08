import { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useIdlePulse } from './animations/pulse';

import Halo from './components/Halo';
import NameStep from './components/steps/NameStep';
import PrayerStep from './components/steps/PrayerStep';
import SubmittedStep from './components/steps/SubmittedStep';
import IntercessionStep from './components/steps/IntercessionStep';
import { submitPrayer } from './services/api/prayers';
import ErrorModal from './components/modals/ErrorModal';

export default function App() {
  const [step, setStep] = useState<'landing' | 'name' | 'prayer' | 'submitted' | 'intercession'>('landing');
  const [userName, setUserName] = useState<string>('');
  const [prayerText, setPrayerText] = useState<string>('');

  const haloAnim = useRef(new Animated.Value(1)).current;
  const haloPulse = useIdlePulse(step === 'landing');

  const [showError, setShowError] = useState(false);


  const haloAnimatedStyle = {
    opacity: haloAnim,
    transform: [
      {
        scale: haloAnim.interpolate({  // ripple transition
          inputRange: [0, 1],
          outputRange: [1.4, 1],
        }),
      },
      {
        scale: haloPulse.interpolate({  // pulse effect
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ],
  };


  const scriptureAnimatedStyle = {
    opacity: haloAnim,
    transform: [
      {
        translateY: haloAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-12, 0], // subtle upward release
        }),
      },
    ],
  };

  const transitionToNameStepanimation = Animated.timing(haloAnim, {
    toValue: 0,
    duration: 750,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  });

  const runBeginTransition = (nextStep: typeof step) => {
    transitionToNameStepanimation.start(() => {
      setStep(nextStep);
    });
  };

  useEffect(() => {
    if (step === 'landing') {
      haloAnim.setValue(0);
      Animated.timing(haloAnim, {
        toValue: 1,
        duration: 1000,
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
              <Halo onPress={() => runBeginTransition('name')}>
                <Text style={styles.beginText}>let's pray 🙏🏽</Text>
              </Halo>
            </Animated.View>
          )}

          {step === 'name' && (
            <NameStep
              onNext={(name) => {
                setUserName(name);
                setStep('prayer');
              }}
              onBack={() => setStep('landing')}
            />
          )}
          {step === 'prayer' && (
            <PrayerStep
              onNext={async (prayer) => {
                try {
                  const res = await submitPrayer({
                    user_name: userName,
                    text: prayer,
                  });
                  setPrayerText(prayer);
                  setStep('submitted');
                } catch (err) {
                  setShowError(true);
                }
              }}
              onBack={() => setStep('name')}
            />
          )}



          {step === 'submitted' && (
            <SubmittedStep onNext={() => setStep('intercession')} />
          )}

          {step === 'intercession' && <IntercessionStep onComplete={() => setStep('landing')} />}
        </View>
      </View>

      <View style={styles.bottomSection}>
        {step === 'landing' && (
          <Animated.View>
            <Animated.Text style={[styles.scripture, scriptureAnimatedStyle]}>
              “Therefore, confess your sins to one another and pray for one another,
              that you may be healed. The prayer of a righteous person has great power
              as it is working.”{'\n'}
              — James 5:16 (ESV)
            </Animated.Text>
          </Animated.View>
        )}
      </View>
      <ErrorModal
        visible={showError}
        onDismiss={() => setShowError(false)}
        message='there was an issue sending your prayer request...please try again in a bit'
      />
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
    flex: 0.5,
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

