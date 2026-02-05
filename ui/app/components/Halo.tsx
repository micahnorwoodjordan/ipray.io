import { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Easing, Platform, Dimensions } from "react-native";

type HaloProps = {
  label?: string;
};

export default function Halo({ label }: HaloProps) {

  const outerSpin = useRef(new Animated.Value(0)).current;
  const innerSpin = useRef(new Animated.Value(0)).current;

  const runRotation = (animatedValue: Animated.Value, duration: number) => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => runRotation(animatedValue, duration)); // recursive loop
  }

  useEffect(() => {
    runRotation(outerSpin, 30000); // 60s per rotation
    runRotation(innerSpin, 15000); // 15s per rotation
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
      {label ? (
      <Text style={styles.haloLabel}>
        {label}
      </Text>
    ) : null}
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
    haloLabel: {
    position: 'absolute',
    color: '#e5e7eb',
    fontSize: 30,
    fontWeight: '500',
    letterSpacing: 5.5,
    textAlign: 'center',
  },
});
