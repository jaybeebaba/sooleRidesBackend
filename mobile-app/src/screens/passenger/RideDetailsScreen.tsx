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
    brand: string;
    model: string;
    color: string;
    plateNumber: string;
  };
};

export function RideDetailsScreen({ navigation, route }: Props) {
  const { rideId } = route.params;

  const [ride, setRide] = useState<RideDetails | null>(null);
  const [loading, setLoading] = useState(true);

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

        <Text style={styles.title}>Ride Details</Text>

        <View style={styles.card}>
          <Text style={styles.route}>
            {ride.origin} → {ride.destination}
          </Text>

          <Text style={styles.meta}>
            Departure: {new Date(ride.departureTime).toLocaleString()}
          </Text>

          {ride.estimatedArrivalTime && (
            <Text style={styles.meta}>
              Arrival: {new Date(ride.estimatedArrivalTime).toLocaleString()}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Seats & Price</Text>

          <Text style={styles.meta}>
            Available seats: {ride.availableSeats} of {ride.totalSeats}
          </Text>

          <Text style={styles.price}>₦{ride.pricePerSeat} per seat</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Driver</Text>

          <Text style={styles.meta}>
            {ride.driver?.fullName || 'Driver information unavailable'}
          </Text>

          {ride.driver?.phone && (
            <Text style={styles.meta}>{ride.driver.phone}</Text>
          )}
        </View>

        {ride.vehicle && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Vehicle</Text>

            <Text style={styles.meta}>
              {ride.vehicle.color} {ride.vehicle.brand} {ride.vehicle.model}
            </Text>

            <Text style={styles.meta}>Plate: {ride.vehicle.plateNumber}</Text>
          </View>
        )}

        <AppButton
          title="Book Ride"
          onPress={() =>
            navigation.navigate('BookingConfirmation', {
              rideId: ride.id,
            })
          }
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
  price: {
    ...typography.headingMedium,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray,
  },
});