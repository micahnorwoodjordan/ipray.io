import React from 'react';
import { Text, Pressable, StyleSheet, ViewStyle, TextStyle, Platform, Dimensions } from 'react-native';
import { SPACING } from '../themes/spacing';

type Variant = 'primary' | 'secondary' | 'safe' | 'caution';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
};

export default function SoftButton({
  label,
  onPress,
  variant = 'primary',
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, styles[`${variant}Label`]]}>
        {label}
      </Text>
    </Pressable>
  );
}

const { width, height } = Dimensions.get('window');

const isWeb = Platform.OS === 'web';
const isMobileWeb = isWeb && width < 480;

const buttonWidth = isMobileWeb
  ? width * 0.9       // mobile web
  : isWeb
    ? width * 0.5       // desktop web
    : 400;              // native

const buttonHeight = isMobileWeb
  ? height * 0.15       // mobile web
  : isWeb
    ? height * 0.1       // desktop web
    : 200;              // native

type Style = ViewStyle | TextStyle;

const styles = StyleSheet.create<Record<string, Style>>({
  base: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: buttonWidth,
    height: buttonHeight
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  primary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  primaryLabel: {
    color: '#e5e7eb',
    fontWeight: '500',
  },

  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryLabel: {
    color: '#f9fafb',
    fontWeight: '600',
  },

  safe: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  safeLabel: {
    color: '#a7f3d0',
    fontWeight: '600',
  },

  caution: {
    backgroundColor: '#d97706',
  },
  cautionLabel: {
    color: '#a7f3d0',
    fontWeight: '600',
  },
});
