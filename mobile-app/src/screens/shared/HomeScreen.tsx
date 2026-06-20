import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const logoutUser = useAuthStore((state) => state.logoutUser);

  const handleLogout = async () => {
    await logoutUser();
    navigation.replace('Login');
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to SooleRides</Text>

        <Text style={styles.subtitle}>
          Logged in as {user?.fullName || user?.email || 'User'}
        </Text>

        <Text style={styles.role}>Role: {user?.role || 'N/A'}</Text>

        <AppButton title="Logout" onPress={handleLogout} style={styles.button} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...typography.headingMedium,
    color: colors.black,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  role: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.xl,
  },
});