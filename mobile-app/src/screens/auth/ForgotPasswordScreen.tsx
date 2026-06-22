import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { forgotPassword } from '../../api/auth.api';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { KeyboardAwareScreen } from '../../components/layout/KeyboardAwareScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    navigation.replace('AuthStatus', {
      type: 'error',
      title: 'Missing Email',
      message: 'Please enter your email address to reset your password.',
      buttonText: 'Try Again',
      action: 'goForgotPassword',
    });
    return;
  }

  try {
    setIsLoading(true);

    const response = await forgotPassword(normalizedEmail);

    if (response?.otp) {
      Alert.alert('Reset OTP', `Use this test OTP: ${response.otp}`);
    } else {
      Alert.alert('OTP Sent', 'Please check your email for the reset OTP.');
    }

    navigation.navigate('VerifyResetOtp', {
      email: normalizedEmail,
    });
  } catch (error: any) {
    navigation.replace('AuthStatus', {
      type: 'error',
      title: 'Request Failed',
      message:
        error?.response?.data?.message ||
        'Could not start password reset. Please check the email and try again.',
      buttonText: 'Try Again',
      action: 'goForgotPassword',
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <KeyboardAwareScreen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Image
          source={require('../../assets/images/soolerides-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Forgot Password?</Text>

        <Text style={styles.subtitle}>
          Enter your email address and we will send you a reset OTP.
        </Text>

        <View style={styles.form}>
          <AppInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <AppButton
            title="Send OTP"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.button}
          />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  logo: {
    ...typography.logo,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingLarge,
    color: colors.black,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  form: {
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.sm,
  },
  backText: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});