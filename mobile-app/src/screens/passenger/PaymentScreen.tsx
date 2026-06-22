import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

export function PaymentScreen({ navigation, route }: Props) {
  const { bookingId, amount } = route.params;

  const goToTrips = () => {
    navigation.replace('AuthStatus', {
      type: 'success',
      title: 'Booking Saved',
      message: 'Your booking has been saved. You can manage it from My Trips.',
      buttonText: 'View Trips',
      action: 'goTrips',
    });
  };

  const handlePayNow = () => {
    console.log('PAY NOW BOOKING:', bookingId);

    Alert.alert(
      'Payment Coming Soon',
      'Online payment will be connected later. For now, this booking will be saved.',
      [{ text: 'OK', onPress: goToTrips }],
    );
  };

  const handlePayLater = () => {
    goToTrips();
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={22} color={colors.black} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <FontAwesome name="credit-card" size={36} color={colors.primary} />
          </View>

          <Text style={styles.title}>Payment</Text>

          <Text style={styles.description}>
            Your booking has been created. You can pay now or pay later from My
            Trips.
          </Text>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amount}>₦{amount}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <AppButton title="Pay Now" onPress={handlePayNow} />

          <TouchableOpacity onPress={handlePayLater} activeOpacity={0.8}>
            <Text style={styles.payLater}>Pay Later</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingLarge,
    color: colors.black,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  amountCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  amountLabel: {
    ...typography.body,
    color: colors.gray,
  },
  amount: {
    ...typography.headingLarge,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
  payLater: {
    ...typography.caption,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});