import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
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

import { searchRides } from '../../api/rides.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import { useRideSearchStore } from '../../store/rideSearch.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Ride } from '../../types/ride.types';

export function SearchResultsScreen() {
  const navigation = useNavigation<any>();

  const searchParams = useRideSearchStore((state) => state.searchParams);
  const setSearchParams = useRideSearchStore((state) => state.setSearchParams);

  const [origin, setOrigin] = useState(searchParams?.origin || '');
  const [destination, setDestination] = useState(searchParams?.destination || '');
  const [date, setDate] = useState(searchParams?.date || '');
  const [seats, setSeats] = useState(
    searchParams?.seats ? String(searchParams.seats) : '1',
  );

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRides = async () => {
    if (!searchParams) return;

    try {
      setLoading(true);

      const data = await searchRides(searchParams);
      setRides(data);
    } catch (error: any) {
      console.log('SEARCH RIDES ERROR:', error?.response?.data || error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setOrigin(searchParams?.origin || '');
      setDestination(searchParams?.destination || '');
      setDate(searchParams?.date || '');
      setSeats(searchParams?.seats ? String(searchParams.seats) : '1');

      fetchRides();
    }, [searchParams]),
  );

  const handleSwapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSearch = async () => {
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

    const params = {
      origin: cleanOrigin,
      destination: cleanDestination,
      date: cleanDate || undefined,
      seats: cleanSeats ? Number(cleanSeats) : undefined,
    };

    setSearchParams(params);

    try {
      setLoading(true);

      const data = await searchRides(params);
      setRides(data);
    } catch (error: any) {
      console.log('SEARCH RIDES ERROR:', error?.response?.data || error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <FontAwesome name="chevron-left" size={16} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationButton}>
            <FontAwesome name="bell-o" size={20} color={colors.black} />
          </TouchableOpacity>
        </View>

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
              <Text style={styles.fieldLabel}>Passengers</Text>
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
            <AppButton title="Search Rides" onPress={handleSearch} loading={loading} />
          </View>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>Available Rides</Text>
          <Text style={styles.resultsCount}>
            {rides.length} {rides.length === 1 ? 'Ride' : 'Rides'}
          </Text>
        </View>

        {loading && (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!loading && rides.length === 0 && (
          <View style={styles.emptyCard}>
            <FontAwesome name="car" size={28} color={colors.gray} />
            <Text style={styles.emptyTitle}>No rides found</Text>
            <Text style={styles.emptyText}>
              Try changing your route, date, or passenger count.
            </Text>
          </View>
        )}

        {!loading &&
          rides.map((ride) => (
            <View key={ride.id} style={styles.rideCard}>
              <View style={styles.rideTopRow}>
                <View style={styles.driverAvatar}>
                  <FontAwesome name="user" size={16} color={colors.white} />
                </View>

                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>
                    {ride.driver?.fullName || 'SooleRides Driver'}
                  </Text>

                  <Text style={styles.vehicleText}>
                    {ride.vehicle?.brand || 'Vehicle'} {ride.vehicle?.model || ''}
                    {ride.vehicle?.plateNumber ? ` • ${ride.vehicle.plateNumber}` : ''}
                  </Text>
                </View>

                <View style={styles.priceBox}>
                  <Text style={styles.price}>₦{ride.pricePerSeat}</Text>
                  <Text style={styles.priceLabel}>per seat</Text>
                </View>
              </View>

              <View style={styles.rideMetaRow}>
                <FontAwesome name="calendar" size={13} color={colors.gray} />
                <Text style={styles.rideMeta}>
                  {new Date(ride.departureTime).toLocaleString()}
                </Text>
              </View>

              <View style={styles.rideMetaRow}>
                <FontAwesome name="map-marker" size={14} color={colors.gray} />
                <Text style={styles.rideMeta}>
                  {ride.origin} → {ride.destination}
                </Text>
              </View>

              <View style={styles.rideBottomRow}>
                <Text style={styles.seatsText}>
                  {ride.availableSeats} seat(s) left
                </Text>

                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() =>
                    navigation.navigate('RideDetails', {
                      rideId: ride.id,
                    })
                  }
                >
                  <Text style={styles.detailsButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
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
    minHeight: 30,
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
    height: 36,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  searchButton: {
    marginTop: spacing.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.black,
  },
  resultsCount: {
    ...typography.caption,
    color: colors.gray,
  },
  loadingWrapper: {
    paddingVertical: spacing.xl,
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
  rideCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rideTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    ...typography.caption,
    color: colors.black,
  },
  vehicleText: {
    ...typography.body,
    color: colors.gray,
    marginTop: 2,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  price: {
    ...typography.caption,
    color: colors.black,
  },
  priceLabel: {
    ...typography.body,
    color: colors.gray,
  },
  rideMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  rideMeta: {
    ...typography.body,
    color: colors.gray,
    marginLeft: spacing.sm,
  },
  rideBottomRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatsText: {
    ...typography.body,
    color: colors.gray,
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  detailsButtonText: {
    ...typography.caption,
    color: colors.black,
  },
});