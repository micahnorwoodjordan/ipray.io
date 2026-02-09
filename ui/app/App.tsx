import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useIdlePulse } from './animations/pulse';

import Halo from './components/Halo';
import NameStep from './components/steps/NameStep';
import PrayerStep from './components/steps/PrayerStep';
import EmailStep from './components/steps/EmailStep';
import ConsentStep from './components/steps/ConsentStep';
import IntercessionStep from './components/steps/IntercessionStep';
import TitleComponent from './components/TitleComponent';
import FooterComponent from './components/FooterComponent';

import { submitPrayer } from './services/api/prayers';

import ErrorModal from './components/modals/ErrorModal';
import LoadingModal from './components/modals/LoadingModal';

export default function App() {
  const [step, setStep] = useState<'landing' | 'name' | 'prayer' | 'email' | 'consent' | 'submitted' | 'intercession'>('landing');

  const [userName, setUserName] = useState<string>('');
  const [prayerText, setPrayerText] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [permissionToShare, setPermissionToShare] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const haloAnim = useRef(new Animated.Value(1)).current;
  const haloPulse = useIdlePulse(step === 'landing');

  const haloAnimatedStyle = {
    opacity: haloAnim,
    transform: [
      {
        scale: haloAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1.4, 1],
        }),
      },
      {
        scale: haloPulse.interpolate({
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
          outputRange: [-12, 0],
        }),
      },
    ],
  };

  const transitionToNameStepAnimation = Animated.timing(haloAnim, {
    toValue: 0,
    duration: 750,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  });

  const runBeginTransition = (nextStep: typeof step) => {
    transitionToNameStepAnimation.start(() => {
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
      <TitleComponent />

      <View style={styles.topSection}>
        <View style={styles.content}>
          {step === 'landing' && (
            <View style={styles.haloContainer}>
              <Animated.View style={haloAnimatedStyle}>
                <Halo onPress={() => runBeginTransition('name')}>
                  <Text style={styles.beginText}>start</Text>
                </Halo>
              </Animated.View>
            </View>
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
              onNext={(prayer) => {
                setPrayerText(prayer);
                setStep('email');
              }}
              onBack={() => setStep('name')}
            />
          )}

          {step === 'email' && (
            <EmailStep
              email={email}
              onChangeEmail={setEmail}
              onNext={() => setStep('consent')}
              onBack={() => setStep('prayer')}
            />
          )}

          {step === 'consent' && (
            <ConsentStep
              onDecide={async (permission) => {
                setPermissionToShare(permission);
                setLoading(true);

                try {
                  await submitPrayer({
                    user_name: userName,
                    text: prayerText,
                    user_email: email,
                    is_public: permission,
                  });

                  setStep('submitted');
                } catch (err) {
                  setShowError(true);
                  setStep('prayer');
                } finally {
                  setLoading(false);
                }
              }}
            />
          )}

          {step === 'intercession' && (
            <IntercessionStep onComplete={() => setStep('landing')} />
          )}
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

      <FooterComponent />

      <ErrorModal
        visible={showError}
        onDismiss={() => setShowError(false)}
        message="there was an issue sending your prayer request...please try again in a bit"
      />

      <LoadingModal visible={loading} message="saving your prayer..." />
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
    letterSpacing: 8,
  },

  root: {
    flex: 1,
    backgroundColor: '#111827',
  },

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
    width: '85%',
  },

  scripture: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#9ca3af',
    marginBottom: 12,
  },
});
