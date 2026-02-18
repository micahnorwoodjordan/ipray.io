import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export function useBreath(
  active: boolean,
  duration: number = 4000,
  maxScale: number = 1.012
) {
  const breath = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!active) {
      loopRef.current?.stop();
      breath.setValue(0);
      return;
    }

    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loopRef.current.start();

    return () => {
      loopRef.current?.stop();
    };
  }, [active, duration, maxScale]);

  const scale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, maxScale],
  });

  return scale;
}
