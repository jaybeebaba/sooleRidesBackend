import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { cancelBooking } from '../../api/bookings.api';
import { getRideById } from '../../api/rides.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Ride } from '../../types/ride.types';

type Props = NativeStackScreenProps<RootStackParamList, 'RideDetails'>;



export function RideDetailsScreen({ navigation, route }: Props) {
  const { rideId, bookingId, bookingStatus, totalAmount, review } = route.params;

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  const isFromMyTrips = Boolean(bookingId);
  const isCompleted = bookingStatus === 'COMPLETED';

  const isCancelled =
    bookingStatus === 'PASSENGER_CANCELLED' ||
    bookingStatus === 'DRIVER_CANCELLED';

  const canPay = bookingStatus === 'PAYMENT_PENDING';
  const canCancel = Boolean(bookingId) && !isCompleted && !isCancelled;
  const canReview = isCompleted && !review;

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const data = await getRideById(rideId);
        setRide(data);
      } catch (error) {
        console.log('GET RIDE DETAILS ERROR:', error);
        Alert.alert('Error', 'Could not load ride details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [rideId]);

  const handleCancelBooking = async () => {
    if (!bookingId) return;

    try {
      await cancelBooking(bookingId);

      Alert.alert(
        'Booking Cancelled',
        'Your booking has been cancelled successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
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
              }),
          },
        ],
      );
    } catch (error: any) {
      console.log('CANCEL BOOKING ERROR:', error?.response?.data || error);

      Alert.alert(
        'Cancellation Failed',
        error?.response?.data?.message ||
          'Could not cancel booking. Please try again.',
      );
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

  const driverName = ride.driver?.fullName || 'SooleRides Driver';

  const vehicleName = [
    ride.vehicle?.brand,
    ride.vehicle?.model,
    ride.vehicle?.color,
  ]
    .filter(Boolean)
    .join(' ');

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
          activeOpacity={0.8}
        >
          <FontAwesome name="chevron-left" size={16} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.title}>
          {isCompleted ? 'Completed Trip' : 'Ride Details'}
        </Text>

        {isFromMyTrips && bookingStatus && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              Status: {bookingStatus.replaceAll('_', ' ')}
            </Text>
          </View>
        )}

        <View style={styles.rideCard}>
          <View style={styles.driverAvatar}>
            <FontAwesome name="user" size={22} color={colors.white} />
          </View>

          <View style={styles.driverRow}>
            <Text style={styles.driverName}>{driverName}</Text>
            <FontAwesome name="check-circle" size={16} color={colors.success} />
          </View>

          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleText}>
              {vehicleName || 'Vehicle details unavailable'}
              {ride.vehicle?.plateNumber ? ` • ${ride.vehicle.plateNumber}` : ''}
            </Text>

            <Text style={styles.ratingText}>★ New driver</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailBlock}>
            <View style={styles.detailTitleRow}>
              <FontAwesome name="map-marker" size={14} color={colors.gray} />
              <Text style={styles.detailTitle}>Pick Up</Text>
            </View>

            <Text style={styles.detailText}>{ride.origin}</Text>
            <Text style={styles.detailSubText}>
              Time: {new Date(ride.departureTime).toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailBlock}>
            <View style={styles.detailTitleRow}>
              <FontAwesome name="map-marker" size={14} color={colors.gray} />
              <Text style={styles.detailTitle}>Drop Off</Text>
            </View>

            <Text style={styles.detailText}>{ride.destination}</Text>

            {ride.estimatedArrivalTime && (
              <Text style={styles.detailSubText}>
                Estimated Arrival:{' '}
                {new Date(ride.estimatedArrivalTime).toLocaleString()}
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Available Seats</Text>
            <Text style={styles.summaryValue}>
              {ride.availableSeats} of {ride.totalSeats}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price Per Seat</Text>
            <Text style={styles.amount}>₦{ride.pricePerSeat}</Text>
          </View>

          {isFromMyTrips && totalAmount !== undefined && (
            <>
              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Booking Amount</Text>
                <Text style={styles.amount}>₦{totalAmount}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.actionContainer}>
          {isFromMyTrips ? (
            <>
              {isCompleted && (
                <>
                  {canReview && (
                    <AppButton
                      title="Leave Review"
                      onPress={() => {
                        if (!bookingId || !ride.driver?.id) {
                          Alert.alert(
                            'Review unavailable',
                            'Could not find review details.',
                          );
                          return;
                        }

                        navigation.navigate('LeaveReview', {
                          bookingId,
                          revieweeId: ride.driver.id,
                          revieweeName: ride.driver.fullName || 'Driver',
                        });
                      }}
                    />
                  )}

                  {review && (
                    <View style={styles.reviewCard}>
                      <Text style={styles.reviewTitle}>Your Review</Text>

                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesome
                            key={star}
                            name={star <= review.rating ? 'star' : 'star-o'}
                            size={18}
                            color={colors.primary}
                          />
                        ))}
                      </View>

                      <Text style={styles.reviewComment}>
                        {review.comment || 'No comment provided.'}
                      </Text>

                      <Text style={styles.reviewDate}>
                        Reviewed on{' '}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() =>
                      Alert.alert('Coming Soon', 'Reports will be added later.')
                    }
                  >
                    <Text style={styles.secondaryButtonText}>Report Issue</Text>
                  </TouchableOpacity>
                </>
              )}

              {!isCompleted && canPay && bookingId && (
                <View style={styles.actionSpacing}>
                  <AppButton
                    title="Pay Now"
                    onPress={() =>
                      navigation.navigate('Payment', {
                        bookingId,
                        amount: totalAmount || 0,
                      })
                    }
                  />
                </View>
              )}

              {!isCompleted && canCancel && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
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
                          onPress: handleCancelBooking,
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.cancelText}>Cancel Booking</Text>
                </TouchableOpacity>
              )}

              {isCancelled && (
                <Text style={styles.infoText}>
                  This booking has been cancelled.
                </Text>
              )}
            </>
          ) : (
            <AppButton
              title="Book Ride"
              onPress={() =>
                navigation.navigate('BookingConfirmation', {
                  rideId: ride.id,
                })
              }
            />
          )}
        </View>
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headingMedium,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statusBadge: {
    alignSelf: 'center',
    backgroundColor: colors.black,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    textTransform: 'capitalize',
  },
  rideCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  driverAvatar: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  driverName: {
    ...typography.caption,
    color: colors.black,
    textAlign: 'center',
  },
  vehicleRow: {
    marginTop: spacing.xs,
  },
  vehicleText: {
    ...typography.body,
    color: colors.black,
    textAlign: 'center',
  },
  ratingText: {
    ...typography.body,
    color: colors.black,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  detailBlock: {
    gap: spacing.xs,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailTitle: {
    ...typography.caption,
    color: colors.black,
  },
  detailText: {
    ...typography.body,
    color: colors.black,
  },
  detailSubText: {
    ...typography.body,
    color: colors.gray,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.black,
  },
  summaryValue: {
    ...typography.caption,
    color: colors.black,
  },
  amount: {
    ...typography.caption,
    color: colors.primary,
  },
  actionContainer: {
    marginTop: spacing.lg,
  },
  actionSpacing: {
    marginBottom: spacing.md,
  },
  cancelButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.caption,
    color: colors.danger,
  },
  secondaryButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.caption,
    color: colors.black,
  },
  reviewCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewTitle: {
    ...typography.caption,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  reviewComment: {
    ...typography.body,
    color: colors.black,
  },
  reviewDate: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray,
  },
});