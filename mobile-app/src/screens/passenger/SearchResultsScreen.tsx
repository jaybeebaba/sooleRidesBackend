import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { searchRides } from '../../api/rides.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { useRideSearchStore } from '../../store/rideSearch.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Ride = {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
};

export function SearchResultsScreen() {
  const navigation = useNavigation<any>();
  const searchParams = useRideSearchStore((state) => state.searchParams);

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchRides = async () => {
        if (!searchParams) return;

        try {
          setLoading(true);

          const data = await searchRides(searchParams);
          setRides(data);
        } catch (error) {
          console.log('SEARCH RIDES ERROR:', error);
          setRides([]);
        } finally {
          setLoading(false);
        }
      };

      fetchRides();
    }, [searchParams]),
  );

  return (
    <AppScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Search Results</Text>

        {searchParams && (
          <Text style={styles.subtitle}>
            {searchParams.origin} → {searchParams.destination}
          </Text>
        )}

        {loading && <ActivityIndicator color={colors.primary} />}

        {!loading && rides.length === 0 && (
          <Text style={styles.emptyText}>No rides found.</Text>
        )}

        {!loading &&
          rides.map((ride) => (
            <TouchableOpacity
              key={ride.id}
              style={styles.rideCard}
              onPress={() =>
                navigation.navigate('RideDetails', {
                  rideId: ride.id,
                })
              }
            >
              <View style={styles.routeRow}>
                <FontAwesome name="car" size={18} color={colors.primary} />
                <Text style={styles.rideTitle}>
                  {ride.origin} → {ride.destination}
                </Text>
              </View>

              <Text style={styles.rideMeta}>
                {new Date(ride.departureTime).toLocaleString()}
              </Text>

              <Text style={styles.rideMeta}>
                {ride.availableSeats} seats available • ₦{ride.pricePerSeat}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    ...typography.headingLarge,
    color: colors.black,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.lg,
  },
  rideCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideTitle: {
    ...typography.caption,
    color: colors.black,
    marginLeft: spacing.sm,
  },
  rideMeta: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },
});