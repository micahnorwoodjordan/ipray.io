import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Halo from './components/Halo';
// import LandingStep from './components/steps/LandingStep';
// import NameStep from './components/steps/NameStep';
// import PrayerStep from './components/steps/PrayerStep';
// import SubmittedStep from './components/steps/SubmittedStep';


export default function App() {
  const [step, setStep] = useState<'landing' | 'name' | 'prayer' | 'submitted'>('landing');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (step === 'submitted') {
      const timer = setTimeout(() => setStep('landing'), 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);


  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      
      <View style={styles.topSection}>
        <View style={styles.content}>
        <Halo onPress={() => setStep('name')}>
          {step === 'landing' && (
            <Text style={{ color: '#e5e7eb', fontSize: 20, fontWeight: 'bold' }}>
              Begin
            </Text>
          )}
        </Halo>
        {/* {step === 'landing' && <LandingStep onNext={() => setStep('name')} />}
        {step === 'name' && (
          <NameStep
            onNext={(name) => {
              setUserName(name);
              setStep('prayer');
            }}
          />
        )}
        {step === 'prayer' && <PrayerStep onSubmit={(prayer) => setStep('submitted')} />}
        {step === 'submitted' && <SubmittedStep />} */}
      </View>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.scripture}>
          “Therefore, confess your sins to one another and pray for one another,
          that you may be healed. The prayer of a righteous person has great power
          as it is working.”{'\n'}
          — James 5:16 (ESV)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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

