import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export function useIdlePulse(active: boolean) {
  const pulse = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!active) {
      // Hard stop + reset
      loopRef.current?.stop();
      pulse.setValue(0);
      return;
    }

    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loopRef.current.start();

    return () => {
      loopRef.current?.stop();
    };
  }, [active, pulse]);

  return pulse;
}
