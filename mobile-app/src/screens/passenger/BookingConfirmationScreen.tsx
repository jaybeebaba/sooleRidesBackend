import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { createBooking } from '../../api/bookings.api';
import { getRideById } from '../../api/rides.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

type RideDetails = {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
};

export function BookingConfirmationScreen({ navigation, route }: Props) {
  const { rideId } = route.params;

  const [ride, setRide] = useState<RideDetails | null>(null);
  const [seatsBooked, setSeatsBooked] = useState('1');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const totalAmount = useMemo(() => {
    if (!ride) return 0;

    const seats = Number(seatsBooked) || 0;
    return ride.pricePerSeat * seats;
  }, [ride, seatsBooked]);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const data = await getRideById(rideId);
        setRide(data);
      } catch (error) {
        console.log('BOOKING RIDE LOAD ERROR:', error);
        Alert.alert('Error', 'Could not load ride details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [rideId]);

  const handleConfirmBooking = async () => {
    if (!ride) return;

    const seats = Number(seatsBooked);

    if (!seats || seats < 1) {
      Alert.alert('Invalid seats', 'Please enter at least 1 seat.');
      return;
    }

    if (seats > ride.availableSeats) {
      Alert.alert(
        'Not enough seats',
        `Only ${ride.availableSeats} seat(s) are available.`,
      );
      return;
    }

    try {
      setBookingLoading(true);
      const booking = await createBooking({
        rideId: ride.id,
        seatsBooked: seats,
      });

      navigation.replace('Payment', {
        bookingId: booking.id,
        amount: booking.totalAmount,
      });
    } catch (error: any) {
      console.log('CREATE BOOKING ERROR:', error?.response?.data || error);

      navigation.replace('AuthStatus', {
        type: 'error',
        title: 'Booking Failed',
        message:
          error?.response?.data?.message ||
          'Could not create your booking. Please try again.',
        buttonText: 'Back Home',
        action: 'goHome',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppScreen>
    );
  }

  if (!ride) {
    return (
      <AppScreen>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Ride not found.</Text>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={22} color={colors.black} />
        </TouchableOpacity>

        <Text style={styles.title}>Confirm Booking</Text>

        <View style={styles.card}>
          <Text style={styles.route}>
            {ride.origin} → {ride.destination}
          </Text>

          <Text style={styles.meta}>
            {new Date(ride.departureTime).toLocaleString()}
          </Text>

          <Text style={styles.meta}>
            {ride.availableSeats} seat(s) available
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Seats</Text>

          <TextInput
            value={seatsBooked}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.gray}
            style={styles.input}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9]/g, '');

              if (!numericValue) {
                setSeatsBooked('');
                return;
              }

              const seats = Number(numericValue);

              if (ride && seats > ride.availableSeats) {
                Alert.alert(
                  'Seat Limit Reached',
                  `Only ${ride.availableSeats} seat(s) are available for this ride.`,
                );

                setSeatsBooked(String(ride.availableSeats));
                return;
              }

              setSeatsBooked(numericValue);
            }}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price per seat</Text>
            <Text style={styles.summaryValue}>₦{ride.pricePerSeat}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Seats booked</Text>
            <Text style={styles.summaryValue}>{seatsBooked || '0'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{totalAmount}</Text>
          </View>
        </View>

        <AppButton
          title="Confirm Booking"
          onPress={handleConfirmBooking}
          loading={bookingLoading}
        />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headingLarge,
    color: colors.black,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  route: {
    ...typography.headingMedium,
    color: colors.black,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  meta: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.black,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.gray,
  },
  summaryValue: {
    ...typography.body,
    color: colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.black,
  },
  totalValue: {
    ...typography.headingMedium,
    color: colors.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray,
  },
});