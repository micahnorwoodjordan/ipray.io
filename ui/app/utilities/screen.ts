// simple utility to get screen dimensions
import { Platform, Dimensions } from "react-native";

export interface ViewportSpec {
  width: number;
  height: number;
  isWeb: boolean;
  isMobileWeb: boolean;
}

const MOBILE_VIEWPORT_WIDTH_BOUNDARY: number = 480;

export function getViewportSpec(): ViewportSpec {
  const { width, height } = Dimensions.get("window");
  const isWeb = Platform.OS === "web";
  const isMobileWeb = isWeb && width < MOBILE_VIEWPORT_WIDTH_BOUNDARY;

  return {
    width: width,
    height: height,
    isWeb: isWeb,
    isMobileWeb: isMobileWeb
  };
}
