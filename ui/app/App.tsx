import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform, Dimensions} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const outerSpin = useRef(new Animated.Value(0)).current;
  const innerSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(outerSpin, {
        toValue: 1,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(innerSpin, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const outerRotate = outerSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const innerRotate = innerSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* TOP / CENTER CONTENT */}
      <View style={styles.topSection}>
        <View style={styles.haloWrapper}>
          <Animated.View
            style={[
              styles.outerHalo,
              { transform: [{ rotate: outerRotate }] },
            ]}
          />
          <Animated.View
            style={[
              styles.innerHalo,
              { transform: [{ rotate: innerRotate }] },
            ]}
          />

          <View style={styles.content}>
            <Text style={styles.title}>ipray.io</Text>
            <View style={styles.divider} />
            <Text style={styles.copy}>
              This site is under active development.{'\n\n'}
              Soon, it will offer a simple way to share prayer requests
              and ensure they're faithfully prayed for.
            </Text>
          </View>
        </View>
      </View>

      {/* BOTTOM CONTENT */}
      <View style={styles.bottomSection}>
        <Text style={styles.scripture}>
          “Therefore, confess your sins to one another and pray for one another,
          that you may be healed. The prayer of a righteous person has great power
          as it is working.”{'\n'}
          — James 5:16 (ESV)
        </Text>
        <Text style={styles.footer}>Coming Soon</Text>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const isWeb = Platform.OS === 'web';
const isMobileWeb = isWeb && width < 480;

const HALO_SIZE = isMobileWeb
  ? width * 0.95       // mobile web
  : isWeb
  ? width * 0.3       // desktop web
  : 400;              // native

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

  /* Halo */
  haloWrapper: {
    width: HALO_SIZE,
    height: HALO_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  outerHalo: {
    position: 'absolute',
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: HALO_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(229,231,235,0.25)',
    borderTopColor: '#219d51',
  },

  innerHalo: {
    position: 'absolute',
    width: HALO_SIZE - 24,
    height: HALO_SIZE - 24,
    borderRadius: (HALO_SIZE - 24) / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(229,231,235,0.2)',
    borderBottomColor: '#f97316',
  },

  /* Content */
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

  copy: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: '#d1d5db',
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

