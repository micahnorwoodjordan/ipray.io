import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SPACING } from '../../themes/spacing';
import SoftButton from '../SoftButton';

type Props = {
    onDecide: (permissionToShare: boolean) => void;
};

export default function ConsentStep({ onDecide }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Some prayers are private, but others can edify the Church when shared</Text>
                <Text style={styles.body}>choose whether to make this prayer visible to the other saints to submit your prayer request</Text>
            </View>

            <View style={styles.actions}>
                <SoftButton
                    label="Keep this private"
                    onPress={() => onDecide(false)}
                    variant="safe"
                />

                <SoftButton
                    label="I’m okay sharing this"
                    onPress={() => onDecide(true)}
                    variant="caution"
                />

            </View>
        </View>
    );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: SPACING.xl,
        paddingTop: height * 0.18,
        justifyContent: 'space-between',
    },

    content: {
        alignItems: 'center',
    },

    title: {
        fontSize: 22,
        fontWeight: '500',
        marginBottom: SPACING.lg,
        textAlign: 'center',
        color: '#e5e7eb', // soft near-white
    },

    body: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        color: '#cbd5e1', // muted slate
        opacity: 0.95,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md
    },

    actions: {
        paddingBottom: SPACING.xl,
        gap: SPACING.md,
    },
});
