import { Modal, View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { SPACING } from '../../themes/spacing';

type Props = {
    visible: boolean;
    message: string;
    onDismiss: () => void;
};

export default function ErrorModal({ visible, message, onDismiss }: Props) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <View style={styles.content}>
                        <Text style={styles.title}>please wait...</Text>
                        <Text style={styles.message}>{message}</Text>
                        <Pressable onPress={onDismiss} style={styles.button}>
                            <Text style={styles.buttonText}>continue</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const { width, height } = Dimensions.get('window');

const isWeb = Platform.OS === 'web';
const isMobileWeb = isWeb && width < 480;

const MODAL_WIDTH = isMobileWeb
    ? width * 0.90       // mobile web
    : isWeb
        ? width * 0.4       // desktop web
        : '90%';              // native

const MODAL_HEIGHT = isMobileWeb
    ? height * 0.4       // mobile web
    : isWeb
        ? height * 0.3       // desktop web
        : '30%';              // native


const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        width: MODAL_WIDTH,
        height: MODAL_HEIGHT,
        backgroundColor: '#111827',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',

        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.5)',

        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,

        elevation: 6, // Android glow
    },


    title: {
        color: '#e5e7eb',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
    },

    message: {
        flex: 0.2,
        color: '#9ca3af',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
        paddingTop: SPACING.md
    },

    button: {
        paddingVertical: 10,
        paddingHorizontal: 24,
    },

    buttonText: {
        color: '#e5e7eb',
        fontSize: 14,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
