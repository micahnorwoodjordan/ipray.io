import { useRef } from "react";
import { Animated, Dimensions, PanResponder } from "react-native";

type SwipeCallbacks = {
  onLeftSwipe?: () => void;
  onRightSwipe?: () => void;
  swipeThreshold?: number;
};

export function useSwipe({
  onLeftSwipe,
  onRightSwipe,
  swipeThreshold = 50,
}: SwipeCallbacks) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isHorizontal = Math.abs(gestureState.dx) > 20;
        if (!isHorizontal) return false;

        if (gestureState.dx < 0 && !onLeftSwipe) return false;  // block left swipes if not allowed

        if (gestureState.dx > 0 && !onRightSwipe) return false;  // block right swipes if not allowed

        return true;
      },

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0 && !onLeftSwipe) return;
        if (gestureState.dx > 0 && !onRightSwipe) return;

        translateX.setValue(gestureState.dx);
      },

      onPanResponderRelease: (_, gestureState) => {
        const screenWidth = Dimensions.get("window").width;

        if (gestureState.dx < -swipeThreshold && onLeftSwipe) {
          Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onLeftSwipe();
            translateX.setValue(0);
          });
        } else if (gestureState.dx > swipeThreshold && onRightSwipe) {
          Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onRightSwipe();
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return { panResponder, translateX };
}
