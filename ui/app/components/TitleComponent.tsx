import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';
import { SPACING } from '../themes/spacing';

export default function TitleComponent() {
    const colorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(colorAnim, {
                    toValue: 1,
                    duration: 5000,
                    useNativeDriver: false,
                }),
                Animated.timing(colorAnim, {
                    toValue: 0,
                    duration: 5000,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);

    const animatedColor = colorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#f97316', '#219d51'],
    });

    return (
        <Animated.Text
            style={[
                styles.title,
                {
                    color: animatedColor,
                    ...(Platform.OS === 'web'
                        ? {
                            // subtle web glow
                            textShadow: '0px 0px 4px rgba(255,255,255,0.6)',
                        }
                        : {
                            // subtle native glow
                            textShadowColor: 'rgba(255,255,255,0.6)',
                            textShadowOffset: { width: 0, height: 0 },
                            textShadowRadius: 4,
                        }),
                },
            ]}
        >
            ipray.io
        </Animated.Text>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        marginBottom: 24,
        letterSpacing: 7,
        textAlign: 'center',
        paddingTop: SPACING.lg,
    },
});
