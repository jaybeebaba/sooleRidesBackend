import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { resetPassword } from '../../api/auth.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { KeyboardAwareScreen } from '../../components/layout/KeyboardAwareScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const { email, otp } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing details', 'Please enter and confirm your new password.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'Both passwords must match.');
      return;
    }

    try {
      setLoading(true);

      await resetPassword(email, otp, newPassword);

      navigation.replace('AuthStatus', {
        type: 'success',
        title: 'Password Reset Successful',
        message: 'Your password has been reset successfully. You can now log in with your new password.',
        buttonText: 'Go to Login',
        action: 'goLogin',
      });
    } catch {
      navigation.replace('AuthStatus', {
        type: 'error',
        title: 'Reset Failed',
        message: 'Could not reset your password. Please try again.',
        buttonText: 'Try Again',
        action: 'goForgotPassword',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScreen>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={22} color={colors.black} />
        </TouchableOpacity>

        <Image
          source={require('../../assets/images/soolerides-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Create New Password</Text>

        <Text style={styles.description}>
          Enter a new password for your SooleRides account.
        </Text>

        <View style={styles.form}>
          <View style={styles.passwordWrapper}>
            <AppInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNewPassword((value) => !value)}
            >
              <FontAwesome
                name={showNewPassword ? 'eye-slash' : 'eye'}
                size={18}
                color={colors.gray}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordWrapper}>
            <AppInput
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword((value) => !value)}
            >
              <FontAwesome
                name={showConfirmPassword ? 'eye-slash' : 'eye'}
                size={18}
                color={colors.gray}
              />
            </TouchableOpacity>
          </View>

          <AppButton
            title="Reset Password"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.button}
          />
        </View>
      </View>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logo: {
    ...typography.logo,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headingLarge,
    color: colors.black,
  },
  description: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.sm,
  },
  form: {
    marginTop: spacing.xl,
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: 38,
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: spacing.lg,
  },
});