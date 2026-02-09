import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { SPACING } from '../../themes/spacing';
import { useSwipe } from '../../hooks/swipe';

type Props = {
    email: string;
    onChangeEmail: (value: string) => void;
    onNext?: () => void;
    onBack?: () => void;
};

export default function EmailStep({ email, onChangeEmail, onNext, onBack }: Props) {
    const [localEmail, setLocalEmail] = useState(email || '');
    const emailRef = useRef(localEmail);

    const opacity = useRef(new Animated.Value(0)).current;

    // fade in on mount
    useEffect(() => {
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const handleSubmit = () => {
        onChangeEmail(emailRef.current);
        onNext?.();
    };

    const { panResponder, translateX } = useSwipe({
        onLeftSwipe: handleSubmit,
        onRightSwipe: onBack,
    });

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[styles.container, { opacity, transform: [{ translateX }] }]}
        >
            <View style={{ flex: 0.25 }} />

            <View style={styles.centerContent}>
                <Text style={styles.title}>email updates (optional)</Text>
                <Text style={styles.description}>
                    if you want, you can leave your email to get notified after i pray over your request
                </Text>

                <TextInput
                    value={localEmail}
                    onChangeText={(text) => {
                        setLocalEmail(text);
                        emailRef.current = text;
                    }}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                />

                <Text style={styles.hint}>swipe to the left to continue</Text>
            </View>
        </Animated.View>
    );
}

const { width, height: windowHeight } = Dimensions.get('window');

const isWeb = Platform.OS === 'web';
const isMobileWeb = isWeb && width < 480;

const INPUT_WIDTH = isMobileWeb ? width * 0.85 : isWeb ? width * 0.5 : 400;
const INPUT_HEIGHT = 50;

const styles = StyleSheet.create({
    container: {
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        minHeight: isWeb ? windowHeight : undefined,
        backgroundColor: 'transparent',
    },
    centerContent: {
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        textAlign: 'center',
        marginBottom: SPACING.md,
        color: '#fff',
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.lg,
        color: 'rgba(255,255,255,0.75)',
    },
    input: {
        width: INPUT_WIDTH,
        height: INPUT_HEIGHT,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        paddingHorizontal: SPACING.md,
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    hint: {
        marginTop: SPACING.lg,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        textAlign: 'center',
    },
});
