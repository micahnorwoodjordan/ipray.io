import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { SPACING } from '../../themes/spacing';

type Props = { onComplete: (name: string) => void };

export default function IntercessionStep({ onComplete }: { onComplete: () => void }) {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
            }),
        ]).start(onComplete);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.Text style={[styles.text, { opacity }]}>i am praying for you</Animated.Text>
        </View>
    );
}
const { width, height } = Dimensions.get('window');

const isWeb = Platform.OS === 'web';
const isMobileWeb = isWeb && width < 480;

// native: 18
// mobile web: 14
// desktop web: 20
const fontSize = !isWeb ? 18 : isMobileWeb ? 14 : 20;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: SPACING.xl,
    },


    text: {
        fontSize: fontSize,
        letterSpacing: 7,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        textTransform: 'uppercase',
        textShadowColor: 'rgba(255,255,255,0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },
});
