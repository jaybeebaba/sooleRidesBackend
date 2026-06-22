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
  requestPhoneVerification,
  verifyPhone,
} from '../../api/auth.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import { OtpInput } from '../../components/ui/OtpInput';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'PhoneVerification'>;

export function PhoneVerificationScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const loadUser = useAuthStore((state) => state.loadUser);

  const phone = user?.phone;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
console.log('user phone', user);
  useEffect(() => {
    const sendInitialCode = async () => {
      if (!phone) {
        Alert.alert('Phone Number Missing', 'You can verify your phone number later.');
        navigation.replace('Home');
        return;
      }

      try {
        const response = await requestPhoneVerification(phone);

        Alert.alert(
          'Verification Code',
          response?.devCode
            ? `Your verification code is ${response.devCode}`
            : 'Verification code sent to your phone.',
        );
      } catch {
        Alert.alert('Error', 'Could not send phone verification code.');
      }
    };

    sendInitialCode();
  }, [phone, navigation]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (code = otp) => {
    if (!phone) {
      Alert.alert('Error', 'No phone number found for this user.');
      return;
    }

    if (code.length !== 6) {
      navigation.replace('AuthStatus', {
        type: 'error',
        title: 'Invalid Code',
        message: 'Please enter all 6 digits to continue.',
        buttonText: 'Try Again',
        action: 'goPhoneVerification',
      });
      return;
    }

    try {
      setLoading(true);

      await verifyPhone(phone, code);
      await loadUser();

      navigation.replace('AuthStatus', {
        type: 'success',
        title: 'Phone Number Verified',
        message: 'Your phone number has been verified successfully.',
        buttonText: 'Continue',
        action: 'goHome',
      });
    } catch {
      navigation.replace('AuthStatus', {
        type: 'error',
        title: 'Verification Failed',
        message: 'The code you entered is invalid or has expired.',
        buttonText: 'Try Again',
        action: 'goPhoneVerification',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!phone || countdown > 0) return;

    try {
      setResendLoading(true);

      const response = await requestPhoneVerification(phone);

      setOtp('');
      setCountdown(30);

      Alert.alert(
        'Code Sent',
        response?.devCode
          ? `Verification code resent. Your new code is ${response.devCode}`
          : 'Verification code resent to your phone.',
      );
    } catch {
      Alert.alert('Error', 'Could not resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.replace('Home');
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <FontAwesome name="arrow-left" size={22} color={colors.black} />
        </TouchableOpacity>

        <Text style={styles.title}>Verify Phone Number</Text>

        <Text style={styles.description}>
          Enter the 6-digit verification code sent to:
        </Text>

        <Text style={styles.phone}>{phone}</Text>

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
            title="Verify Phone"
            onPress={() => handleVerify()}
            loading={loading}
          />

          <TouchableOpacity onPress={handleSkip} activeOpacity={0.8}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
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
  phone: {
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
  skipText: {
    ...typography.caption,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});