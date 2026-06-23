import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { cancelBooking, getMyBookings } from '../../api/bookings.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { EmptyState } from '../../components/shared/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { Booking } from '../../types/booking.types';

export function MyTripsScreen() {
  const navigation = useNavigation<any>();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchBookings = async (pageNumber = 1, append = false) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getMyBookings(pageNumber, 10);

      setBookings((prev) =>
        append ? [...prev, ...response.data] : response.data,
      );

      setHasNextPage(Boolean(response.meta?.hasNextPage));
      setPage(pageNumber);
    } catch (error: any) {
      console.log('GET MY BOOKINGS ERROR:', error?.response?.data || error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreBookings = () => {
    if (loading || loadingMore || !hasNextPage) return;

    fetchBookings(page + 1, true);
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
              await fetchBookings(1, false);
            } catch (error: any) {
              console.log('CANCEL BOOKING ERROR:', error?.response?.data || error);

              Alert.alert(
                'Cancellation Failed',
                error?.response?.data?.message ||
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
      fetchBookings(1, false);
    }, []),
  );

  const renderBooking = ({ item: booking }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.tripCard}
      activeOpacity={0.85}
      onPress={() => {
        if (booking.ride?.id) {
          navigation.navigate('RideDetails', {
            rideId: booking.ride.id,
            bookingId: booking.id,
            bookingStatus: booking.status,
            totalAmount: booking.totalAmount,
            review: booking.review,
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
  );

  return (
    <AppScreen>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreBookings}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={<Text style={styles.title}>My Trips</Text>}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="car"
              title="No trips yet"
              message="Your booked rides will appear here."
            />
          ) : null
        }
        ListFooterComponent={
          <>
            {loading && (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}

            {loadingMore && (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
          </>
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
  footerLoader: {
    paddingVertical: spacing.md,
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