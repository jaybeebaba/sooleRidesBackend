import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';

import { getMyBookings, cancelBooking } from '../../api/bookings.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Booking = {
  id: string;
  status: string;
  seatsBooked: number;
  totalAmount: number;
  ride?: {
    id: string;
    origin: string;
    destination: string;
    departureTime: string;
  };
};

export function MyTripsScreen() {
  const navigation = useNavigation<any>();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const data = await getMyBookings();
      setBookings(data);
    } catch (error) {
      console.log('GET MY BOOKINGS ERROR:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
  Alert.alert(
    'Cancel Booking',
    'This action cannot be undone. Are you sure you want to cancel this booking?',
    [
      {
        text: 'Keep Booking',
        style: 'cancel',
      },
      {
        text: 'Cancel Booking',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelBooking(bookingId);
            await fetchBookings();
          } catch (error) {
            console.log('CANCEL BOOKING ERROR:', error);

            Alert.alert(
              'Cancellation Failed',
              'Could not cancel booking. Please try again.',
            );
          }
        },
      },
    ],
  );
};

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, []),
  );

  return (
    <AppScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>My Trips</Text>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!loading && bookings.length === 0 && (
          <View style={styles.emptyCard}>
            <FontAwesome name="car" size={28} color={colors.gray} />

            <Text style={styles.emptyTitle}>No trips yet</Text>

            <Text style={styles.emptyText}>
              Your booked rides will appear here.
            </Text>
          </View>
        )}

        {!loading &&
          bookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.tripCard}
              activeOpacity={0.85}
              onPress={() => {
                if (booking.ride?.id) {
                  navigation.navigate('RideDetails', {
                    rideId: booking.ride.id,
                    bookingId: booking.id,
                    bookingStatus: booking.status,
                    totalAmount: booking.totalAmount,
                  });
                }
              }}
            >
              <View style={styles.tripHeader}>
                <Text style={styles.route}>
                  {booking.ride?.origin || 'Origin'} →{' '}
                  {booking.ride?.destination || 'Destination'}
                </Text>
                <Text style={styles.status}>{booking.status}</Text>
              </View>

              {booking.ride?.departureTime && (
                <Text style={styles.meta}>
                  {new Date(booking.ride.departureTime).toLocaleString()}
                </Text>
              )}

              <Text style={styles.meta}>
                {booking.seatsBooked} seat(s) • ₦{booking.totalAmount}
              </Text>
              {booking.status !== 'COMPLETED' &&
                booking.status !== 'PASSENGER_CANCELLED' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelBooking(booking.id)}
                  >
                    <Text style={styles.cancelText}>Cancel Booking</Text>
                  </TouchableOpacity>
                )}
              {booking.status === 'PAYMENT_PENDING' && (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() =>
                    navigation.navigate('Payment', {
                      bookingId: booking.id,
                      amount: booking.totalAmount,
                    })
                  }
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>


          ))}
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
  title: {
    ...typography.headingLarge,
    color: colors.black,
    marginBottom: spacing.lg,
  },
  center: {
    marginTop: spacing.xl,
  },
  emptyCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.caption,
    color: colors.black,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  tripCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  route: {
    ...typography.caption,
    color: colors.black,
    flex: 1,
  },
  status: {
    ...typography.caption,
    color: colors.primary,
  },
  meta: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },

  cancelButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },

  cancelText: {
    ...typography.caption,
    color: colors.danger,
  },

  payButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },

  payButtonText: {
    ...typography.caption,
    color: colors.white,
  },
});