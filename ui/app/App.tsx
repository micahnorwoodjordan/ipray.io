import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useIdlePulse } from './animations/pulse';
import { useBreath } from './animations/breathe';

import Halo from './components/Halo';
import NameStep from './components/steps/NameStep';
import PrayerStep from './components/steps/PrayerStep';
import EmailStep from './components/steps/EmailStep';
import ConsentStep from './components/steps/ConsentStep';
import SubmittedStep from './components/steps/SubmittedStep';
import IntercessionStep from './components/steps/IntercessionStep';
import TitleComponent from './components/TitleComponent';
import FooterComponent from './components/FooterComponent';

import AgreementModal from './components/modals/AgreementModal';
import ErrorModal from './components/modals/ErrorModal';
import LoadingModal from './components/modals/LoadingModal';

import { submitPrayer, fetchPrayer } from './services/api/prayers';
import { PrayerResponse } from './services/api/types';
import { ViewportSpec, getViewportSpec } from './utilities/screen';

import { sanitizePrayerPayload } from './utilities/normalize';

type Step = 'landing' | 'name' | 'prayer' | 'email' | 'consent' | 'submitted' | 'intercession';

export default function App() {
  const [step, setStep] = useState<Step>('landing');
  const [userName, setUserName] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [email, setEmail] = useState('');
  const [permissionToShare, setPermissionToShare] = useState(false);
  const [denomination] = useState('');

  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  const [randomPrayer, setRandomPrayer] = useState<PrayerResponse | null>(null);
  const [prayerLoaded, setPrayerLoaded] = useState(false);

  const haloAnim = useRef(new Animated.Value(1)).current;
  const haloPulse = useIdlePulse(step === 'landing');
  const agreementFade = useRef(new Animated.Value(0)).current;
  const agreementBreath = useBreath(step === 'landing', 1500, 1.1);

  const haloAnimatedStyle = useMemo(
    () => ({
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
    }),
    [haloAnim, haloPulse]
  );

  const scriptureAnimatedStyle = useMemo(
    () => ({
      opacity: haloAnim,
      transform: [
        {
          translateY: haloAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-12, 0],
          }),
        },
      ],
    }),
    [haloAnim]
  );

  const agreementAnimatedStyle = useMemo(
    () => ({
      opacity: agreementFade,
      transform: [
        {
          translateY: agreementFade.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 0],
          }),
        },
        { scale: agreementBreath },
      ],
    }),
    [agreementFade, agreementBreath]
  );

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
    const loadPrayer = async () => {
      try {
        const prayer = await fetchPrayer();
        setRandomPrayer(prayer);
      } catch (err) {
        console.warn('Failed to fetch a prayer', err);
      } finally {
        setPrayerLoaded(true);
      }
    };
    loadPrayer();
  }, []);

  useEffect(() => {
    if (step === 'landing') {
      haloAnim.setValue(0);
      agreementFade.setValue(0);

      Animated.timing(haloAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(agreementFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
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
                  <Text style={styles.beginText}>request prayer 🙏🏽</Text>
                </Halo>
              </Animated.View>

              <Pressable onPress={() => setShowAgreement(true)}>
                <Animated.View style={[styles.agreementRow, agreementAnimatedStyle]}>
                  <Text style={styles.agreementText}>stand in agreement with another 🛡️</Text>
                </Animated.View>
              </Pressable>
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
                  const normalized = sanitizePrayerPayload({
                    user_name: userName,
                    text: prayerText,
                    user_email: email,
                    is_public: permission,
                    denomination,
                  });
                  await submitPrayer(normalized);
                  setStep('submitted');
                } catch {
                  setShowError(true);
                } finally {
                  setLoading(false);
                }
              }}
              onBack={() => setStep('email')}
            />
          )}

          {step === 'submitted' && (
            <SubmittedStep onNext={() => setStep('intercession')} />
          )}

          {step === 'intercession' && (
            <IntercessionStep
              onComplete={() => {
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

      {prayerLoaded && (
        <AgreementModal
          visible={showAgreement}
          onClose={() => setShowAgreement(false)}
          prayerText={randomPrayer?.text ?? "i need some help!"}
        />
      )}

      <ErrorModal
        visible={showError}
        onDismiss={() => setShowError(false)}
        message="there was an issue sending your prayer request...please try again in a bit"
      />

      <LoadingModal visible={loading} message="saving your prayer..." />
    </View>
  );
}

const viewport: ViewportSpec = getViewportSpec();

const FONT_SIZE = viewport.isMobileWeb
  ? 23         // mobile web
  : viewport.isWeb
    ? 30       // desktop web
    : 25;      // native

const styles = StyleSheet.create({
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
  haloContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  beginText: {
    color: '#e5e7eb',
    fontSize: FONT_SIZE,
    letterSpacing: 8,
  },
  agreementRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.65,
  },
  agreementText: {
    fontSize: 13,
    color: '#9ca3af',
    marginLeft: 6,
    letterSpacing: 1,
  },
  scripture: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#9ca3af',
    marginTop: 24,
  },
});
