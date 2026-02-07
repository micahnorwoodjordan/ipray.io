import { useRef } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';

// reusable hook to allow swiping left/right
// NOTE: i have not needled through this code to fully understand how these react native classes / methods interact with the DOM
// but this abstraction works

type SwipeCallbacks = {
  onLeftSwipe: () => void;
  onRightSwipe?: () => void;
  swipeThreshold?: number; // optional, default = 100
};

export function useSwipe({ onLeftSwipe, onRightSwipe, swipeThreshold = 100 }: SwipeCallbacks) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const screenWidth = Dimensions.get('window').width;

        if (gestureState.dx < -swipeThreshold) {
          // left swipe
          Animated.timing(translateX, { toValue: -screenWidth, duration: 200, useNativeDriver: true }).start(() => {
            onLeftSwipe();
            translateX.setValue(0); // reset for next mount
          });
        } else if (gestureState.dx > swipeThreshold && onRightSwipe) {
          // right swipe
          Animated.timing(translateX, { toValue: screenWidth, duration: 200, useNativeDriver: true }).start(() => {
            onRightSwipe();
            translateX.setValue(0); // reset for next mount
          });
        } else {
          // snap back to center
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return { panResponder, translateX };
}
