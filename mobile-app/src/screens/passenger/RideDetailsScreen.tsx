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

import { getRideById } from '../../api/rides.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { cancelBooking } from '../../api/bookings.api';

type Props = NativeStackScreenProps<RootStackParamList, 'RideDetails'>;

type RideDetails = {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  estimatedArrivalTime?: string;
  pricePerSeat: number;
  availableSeats: number;
  totalSeats: number;
  driver?: {
    fullName?: string;
    phone?: string;
  };
  vehicle?: {
    brand?: string;
    model?: string;
    color?: string;
    plateNumber?: string;
  };
};

export function RideDetailsScreen({ navigation, route }: Props) {
 
  const [ride, setRide] = useState<RideDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const { rideId, bookingId, bookingStatus, totalAmount } = route.params;

  const isFromMyTrips = Boolean(bookingId);
  const canPay = bookingStatus === 'PAYMENT_PENDING';
  const canCancel =
    bookingStatus !== 'COMPLETED' &&
    bookingStatus !== 'PASSENGER_CANCELLED' &&
    bookingStatus !== 'DRIVER_CANCELLED';


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
          onPress: () => navigation.goBack(),
        },
      ],
    );
  } catch (error) {
    console.log('CANCEL BOOKING ERROR:', error);

    Alert.alert(
      'Cancellation Failed',
      'Could not cancel booking. Please try again.',
    );
  }
};
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

        <Text style={styles.title}>Ride Details</Text>

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
        </View>

        <View style={styles.buttonWrapper}>
          {isFromMyTrips ? (
  <View>
    {canPay && (
      <AppButton
        title="Pay Now"
        onPress={() =>
          navigation.navigate('Payment', {
            bookingId: bookingId!,
            amount: totalAmount || 0,
          })
        }
      />
    )}

    {canCancel && (
      <TouchableOpacity
  style={styles.cancelButton}
  onPress={() => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
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
  </View>
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
  buttonWrapper: {
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray,
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

actionContainer: {
  marginTop: spacing.lg,
},

actionSpacing: {
  marginBottom: spacing.md,
},

statusBadge: {
  alignSelf: 'flex-start',
  backgroundColor: colors.lightGray,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 8,
  marginTop: spacing.sm,
},

statusText: {
  ...typography.body,
  color: colors.black,
},
});