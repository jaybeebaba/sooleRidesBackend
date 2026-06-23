import { EmptyState } from '../../components/shared/EmptyState';
import { HomeHeader } from '../../components/shared/HomeHeader';
import { VerificationCard } from '../../components/shared/VerificationCard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getMyBookings } from '../../api/bookings.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import { useAuthStore } from '../../store/auth.store';
import { useRideSearchStore } from '../../store/rideSearch.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Booking } from '../../types/booking.types';
import { PopularRoute } from '../../types/ride.types';
import { getPopularRoutes } from '../../api/rides.api';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { FontAwesome } from '@expo/vector-icons';
import { NotificationsModal } from '../../components/shared/NotificationsModal';

export function PassengerHomeScreen() {
  const navigation = useNavigation<any>();
  const currentLocation = useCurrentLocation();



  const user = useAuthStore((state) => state.user);
  const setSearchParams = useRideSearchStore((state) => state.setSearchParams);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState('1');
  const [recentCompletedRides, setRecentCompletedRides] = useState<Booking[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([]);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const isFullyVerified = Boolean(
    user?.isEmailVerified &&
    user?.isPhoneVerified &&
    user?.isIdentityVerified &&
    user?.isFaceVerified,
  );

  const fetchRecentCompletedRides = async () => {
    if (!isFullyVerified) {
      setRecentCompletedRides([]);
      return;
    }

    try {
      const response = await getMyBookings(1);

      const completed = response.data
        .filter((booking: Booking) => booking.status === 'COMPLETED')
        .slice(0, 5);

      setRecentCompletedRides(completed);
    } catch (error: any) {
      console.log('RECENT COMPLETED RIDES ERROR:', error?.response?.data || error);
    }
  };

  const fetchPopularRoutes = async () => {
    try {
      const data = await getPopularRoutes();
      setPopularRoutes(data);
    } catch (error) {
      console.log('POPULAR ROUTES ERROR:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecentCompletedRides();
      fetchPopularRoutes()
    }, []),
  );

  const handleSwapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSearch = () => {
    const cleanOrigin = origin.trim();
    const cleanDestination = destination.trim();
    const cleanDate = date.trim();
    const cleanSeats = seats.trim();

    if (!cleanOrigin || !cleanDestination) {
      Alert.alert('Missing route', 'Please enter both departure and destination.');
      return;
    }

    if (cleanSeats && Number(cleanSeats) < 1) {
      Alert.alert('Invalid seats', 'Seats must be at least 1.');
      return;
    }

    setSearchParams({
      origin: cleanOrigin,
      destination: cleanDestination,
      date: cleanDate || undefined,
      seats: cleanSeats ? Number(cleanSeats) : undefined,
    });

    navigation.navigate('SearchTab');
  };

  return (
    <AppScreen>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HomeHeader
          fullName={user?.fullName}
          imageUrl={undefined}
          location={currentLocation}
          notificationCount={0}
          onNotificationPress={() => setNotificationsVisible(true)}
          onAvatarPress={() => navigation.navigate("ProfileTab")}
        />

        <NotificationsModal
          visible={notificationsVisible}
          onClose={() => setNotificationsVisible(false)}
        />

        <VerificationCard
          visible={!isFullyVerified}
          onPress={() => navigation.navigate('Verification')}
        />

        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <View style={styles.compactField}>
              <Text style={styles.fieldLabel}>From</Text>
              <TextInput
                placeholder="Departure"
                placeholderTextColor={colors.gray}
                value={origin}
                onChangeText={setOrigin}
                style={styles.fieldInput}
              />
            </View>

            <TouchableOpacity
              style={styles.swapButton}
              onPress={handleSwapLocations}
              activeOpacity={0.8}
            >
              <FontAwesome name="exchange" size={16} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.compactField}>
              <Text style={styles.fieldLabel}>To</Text>
              <TextInput
                placeholder="Destination"
                placeholderTextColor={colors.gray}
                value={destination}
                onChangeText={setDestination}
                style={styles.fieldInput}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.searchRow}>
            <View style={styles.compactField}>
              <Text style={styles.fieldLabel}>Date</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.gray}
                value={date}
                onChangeText={setDate}
                style={styles.fieldInput}
              />
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.compactField}>
              <Text style={styles.fieldLabel}>Seats</Text>
              <TextInput
                placeholder="1"
                placeholderTextColor={colors.gray}
                value={seats}
                onChangeText={setSeats}
                keyboardType="number-pad"
                style={styles.fieldInput}
              />
            </View>
          </View>

          <View style={styles.searchButton}>
            <AppButton title="Search Rides" onPress={handleSearch} />
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={handleSearch}>
            <FontAwesome name="car" size={20} color={colors.primary} />
            <Text style={styles.actionTitle}>Book a Ride</Text>
            <Text style={styles.actionText}>Find available rides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SavedTab')}
          >
            <FontAwesome name="bookmark" size={20} color={colors.primary} />
            <Text style={styles.actionTitle}>Saved Routes</Text>
            <Text style={styles.actionText}>View saved routes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('EmergencyContacts')}
          >
            <FontAwesome name="phone" size={20} color={colors.primary} />
            <Text style={styles.actionTitle}>Emergency</Text>
            <Text style={styles.actionText}>Manage contacts</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Routes</Text>
          <Text style={styles.viewAll}>View all</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {popularRoutes.map((route) => (
            <TouchableOpacity
              key={`${route.origin}-${route.destination}`}
              style={styles.routeCard}
              onPress={() => {
                setOrigin(route.origin);
                setDestination(route.destination);
              }}
            >
              <Text style={styles.routeTitle}>
                {route.origin} → {route.destination}
              </Text>

              <Text style={styles.routePrice}>
                From ₦{route.averagePrice.toLocaleString()}
              </Text>

            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Completed Rides</Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('TripsTab', {
                statusFilter: 'COMPLETED',
              })
            }
          >
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {recentCompletedRides.length === 0 ? (
          <EmptyState
            icon="car"
            title="No completed rides yet"
            message="Your completed trips will appear here."
          />
        ) : (
          recentCompletedRides.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.rideCard}
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
              <Text style={styles.rideTitle}>
                {booking.ride?.origin || 'Origin'} →{' '}
                {booking.ride?.destination || 'Destination'}
              </Text>

              <Text style={styles.rideMeta}>
                {booking.ride?.departureTime
                  ? new Date(booking.ride.departureTime).toLocaleString()
                  : 'Date unavailable'}
              </Text>

              <Text style={styles.rideMeta}>
                {booking.seatsBooked} seat(s) • ₦{booking.totalAmount}
              </Text>
            </TouchableOpacity>
          ))
        )}
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
  searchCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactField: {
    flex: 1,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: 2,
  },
  fieldInput: {
    ...typography.body,
    color: colors.black,
    paddingVertical: 2,
    minHeight: 32,
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  verticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  searchButton: {
    marginTop: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.sm,
  },
  actionTitle: {
    ...typography.caption,
    color: colors.black,
    marginTop: spacing.sm,
  },
  actionText: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.black,
  },
  viewAll: {
    ...typography.caption,
    color: colors.primary,
  },
  routeCard: {
    width: 130,
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  routeTitle: {
    ...typography.caption,
    color: colors.white,
  },
  routePrice: {
    ...typography.body,
    color: colors.lightGray,
    marginTop: spacing.xs,
  },
  routeTrips: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  rideCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rideTitle: {
    ...typography.caption,
    color: colors.black,
  },
  rideMeta: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },
});