import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useIdlePulse } from './animations/pulse';

import Halo from './components/Halo';
import NameStep from './components/steps/NameStep';
import PrayerStep from './components/steps/PrayerStep';
import EmailStep from './components/steps/EmailStep';
import ConsentStep from './components/steps/ConsentStep';
import SubmittedStep from './components/steps/SubmittedStep';
import IntercessionStep from './components/steps/IntercessionStep';
import TitleComponent from './components/TitleComponent';
import FooterComponent from './components/FooterComponent';

import { submitPrayer } from './services/api/prayers';

import ErrorModal from './components/modals/ErrorModal';
import LoadingModal from './components/modals/LoadingModal';

type Step = | 'landing' | 'name' | 'prayer' | 'email' | 'consent' | 'submitted' | 'intercession';

export default function App() {
  const [step, setStep] = useState<Step>('landing');
  const [userName, setUserName] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [email, setEmail] = useState('');
  const [permissionToShare, setPermissionToShare] = useState(false);

  // state
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  // animations
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

  const transitionToNextStep = (nextStep: Step) => {
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
                <Halo onPress={() => transitionToNextStep('name')}>
                  <Text style={styles.beginText}>start</Text>
                </Halo>
              </Animated.View>
            </View>
          )}

          {step === 'name' && (
            <NameStep
              value={userName}
              onChange={setUserName}
              onNext={() => setStep('prayer')}
              onBack={() => setStep('landing')}
            />
          )}

          {step === 'prayer' && (
            <PrayerStep
              value={prayerText}
              onChange={setPrayerText}
              onNext={() => setStep('email')}
              onBack={() => setStep('name')}
            />
          )}

          {step === 'email' && (
            <EmailStep
              value={email}
              onChange={setEmail}
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
                } finally {
                  setLoading(false);
                }
              }}
            />
          )}

          {step === 'submitted' && (
            <SubmittedStep onNext={() => setStep('intercession')} />
          )}

          {step === 'intercession' && (
            <IntercessionStep
              onComplete={() => {  // reset after a full cycle
                setUserName('');
                setPrayerText('');
                setEmail('');
                setPermissionToShare(false);
                setStep('landing');
              }}
            />
          )}
        </View>
      </View>

      <View style={styles.bottomSection}>
        {step === 'landing' && (
          <Animated.Text style={[styles.scripture, scriptureAnimatedStyle]}>
            “Therefore, confess your sins to one another and pray for one another,
            that you may be healed. The prayer of a righteous person has great power
            as it is working.”{'\n'}
            — James 5:16 (ESV)
          </Animated.Text>
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
