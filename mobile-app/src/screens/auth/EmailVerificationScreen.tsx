import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    requestEmailVerification,
    verifyEmail,
} from '../../api/auth.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import { OtpInput } from '../../components/ui/OtpInput';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailVerification'>;

export function EmailVerificationScreen({ navigation }: Props) {
    const user = useAuthStore((state) => state.user);
    const loadUser = useAuthStore((state) => state.loadUser);

    const email = user?.email;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        const sendInitialCode = async () => {
            if (!email) {
                Alert.alert('Error', 'No email found for this user.');
                navigation.replace('Login');
                return;
            }

            try {
                const response = await requestEmailVerification(email);

                Alert.alert(
                    'Verification Code',
                    response?.devCode
                        ? `Your verification code is ${response.devCode}`
                        : 'Verification code sent to your email.',
                );

            } catch {
                Alert.alert('Error', 'Could not send verification code.');
            }
        };

        sendInitialCode();
    }, [email, navigation]);

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((value) => value - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const handleVerify = async (code = otp) => {
        if (!email) {
            Alert.alert('Error', 'No email found for this user.');
            return;
        }

        if (code.length !== 6) {
            Alert.alert('Invalid Code', 'Please enter all 6 digits.');
            return;
        }

        try {
            setLoading(true);

            await verifyEmail(email, code);
            await loadUser();

            Alert.alert('Success', 'Email verified successfully.');

            navigation.replace('Home');
        } catch {
            Alert.alert('Verification Failed', 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!email || countdown > 0) return;

        try {
            setResendLoading(true);

            const response = await requestEmailVerification(email);

            setOtp('');
            setCountdown(30);

            Alert.alert(
                'Code Sent',
                response?.devCode
                    ? `Verification code resent. Your new code is ${response.devCode}`
                    : `Verification code resent to your email.`,
            );
        } catch {
            Alert.alert('Error', 'Could not resend code.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <AppScreen>
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.8}
                >
                    <FontAwesome name="arrow-left" size={22} color={colors.black} />
                </TouchableOpacity>

                <Text style={styles.title}>Verify Email Address</Text>

                <Text style={styles.description}>
                    Enter the 6-digit verification code sent to:
                </Text>

                <Text style={styles.email}>{email}</Text>

                <OtpInput value={otp} onChange={setOtp} onComplete={handleVerify} />

                <TouchableOpacity
                    disabled={countdown > 0 || resendLoading}
                    onPress={handleResendCode}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.resend,
                            (countdown > 0 || resendLoading) && styles.resendDisabled,
                        ]}
                    >
                        {countdown > 0
                            ? `Resend Code in ${countdown}s`
                            : resendLoading
                                ? 'Resending...'
                                : 'Resend Code'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.buttonContainer}>
                    <AppButton
                        title="Verify Email"
                        onPress={() => handleVerify()}
                        loading={loading}
                        disabled={otp.length !== 6 || loading}
                    />
                </View>
            </View>
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    title: {
        ...typography.headingLarge,
        color: colors.black,
        marginTop: spacing.xl,
    },
    description: {
        ...typography.body,
        color: colors.gray,
        marginTop: spacing.md,
    },
    email: {
        ...typography.caption,
        color: colors.primary,
        marginTop: spacing.sm,
    },
    resend: {
        ...typography.caption,
        color: colors.primary,
        textAlign: 'center',
        marginTop: spacing.lg,
    },
    resendDisabled: {
        color: colors.gray,
    },
    buttonContainer: {
        marginTop: 'auto',
        marginBottom: spacing.xl,
    },
});