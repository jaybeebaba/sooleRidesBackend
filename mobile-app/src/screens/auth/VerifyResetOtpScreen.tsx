import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { verifyResetOtp, forgotPassword } from '../../api/auth.api';
import { AppButton } from '../../components/ui/AppButton';
import { OtpInput } from '../../components/ui/OtpInput';
import { AppScreen } from '../../components/layout/AppScreen';
import { FontAwesome } from '@expo/vector-icons';
import {
    RootStackParamList,
} from '../../navigations/RootNavigator';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<
    RootStackParamList,
    'VerifyResetOtp'
>;

export function VerifyResetOtpScreen({
    navigation,
    route,
}: Props) {
    const { email } = route.params;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(30);

    const handleVerify = async (code = otp) => {
        if (code.length !== 6) {
            Alert.alert('Invalid Code', 'Please enter all 6 digits.');
            return;
        }

        try {
            setLoading(true);
            await verifyResetOtp(email, code);

            navigation.navigate('ResetPassword', {
                email,
                otp: code,
            });
        } catch {
            Alert.alert('Verification Failed', 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (countdown > 0) return;

        try {
            setResendLoading(true);

            const response = await forgotPassword(email);

            setCountdown(30);

            Alert.alert(
                'Code resent',
                response?.otp
                    ? `Your reset code is ${response.otp}`
                    : 'A new verification code has been sent.',
            );
        } catch {
            Alert.alert('Error', 'Could not resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((value) => value - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    return (
        <AppScreen>
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                >
                    <FontAwesome name="arrow-left" size={22} color={colors.black} />
                </TouchableOpacity>

                <Image
                    source={require('../../assets/images/soolerides-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>
                    Enter OTP
                </Text>

                <Text style={styles.description}>
                    Enter the 6-digit verification
                    code sent to:  <Text style={styles.email}>
                        {email}
                    </Text>
                </Text>



                <OtpInput
                    value={otp}
                    onChange={setOtp}
                    onComplete={(code) => {
                        handleVerify(code);
                    }}
                />

                <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={countdown > 0 || resendLoading}
                >
                    <Text style={styles.resend}>
                        {countdown > 0
                            ? `Resend Code in ${countdown}s`
                            : resendLoading
                                ? 'Resending...'
                                : 'Resend Code'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.buttonContainer}>
                    <AppButton
                        title="Verify Email Address"
                        onPress={handleVerify}
                        loading={loading}
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
    back: {
        fontSize: 30,
        color: colors.black,
    },
    logo: {
        ...typography.logo,
        alignSelf: 'center',
        marginTop: spacing.lg,
    },
    title: {
        ...typography.headingLarge,
        color: colors.black,
        marginTop: spacing.xl,
        textAlign: 'center',
    },
    description: {
        ...typography.body,
        color: colors.gray,
        marginTop: spacing.md,
        textAlign: 'center',
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
    buttonContainer: {
        marginTop: 'auto',
        marginBottom: spacing.xl,
    },
});