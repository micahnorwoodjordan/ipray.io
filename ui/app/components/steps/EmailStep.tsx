import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, Platform, Animated } from 'react-native';
import { SPACING } from '../../themes/spacing';
import { useSwipe } from '../../hooks/swipe';
import WarningModal from '../modals/WarningModal';

type Props = {
    email: string;
    onChangeEmail: (value: string) => void;
    onNext: () => void;
    onBack: () => void;
};

export default function EmailStep({ email, onChangeEmail, onNext, onBack }: Props) {
    const [localEmail, setLocalEmail] = useState(email);
    const [showWarning, setShowWarning] = useState(false);
    const opacity = useRef(new Animated.Value(0)).current;

    // ref to always get the latest email value in handleNext
    const emailRef = useRef(localEmail);
    useEffect(() => {
        emailRef.current = localEmail;
    }, [localEmail]);

    useEffect(() => {
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const isValidEmail = (value: string) => {
        const trimmed = value.trim();
        if (trimmed === '') return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(trimmed.toLowerCase());
    };

    const handleNext = () => {
        const sanitized = emailRef.current.trim().toLowerCase();

        if (!isValidEmail(sanitized)) {
            setShowWarning(true);
            return; 
        }

        onChangeEmail(sanitized);
        onNext();
    };

    const { panResponder, translateX } = useSwipe({
        onLeftSwipe: handleNext,
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
                    onChangeText={setLocalEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                />

                <Text style={styles.hint}>swipe left to continue, right to go back</Text>
            </View>

            <WarningModal
                visible={showWarning}
                message="please enter a valid email address"
                onDismiss={() => setShowWarning(false)}
            />
        </Animated.View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        minHeight: Platform.OS === 'web' ? 600 : undefined,
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
        width: Math.min(width - SPACING.xl * 2, 420),
        alignSelf: 'center',
        paddingVertical: Platform.OS === 'web' ? SPACING.sm : SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    hint: {
        marginTop: SPACING.lg,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        textAlign: 'center',
    },
});
