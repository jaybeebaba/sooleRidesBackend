import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthStatus'>;

export function AuthStatusScreen({ navigation, route }: Props) {
  const { type, title, message, buttonText, action } = route.params;

  const isSuccess = type === 'success';

  const handleContinue = () => {
    if (action === 'goHome') {
      navigation.replace('Home');
      return;
    }

    if (action === 'goLogin') {
      navigation.replace('Login');
      return;
    }

    if (action === 'goEmailVerification') {
      navigation.replace('EmailVerification');
    }

    if (action === 'goPhoneVerification') {
      navigation.replace('PhoneVerification');
    }
    if (action === 'goForgotPassword') {
      navigation.replace('ForgotPassword');
      return;
    }
    if (action === 'goTrips') {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Home',
            params: {
              screen: 'TripsTab',
            },
          },
        ],
      });
      return;
    }



  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.content}>
          <View
            style={[
              styles.iconCircle,
              {
                borderColor: isSuccess ? colors.success : colors.danger,
              },
            ]}
          >
            <FontAwesome
              name={isSuccess ? 'check' : 'times'}
              size={42}
              color={isSuccess ? colors.success : colors.danger}
            />
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <AppButton title={buttonText} onPress={handleContinue} />
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingMedium,
    color: colors.black,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
});